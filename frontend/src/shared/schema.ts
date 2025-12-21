import { z } from "zod";

/* ------------------------- Question Type ------------------------- */

export const questionSchema = z.object({
  id: z.string(),
  question: z.string(),
  options: z.array(z.string()),
  correctAnswer: z.number(),
  audioBase64: z.string().optional(),   // 新增：語音題目支援
});

export type Question = z.infer<typeof questionSchema>;

/* ------------------------- Memory Type --------------------------- */

export const memorySchema = z.object({
  id: z.number(),

  // ⬇️ 取代舊的 imageBase64 / imageUrl
  images: z.array(z.string()).min(1).max(3),

  // ⬇️ 後端故事 API 回傳結果
  stories: z.array(z.string()).optional(),

  title: z.string(),
  description: z.string(),
  people: z.string().optional(),
  date: z.string().optional(),
  location: z.string().optional(),
  category: z.string().optional(),

  tags: z.array(z.string()).optional(),

  // ⬇️ AI 題目（含語音）
  questions: z.array(questionSchema).optional(),
});

export type Memory = z.infer<typeof memorySchema>;


/* ------------------------- Quiz Result Type --------------------------- */

export const quizAnswerSchema = z.object({
  questionId: z.string(),
  selectedAnswer: z.number(),
  isCorrect: z.boolean(),
});

export const quizResultSchema = z.object({
  id: z.number().optional(),
  memoryId: z.number(),
  totalQuestions: z.number(),
  correctAnswers: z.number(),
  answers: z.array(quizAnswerSchema),
  completedAt: z.string().optional(),
});

export type QuizResult = z.infer<typeof quizResultSchema>;


/* ------------------------- Categories --------------------------- */

export const MEMORY_CATEGORIES = [
  { value: "family", label: "家人" },
  { value: "travel", label: "旅行" },
  { value: "holiday", label: "節日" },
  { value: "friends", label: "朋友" },
  { value: "work", label: "工作" },
  { value: "daily", label: "日常" },
  { value: "other", label: "其他" },
] as const;

export type MemoryCategory = (typeof MEMORY_CATEGORIES)[number]["value"];
