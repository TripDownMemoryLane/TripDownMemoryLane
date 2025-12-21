import { QueryClient } from "@tanstack/react-query";
import type { Memory } from "@shared/schema";
import { mockMemories } from "../mock/memoryMock";

export const queryClient = new QueryClient();

const STORAGE_KEY = "memories";

/* ------------------------------------------------------------------ */
/*                      初始化（只在第一次啟動時做）                   */
/* ------------------------------------------------------------------ */

let stored = localStorage.getItem(STORAGE_KEY);

if (!stored) {
  // 第一次使用 → 寫入 mock
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockMemories));
  stored = JSON.stringify(mockMemories);
}

let memoryDB: Memory[] = JSON.parse(stored);

/* ------------------------------------------------------------------ */
/*                            資料同步工具                             */
/* ------------------------------------------------------------------ */

function syncDB(memories: Memory[]) {
  memoryDB = memories;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
}

function delay(ms = 200) {
  return new Promise((res) => setTimeout(res, ms));
}

/* ------------------------------------------------------------------ */
/*                              Mock API                               */
/* ------------------------------------------------------------------ */

export async function apiRequest(method: string, url: string, body?: any) {
  console.log("Mock API:", method, url, body);
  await delay();

  // ---- GET ALL ----
  if (method === "GET" && url === "/api/memories") {
    return { json: async () => [...memoryDB] };
  }

  // ---- CREATE ----
  if (method === "POST" && url === "/api/memories") {
    const newMemory: Memory = {
      id: Date.now(),
      title: body.title,
      description: body.description,
      people: body.people || "",
      date: body.date || "",
      location: body.location || "",
      category: body.category || "",
      images: body.images ?? [],
      stories: [],
      questions: [],
    };

    syncDB([...memoryDB, newMemory]);
    return { json: async () => newMemory };
  }

  // ---- DELETE ----
  if (method === "DELETE" && url.startsWith("/api/memories/")) {
    const id = Number(url.split("/").pop());
    syncDB(memoryDB.filter((m) => m.id !== id));
    return { json: async () => ({ success: true }) };
  }

  // ---- GENERATE STORIES ----
  if (url.includes("generate-stories")) {
    const memoryId = body.memoryId;
    const target = memoryDB.find((m) => m.id === memoryId);

    if (!target) return { json: async () => ({ success: false }) };

    target.stories = target.images.map((_, i) => `這是第 ${i + 1} 張圖片的故事（mock）`);

    syncDB([...memoryDB]);
    return { json: async () => ({ success: true, stories: target.stories }) };
  }

  // ---- GENERATE QUESTIONS ----
  if (url.includes("generate-questions")) {
    const memoryId = body.memoryId;
    const target = memoryDB.find((m) => m.id === memoryId);

    if (!target) return { json: async () => ({ success: false }) };

    target.questions = [
      {
        id: "q1",
        question: "這張照片的主要人物是誰？",
        options: ["爸爸", "媽媽", "兄弟姊妹", "朋友"],
        correctAnswer: 0,
      },
    ];

    syncDB([...memoryDB]);
    return { json: async () => ({ success: true, questions: target.questions }) };
  }

  return { json: async () => ({}) };
}

/* ------------------------------------------------------------------ */
/*                       外部暴露：更新 DB                             */
/* ------------------------------------------------------------------ */

export function updateMemoryDB(memories: Memory[]) {
  syncDB(memories);
}
