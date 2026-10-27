// Checks public/map/countries-50m.json against the country list.
// (Runs in Node from the project root; excluded from the browser type-check in tsconfig.json.)
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { COUNTRIES } from './countries';

const topo = JSON.parse(readFileSync('public/map/countries-50m.json', 'utf8'));
const geoms: { id?: string; properties: { name: string; label: [number, number] } }[] = topo.objects.countries.geometries;

describe('map data', () => {
  it('has exactly one shape for every country', () => {
    const missing: string[] = [];
    const dupes: string[] = [];
    for (const c of COUNTRIES) {
      const n = geoms.filter((g) => g.id === c.mapId).length;
      if (n === 0) missing.push(c.name);
      if (n > 1) dupes.push(c.name);
    }
    expect(missing).toEqual([]);
    expect(dupes).toEqual([]);
  });
  it('gives Kosovo its explicit id and every shape a label point', () => {
    expect(geoms.find((g) => g.id === 'XK')?.properties.name).toBe('Kosovo');
    for (const g of geoms) expect(g.properties.label).toHaveLength(2);
  });
});
