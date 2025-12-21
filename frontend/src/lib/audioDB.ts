import { openDB } from "idb";

const DB_NAME = "memory-lane-audio";
const STORE_NAME = "audios";

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME);
    }
  },
});

export async function saveAudio(key: string, blob: Blob) {
  const db = await dbPromise;
  await db.put(STORE_NAME, blob, key);
}

export async function loadAudio(key: string): Promise<Blob | null> {
  const db = await dbPromise;
  return (await db.get(STORE_NAME, key)) ?? null;
}
