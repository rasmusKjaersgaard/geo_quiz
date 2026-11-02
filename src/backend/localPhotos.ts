// Local mode only: people photos kept in this browser's IndexedDB
// (localStorage is too small for ~100 photos).

const DB_NAME = 'geoquiz-local';
const STORE = 'photos';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('Could not open browser storage.'));
  });
}

async function run<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const req = fn(tx.objectStore(STORE));
      tx.oncomplete = () => resolve(req.result);
      tx.onerror = () => reject(tx.error ?? new Error('Browser storage failed.'));
    });
  } finally {
    db.close();
  }
}

let objectUrls: string[] = [];

export async function listLocalPhotos(): Promise<Record<string, string>> {
  const db = await openDb();
  const out: Record<string, string> = {};
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).openCursor();
      const fresh: string[] = [];
      req.onsuccess = () => {
        const cursor = req.result;
        if (!cursor) return;
        const url = URL.createObjectURL(cursor.value as Blob);
        fresh.push(url);
        out[String(cursor.key)] = url;
        cursor.continue();
      };
      tx.oncomplete = () => {
        objectUrls.forEach((u) => URL.revokeObjectURL(u));
        objectUrls = fresh;
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
  return out;
}

export function putLocalPhoto(id: string, blob: Blob): Promise<IDBValidKey> {
  return run('readwrite', (s) => s.put(blob, id));
}

export function deleteLocalPhoto(id: string): Promise<undefined> {
  return run('readwrite', (s) => s.delete(id));
}
