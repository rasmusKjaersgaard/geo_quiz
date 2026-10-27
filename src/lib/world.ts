import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { Feature, Geometry, MultiPolygon, Polygon } from 'geojson';
import { geoArea, geoCentroid, geoDistance } from 'd3-geo';
import { asset } from '../env';

export interface WorldProps {
  name: string;
  label: [number, number];
}
export type WorldFeature = Feature<Geometry, WorldProps> & { id?: string | number };

let cache: Promise<WorldFeature[]> | null = null;

/** Loads public/map/countries-50m.json once (see scripts/build-map.mjs). */
export function loadWorld(): Promise<WorldFeature[]> {
  if (!cache) {
    cache = fetch(asset('map/countries-50m.json'))
      .then((r) => {
        if (!r.ok) throw new Error(`Map data failed to load (${r.status})`);
        return r.json();
      })
      .then((topo: Topology<{ countries: GeometryCollection<WorldProps> }>) => {
        const fc = feature(topo, topo.objects.countries);
        return fc.features.map((f) => ({ ...f, id: f.id === undefined ? undefined : String(f.id) })) as WorldFeature[];
      });
    cache.catch(() => {
      cache = null;
    });
  }
  return cache;
}

/**
 * The main landmass of a country for silhouettes: drops far-away overseas
 * territories (French Guiana for France, Hawaii for the USA) but keeps
 * nearby islands.
 */
export function silhouetteGeometry(f: WorldFeature): Feature<Polygon | MultiPolygon> {
  const g = f.geometry;
  if (g.type !== 'MultiPolygon') return f as Feature<Polygon | MultiPolygon>;
  const parts = g.coordinates.map((coords) => {
    const poly: Polygon = { type: 'Polygon', coordinates: coords };
    return { coords, area: geoArea(poly), centroid: geoCentroid(poly) };
  });
  const main = parts.reduce((a, b) => (b.area > a.area ? b : a));
  const kept = parts.filter((p) => p === main || p.area > main.area * 0.15 || geoDistance(p.centroid, main.centroid) < 0.3);
  return { type: 'Feature', properties: {}, geometry: { type: 'MultiPolygon', coordinates: kept.map((p) => p.coords) } };
}
