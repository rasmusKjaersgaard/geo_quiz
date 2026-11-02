import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { geoAzimuthalEqualArea, geoNaturalEarth1, geoPath, type GeoProjection } from 'd3-geo';
import { select } from 'd3-selection';
import { zoom, zoomIdentity, type ZoomBehavior } from 'd3-zoom';
import type { FeatureCollection, MultiPoint } from 'geojson';
import { COUNTRIES, type Continent } from '../data/countries';
import { loadWorld, type WorldFeature } from '../lib/world';
import { IconMinus, IconPlus, IconReset } from './Icons';

export type MapStatus = 'found' | 'missed';
export type MapViewName = 'world' | Continent;

const W = 960;
const MARKER_R = 3.6;
const RING_R = 13;
/** Countries smaller than this (px² at unzoomed scale) get a circle marker. */
const MARKER_AREA: Record<'world' | 'continent', number> = { world: 6, continent: 12 };
/** The current country gets a locator ring when it's smaller than this (px²). */
const RING_AREA = 600;
const ALL_QUIZ_MAP_IDS: ReadonlySet<string> = new Set(COUNTRIES.map((c) => c.mapId));
const NAME_BY_MAP_ID = Object.fromEntries(COUNTRIES.map((c) => [c.mapId, c.name]));

/**
 * Continent views: an equal-area projection centred on the continent, fitted
 * to a longitude/latitude box. Longitudes past 180 continue eastwards, so
 * Oceania can span the date line. Tweak these to reframe a continent.
 */
const CONTINENT_VIEWS: Record<Continent, { center: [number, number]; box: [[number, number], [number, number]] }> = {
  Africa: { center: [17, 2], box: [[-26, -36], [58, 38]] },
  Asia: { center: [88, 28], box: [[26, -11], [146, 55]] },
  Europe: { center: [15, 52], box: [[-24, 34], [45, 71]] },
  'North America': { center: [-88, 26], box: [[-124, 5], [-58, 52]] },
  'South America': { center: [-60, -20], box: [[-82, -56], [-34, 13]] },
  Oceania: { center: [165, -15], box: [[112, -48], [205, 15]] },
};

interface Shape {
  key: string;
  mapId: string | null;
  d: string;
  area: number;
  label: [number, number] | null;
  marker: boolean;
}

function useWorld() {
  const [world, setWorld] = useState<WorldFeature[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    loadWorld()
      .then((w) => alive && setWorld(w))
      .catch((e: Error) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, []);
  return { world, error };
}

function boxSamples([[w, s], [e, n]]: [[number, number], [number, number]]): MultiPoint {
  const pts: [number, number][] = [];
  for (let i = 0; i <= 20; i++) {
    const lon = w + ((e - w) * i) / 20;
    const lat = s + ((n - s) * i) / 20;
    pts.push([lon, s], [lon, n], [w, lat], [e, lat]);
  }
  return { type: 'MultiPoint', coordinates: pts };
}

function makeProjection(world: WorldFeature[], view: MapViewName): { projection: GeoProjection; H: number } {
  if (view === 'world') {
    const fc: FeatureCollection = { type: 'FeatureCollection', features: world };
    const projection = geoNaturalEarth1().fitWidth(W, fc);
    const [, [, y1]] = geoPath(projection).bounds(fc);
    return { projection, H: Math.ceil(y1) + 2 };
  }
  const { center, box } = CONTINENT_VIEWS[view];
  const samples = boxSamples(box);
  const projection = geoAzimuthalEqualArea()
    .rotate([-center[0], -center[1]])
    .clipAngle(100)
    .fitWidth(W, samples);
  const [[, y0], [, y1]] = geoPath(projection).bounds(samples);
  const H = Math.round(Math.min(680, Math.max(420, y1 - y0)));
  projection.fitExtent(
    [
      [8, 8],
      [W - 8, H - 8],
    ],
    samples,
  );
  return { projection, H };
}

function buildShapes(world: WorldFeature[], view: MapViewName, active: ReadonlySet<string>) {
  const { projection, H } = makeProjection(world, view);
  const path = geoPath(projection);
  const markerArea = MARKER_AREA[view === 'world' ? 'world' : 'continent'];
  const shapes: Shape[] = world.map((f, i) => {
    const mapId = f.id !== undefined && active.has(String(f.id)) ? String(f.id) : null;
    const area = path.area(f);
    const p = mapId ? projection(f.properties.label) : null;
    const label: [number, number] | null = p ? [p[0], p[1]] : null;
    return { key: `${f.id ?? 'x'}-${i}`, mapId, d: path(f) ?? '', area, label, marker: !!label && area < markerArea };
  });
  return { shapes, H };
}

interface Props {
  /** Answer state per country, keyed by mapId. */
  status: Record<string, MapStatus | undefined>;
  /** Country that just got answered (brief highlight). */
  flashMapId?: string | null;
  /** Country being asked about right now (capitals map mode). */
  currentMapId?: string | null;
  /** Which part of the world to show. */
  view?: MapViewName;
  /** Countries in play; others are drawn faded. Defaults to all 197. */
  activeMapIds?: ReadonlySet<string>;
  /** Hide on small screens (the Countries quiz has a Show map toggle). */
  hidden?: boolean;
}

/** World or continent map with zoom/pan. Answered countries light up; micro-states are circles. */
export const MapView = memo(function MapView({ status, flashMapId, currentMapId, view = 'world', activeMapIds = ALL_QUIZ_MAP_IDS, hidden }: Props) {
  const { world, error } = useWorld();
  const geo = useMemo(() => (world ? buildShapes(world, view, activeMapIds) : null), [world, view, activeMapIds]);
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const kRef = useRef(1); // current zoom level, so new circles render at the right size

  useEffect(() => {
    if (!geo || !svgRef.current || !gRef.current) return;
    const svg = select(svgRef.current);
    const g = select(gRef.current);
    const z = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 60])
      .translateExtent([
        [0, 0],
        [W, geo.H],
      ])
      // Plain mouse-wheel scrolls the page; pinch / Ctrl+wheel / buttons zoom.
      .filter((ev: Event & { button?: number; ctrlKey?: boolean; metaKey?: boolean }) =>
        ev.type === 'wheel' ? !!(ev.ctrlKey || ev.metaKey) : !ev.button,
      )
      .on('zoom', (ev) => {
        kRef.current = ev.transform.k;
        g.attr('transform', ev.transform.toString());
        g.selectAll<SVGCircleElement, unknown>('circle[data-r]').attr('r', function () {
          return Number(this.dataset.r) / Math.sqrt(ev.transform.k);
        });
      });
    svg.call(z);
    svg.call(z.transform, zoomIdentity);
    kRef.current = 1;
    zoomRef.current = z;
    return () => {
      svg.on('.zoom', null);
    };
  }, [geo]);

  const zoomBy = (k: number) => zoomRef.current && svgRef.current && zoomRef.current.scaleBy(select(svgRef.current), k);
  const reset = () => zoomRef.current && svgRef.current && zoomRef.current.transform(select(svgRef.current), zoomIdentity);

  if (error) return <div className={`map-wrap map-loading ${hidden ? 'hidden-mobile' : ''}`}>Map unavailable: {error}</div>;
  if (!geo) return <div className={`map-wrap map-loading ${hidden ? 'hidden-mobile' : ''}`}>Loading map…</div>;

  const cls = (mapId: string | null) => {
    if (!mapId) return 'other';
    const parts = [status[mapId] ?? '', mapId === currentMapId ? 'current' : '', mapId === flashMapId ? 'flash' : ''];
    return parts.join(' ').trim() || undefined;
  };
  const title = (mapId: string | null) => (mapId && status[mapId] ? <title>{NAME_BY_MAP_ID[mapId]}</title> : null);
  const scaled = (r: number) => r / Math.sqrt(kRef.current);
  const current = currentMapId ? geo.shapes.find((s) => s.mapId === currentMapId && s.label) : null;
  const ring = current && current.area < RING_AREA ? current.label : null;

  return (
    <div className={`map-wrap ${hidden ? 'hidden-mobile' : ''}`}>
      <svg ref={svgRef} className="world" viewBox={`0 0 ${W} ${geo.H}`} role="img" aria-label={view === 'world' ? 'World map' : `Map of ${view}`}>
        <g ref={gRef}>
          {geo.shapes.map((s) =>
            s.d ? (
              <path key={s.key} d={s.d} className={cls(s.mapId)}>
                {title(s.mapId)}
              </path>
            ) : null,
          )}
          {geo.shapes
            .filter((s) => s.marker)
            .map((s) => (
              <circle key={'m' + s.key} className={`marker ${cls(s.mapId) ?? ''}`} cx={s.label![0]} cy={s.label![1]} r={scaled(MARKER_R)} data-r={MARKER_R}>
                {title(s.mapId)}
              </circle>
            ))}
          {ring && (
            <g key={'ring' + currentMapId} className="locator" transform={`translate(${ring[0]} ${ring[1]})`}>
              <circle className="locator-ring" r={scaled(RING_R)} data-r={RING_R} />
            </g>
          )}
        </g>
      </svg>
      <div className="map-hint">Drag to pan · pinch or Ctrl + scroll to zoom</div>
      <div className="map-tools">
        <button type="button" className="icon-btn" onPointerDown={(e) => e.preventDefault()} onClick={() => zoomBy(1.8)} aria-label="Zoom in">
          <IconPlus />
        </button>
        <button type="button" className="icon-btn" onPointerDown={(e) => e.preventDefault()} onClick={() => zoomBy(1 / 1.8)} aria-label="Zoom out">
          <IconMinus />
        </button>
        <button type="button" className="icon-btn" onPointerDown={(e) => e.preventDefault()} onClick={reset} aria-label="Reset zoom">
          <IconReset />
        </button>
      </div>
    </div>
  );
});
