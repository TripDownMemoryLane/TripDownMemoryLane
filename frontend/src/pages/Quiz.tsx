import { useEffect, useState, useCallback } from "react";
import { useLocation, useParams } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { QuizInterface } from "@/components/QuizInterface";
import { QuizResults } from "@/components/QuizResults";
import type { Memory, QuizResult } from "@shared/schema";
import { loadPhoto } from "@/lib/photoDB";
import { loadAudio } from "@/lib/audioDB";

export default function Quiz() {
  const [, setLocation] = useLocation();
  const { id } = useParams<{ id: string }>();
  const memoryId = Number(id);

  const [memory, setMemory] = useState<Memory | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [quizKey, setQuizKey] = useState(0);
  const [audioUrls, setAudioUrls] = useState<(string | null)[]>([]);

  // -------------------------
  // 讀 localStorage 的 memory
  // -------------------------
  useEffect(() => {
    const raw = localStorage.getItem("memories");
    if (!raw) return;

    try {
      const list = JSON.parse(raw) as Memory[];
      const found = list.find((m) => m.id === memoryId);
      if (found) setMemory(found);
    } catch (e) {
      console.error("Quiz localStorage parse error", e);
    }
  }, [memoryId]);

  // -------------------------
  // 載入對應照片（IndexedDB → objectURL）
  // -------------------------
  useEffect(() => {
    if (!memory?.imageIds) return;

    let active = true;
    let urls: string[] = [];

    async function loadImages() {
      urls = await Promise.all(
        memory.imageIds.map(async (id) => {
          const blob = await loadPhoto(id);
          return blob ? URL.createObjectURL(blob) : "";
        })
      );
      if (active) setImageUrls(urls);
    }

    loadImages();

    return () => {
      active = false;
      urls.forEach((url) => url && URL.revokeObjectURL(url));
    };
  }, [memory]);

  // -------------------------
  // 載入題目錄音（IndexedDB → objectURL）
  // -------------------------
  useEffect(() => {
    if (!memory?.questions) return;

    let active = true;
    let urls: (string | null)[] = [];

    async function loadAudios() {
      urls = await Promise.all(
        memory.questions.map(async (_, index) => {
          const blob = await loadAudio(`${memoryId}-${index}`);
          return blob ? URL.createObjectURL(blob) : null;
        })
      );

      if (active) setAudioUrls(urls);
    }

    loadAudios();

    return () => {
      active = false;
      urls.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [memory, memoryId]);


  const handleComplete = useCallback((result: QuizResult) => {
    setQuizResult(result);
  }, []);

  const handleRetry = useCallback(() => {
    setQuizResult(null);
    setQuizKey((prev) => prev + 1);
  }, []);

  const handleHome = useCallback(() => {
    setLocation("/");
  }, [setLocation]);

  const handleExit = useCallback(() => {
    setLocation("/");
  }, [setLocation]);

  // -------------------------
  // 防呆畫面
  // -------------------------
  if (!memory) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container max-w-4xl py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">找不到記憶</h2>
          <Button onClick={handleHome}>返回首頁</Button>
        </main>
      </div>
    );
  }

  if (!memory.questions || memory.questions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container max-w-4xl py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">尚未生成題目</h2>
          <Button onClick={handleHome}>返回首頁</Button>
        </main>
      </div>
    );
  }

  // -------------------------
  // Render
  // -------------------------
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto max-w-2xl px-4 py-8">
        {!quizResult && (
          <Button variant="ghost" size="lg" className="mb-6 -ml-2" onClick={handleExit}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回
          </Button>
        )}

        {quizResult ? (
          <QuizResults result={quizResult} onRetry={handleRetry} onHome={handleHome} />
        ) : (
          <QuizInterface
            key={quizKey}
            memory={memory}
            imageUrls={imageUrls}
            audioUrls={audioUrls}
            onComplete={handleComplete}
            onExit={handleExit}
          />
        )}
      </main>
    </div>
  );
}
