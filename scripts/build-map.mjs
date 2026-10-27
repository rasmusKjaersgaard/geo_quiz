// Builds public/map/countries-50m.json from Natural Earth 1:50m admin-0 countries.
//
// Usage: node scripts/build-map.mjs path/to/ne_50m_admin_0_countries.geojson
// (download from https://www.naturalearthdata.com or
//  https://github.com/nvkelso/natural-earth-vector/tree/master/geojson)
//
// Output format matches the `world-atlas` package (TopoJSON, object "countries",
// feature id = ISO 3166-1 numeric, properties.name), with these explicit fixes:
//   - France and Norway get their ISO numeric ids (250, 578); NE marks them -99.
//   - Kosovo has no ISO numeric code, so it gets the id "XK".
//   - Northern Cyprus is merged into Cyprus and Somaliland into Somalia.
//   - Antarctica is dropped (no countries to name there).
//   - properties.label = [lon, lat] label point, used to place micro-state markers.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { topology } from 'topojson-server';
import { mergeArcs } from 'topojson-client';

const src = process.argv[2];
if (!src) {
  console.error('Usage: node scripts/build-map.mjs ne_50m_admin_0_countries.geojson');
  process.exit(1);
}

const ID_FIXES = { FRA: '250', NOR: '578', KOS: 'XK' };
const MERGE_INTO = { CYN: 'CYP', SOL: 'SOM' }; // ADM0_A3 -> ADM0_A3
const DROP = new Set(['ATA']);

const geo = JSON.parse(readFileSync(src, 'utf8'));
const features = [];
for (const f of geo.features) {
  const p = f.properties;
  if (DROP.has(p.ADM0_A3)) continue;
  // Territories without their own ISO code (e.g. Ashmore and Cartier Is.,
  // which NE gives Australia's 036) get no id so they never light up.
  const iso = p.ISO_A3 !== '-99' && p.ISO_N3 && p.ISO_N3 !== '-99' ? p.ISO_N3 : undefined;
  features.push({
    type: 'Feature',
    id: ID_FIXES[p.ADM0_A3] ?? iso,
    properties: {
      name: p.NAME,
      a3: p.ADM0_A3,
      label: [Math.round(p.LABEL_X * 100) / 100, Math.round(p.LABEL_Y * 100) / 100],
    },
    geometry: f.geometry,
  });
}

const topo = topology({ countries: { type: 'FeatureCollection', features } }, 1e5);
const geoms = topo.objects.countries.geometries;

for (const [from, to] of Object.entries(MERGE_INTO)) {
  const a = geoms.find((g) => g.properties.a3 === to);
  const b = geoms.find((g) => g.properties.a3 === from);
  if (!a || !b) continue;
  const merged = mergeArcs(topo, [a, b]);
  a.type = merged.type;
  a.arcs = merged.arcs;
  geoms.splice(geoms.indexOf(b), 1);
}
for (const g of geoms) delete g.properties.a3;

mkdirSync('public/map', { recursive: true });
writeFileSync('public/map/countries-50m.json', JSON.stringify(topo));
console.log(`Wrote public/map/countries-50m.json (${geoms.length} features)`);
