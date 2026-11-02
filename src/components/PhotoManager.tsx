import { useCallback, useEffect, useState, type DragEvent } from 'react';
import { backend } from '../backend';
import { PEOPLE, PERSON_CATEGORIES, type Person } from '../data/people';
import { prepareImage } from '../lib/image';

type Status = { kind: 'busy' } | { kind: 'error'; text: string } | { kind: 'done' };

/** Settings section: upload, replace or remove the photo for each person. */
export function PhotoManager() {
  const [photos, setPhotos] = useState<Record<string, string> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [onlyMissing, setOnlyMissing] = useState(false);

  const reload = useCallback(async () => {
    try {
      setPhotos(await backend.listPhotos());
      setLoadError(null);
    } catch (e) {
      setLoadError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const setFor = (id: string, s: Status | null) =>
    setStatus((prev) => {
      const next = { ...prev };
      if (s) next[id] = s;
      else delete next[id];
      return next;
    });

  const upload = async (p: Person, file: File | undefined) => {
    if (!file) return;
    setFor(p.id, { kind: 'busy' });
    try {
      const image = await prepareImage(file);
      await backend.uploadPhoto(p.id, image);
      await reload();
      setFor(p.id, { kind: 'done' });
    } catch (e) {
      setFor(p.id, { kind: 'error', text: (e as Error).message });
    }
  };

  const remove = async (p: Person) => {
    if (!window.confirm(`Remove the photo of ${p.name}? They'll be left out of the quiz until a new photo is added.`)) return;
    setFor(p.id, { kind: 'busy' });
    try {
      await backend.deletePhoto(p.id);
      await reload();
      setFor(p.id, null);
    } catch (e) {
      setFor(p.id, { kind: 'error', text: (e as Error).message });
    }
  };

  const onDrop = (p: Person) => (e: DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag');
    upload(p, e.dataTransfer.files?.[0]);
  };

  const have = photos ? PEOPLE.filter((p) => photos[p.id]).length : 0;

  return (
    <section className="card photos">
      <h2>Danish Actors photos</h2>
      <p className="desc">
        Only people with a photo appear in the quiz. Photos are stored privately and only logged-in players can see them. Click a card or drop an image
        on it; large photos are shrunk automatically.
      </p>
      {loadError && <p className="error">{loadError}</p>}
      {!loadError && photos === null && <p className="desc">Loading photos…</p>}
      {photos && (
        <>
          <div className="photo-toolbar">
            <span className="num">
              <b>{have}</b> of {PEOPLE.length} have a photo
            </span>
            <label>
              <input type="checkbox" checked={onlyMissing} onChange={(e) => setOnlyMissing(e.target.checked)} /> Show only missing
            </label>
          </div>
          {PERSON_CATEGORIES.map((cat) => {
            const people = PEOPLE.filter((p) => p.category === cat);
            const shown = onlyMissing ? people.filter((p) => !photos[p.id]) : people;
            if (!shown.length) return null;
            return (
              <div key={cat} className="photo-group">
                <h3>
                  {cat}
                  <span className="num">
                    {people.filter((p) => photos[p.id]).length}/{people.length}
                  </span>
                </h3>
                <div className="photo-grid">
                  {shown.map((p) => {
                    const url = photos[p.id];
                    const st = status[p.id];
                    const busy = st?.kind === 'busy';
                    return (
                      <div
                        key={p.id}
                        className={`photo-card ${url ? 'has' : 'empty'}`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.add('drag');
                        }}
                        onDragLeave={(e) => e.currentTarget.classList.remove('drag')}
                        onDrop={onDrop(p)}
                      >
                        <label className="photo-pick" title={url ? `Replace the photo of ${p.name}` : `Add a photo of ${p.name}`}>
                          {url ? <img src={url} alt={p.name} loading="lazy" /> : <span className="photo-placeholder">Add photo</span>}
                          {busy && <span className="photo-busy">Saving…</span>}
                          <input
                            type="file"
                            accept="image/*"
                            disabled={busy}
                            onChange={(e) => {
                              upload(p, e.target.files?.[0]);
                              e.target.value = '';
                            }}
                            aria-label={url ? `Replace the photo of ${p.name}` : `Add a photo of ${p.name}`}
                          />
                        </label>
                        <div className="photo-name">{p.name}</div>
                        {url && !busy && (
                          <button type="button" className="photo-remove" onClick={() => remove(p)}>
                            Remove
                          </button>
                        )}
                        {st?.kind === 'error' && <div className="error">{st.text}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </>
      )}
    </section>
  );
}
