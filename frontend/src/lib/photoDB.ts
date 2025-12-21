import { set, get, del } from "idb-keyval";

export async function savePhoto(id: string, file: Blob) {
  await set(id, file);
}

export async function loadPhoto(id: string): Promise<Blob | undefined> {
  return await get(id);
}

export async function deletePhoto(id: string) {
  await del(id);
}
