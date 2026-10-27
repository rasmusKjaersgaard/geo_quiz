import { useEffect, useState } from 'react';
import { geoAzimuthalEqualArea, geoCentroid, geoPath } from 'd3-geo';
import { loadWorld, silhouetteGeometry, type WorldFeature } from '../lib/world';

const W = 220;
const H = 180;

/** A country's outline, centred and scaled to fit. */
export function Silhouette({ mapId, label }: { mapId: string; label: string }) {
  const [world, setWorld] = useState<WorldFeature[] | null>(null);
  useEffect(() => {
    let alive = true;
    loadWorld()
      .then((w) => alive && setWorld(w))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  const f = world?.find((x) => String(x.id) === mapId);
  if (!f) return <svg className="silhouette" viewBox={`0 0 ${W} ${H}`} aria-hidden />;

  const shape = silhouetteGeometry(f);
  const [lon, lat] = geoCentroid(shape);
  const projection = geoAzimuthalEqualArea()
    .rotate([-lon, -lat])
    .fitExtent(
      [
        [8, 8],
        [W - 8, H - 8],
      ],
      shape,
    );
  const d = geoPath(projection)(shape) ?? '';
  return (
    <svg className="silhouette" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Outline of ${label}`}>
      <path d={d} stroke="var(--ink)" strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  );
}
