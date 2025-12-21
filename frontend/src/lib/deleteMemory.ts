import type { Memory } from "@shared/schema";
import { deletePhoto } from "@/lib/photoDB";

export async function deleteMemory(memoryId: number) {
  const raw = localStorage.getItem("memories");
  if (!raw) return;

  const memories: Memory[] = JSON.parse(raw);
  const target = memories.find((m) => m.id === memoryId);

  // 刪 IndexedDB 的照片
  if (target?.imageIds) {
    await Promise.all(
      target.imageIds.map((id) => deletePhoto(id))
    );
  }

  // 刪 localStorage 的 memory
  const updated = memories.filter((m) => m.id !== memoryId);
  localStorage.setItem("memories", JSON.stringify(updated));
}
