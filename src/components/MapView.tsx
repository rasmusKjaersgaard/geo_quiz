import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import { select } from 'd3-selection';
import { zoom, zoomIdentity, type ZoomBehavior } from 'd3-zoom';
import type { FeatureCollection } from 'geojson';
import { COUNTRIES } from '../data/countries';
import { loadWorld, type WorldFeature } from '../lib/world';
import { IconMinus, IconPlus, IconReset } from './Icons';

export type MapStatus = 'found' | 'missed';

const W = 960;
const MARKER_R = 3.6;
/** Countries smaller than this (in px² at full-map scale) get a circle marker. */
const MARKER_AREA = 6;
const QUIZ_MAP_IDS = new Set(COUNTRIES.map((c) => c.mapId));
const NAME_BY_MAP_ID = Object.fromEntries(COUNTRIES.map((c) => [c.mapId, c.name]));

interface Shape {
  key: string;
  mapId: string | null;
  d: string;
  marker: [number, number] | null;
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

function buildShapes(world: WorldFeature[]) {
  const fc: FeatureCollection = { type: 'FeatureCollection', features: world };
  const projection = geoNaturalEarth1().fitWidth(W, fc);
  const path = geoPath(projection);
  const [, [, y1]] = path.bounds(fc);
  const H = Math.ceil(y1) + 2;
  const shapes: Shape[] = world.map((f, i) => {
    const mapId = f.id !== undefined && QUIZ_MAP_IDS.has(String(f.id)) ? String(f.id) : null;
    const small = mapId !== null && path.area(f) < MARKER_AREA;
    const p = small ? projection(f.properties.label) : null;
    return { key: `${f.id ?? 'x'}-${i}`, mapId, d: path(f) ?? '', marker: p ? [p[0], p[1]] : null };
  });
  return { shapes, H };
}

interface Props {
  status: Record<string, MapStatus | undefined>; // keyed by mapId
  flashMapId?: string | null;
  hidden?: boolean;
}

/** World map with zoom/pan. Answered countries light up; micro-states are circles. */
export const MapView = memo(function MapView({ status, flashMapId, hidden }: Props) {
  const { world, error } = useWorld();
  const geo = useMemo(() => (world ? buildShapes(world) : null), [world]);
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);

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
        g.attr('transform', ev.transform.toString());
        g.selectAll<SVGCircleElement, unknown>('circle.marker').attr('r', MARKER_R / Math.sqrt(ev.transform.k));
      });
    svg.call(z);
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
    const s = status[mapId];
    return [s ?? '', mapId === flashMapId ? 'flash' : ''].join(' ').trim() || undefined;
  };
  const title = (mapId: string | null) => (mapId && status[mapId] ? <title>{NAME_BY_MAP_ID[mapId]}</title> : null);

  return (
    <div className={`map-wrap ${hidden ? 'hidden-mobile' : ''}`}>
      <svg ref={svgRef} className="world" viewBox={`0 0 ${W} ${geo.H}`} role="img" aria-label="World map">
        <g ref={gRef}>
          {geo.shapes.map((s) => (
            <path key={s.key} d={s.d} className={cls(s.mapId)}>
              {title(s.mapId)}
            </path>
          ))}
          {geo.shapes
            .filter((s) => s.marker)
            .map((s) => (
              <circle key={'m' + s.key} className={`marker ${cls(s.mapId) ?? ''}`} cx={s.marker![0]} cy={s.marker![1]} r={MARKER_R}>
                {title(s.mapId)}
              </circle>
            ))}
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
