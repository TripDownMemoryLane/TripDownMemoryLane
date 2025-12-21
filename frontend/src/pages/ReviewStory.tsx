import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import type { Memory } from "@shared/schema";
import { loadPhoto } from "@/lib/photoDB";

// ⭐ 新增 Dialog
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function ReviewStory() {
  const { id } = useParams<{ id: string }>();
  const memoryId = Number(id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [memory, setMemory] = useState<Memory | null>(null);
  const [stories, setStories] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // 控制「選擇錄音 or 直接測驗」
  const [showChoice, setShowChoice] = useState(false);

  /* -------------------------
   * 讀取 memory + stories
   * ------------------------- */
  useEffect(() => {
    const raw = localStorage.getItem("memories");
    if (!raw) {
      setInitializing(false);
      return;
    }

    try {
      const list: Memory[] = JSON.parse(raw);
      const found = list.find((m) => m.id === memoryId);

      if (!found) {
        setInitializing(false);
        return;
      }

      setMemory(found);

      // 確保 stories 長度 >= imageIds
      const safeStories = [...(found.stories ?? [])];
      while (safeStories.length < (found.imageIds?.length ?? 0)) {
        safeStories.push("");
      }
      setStories(safeStories);
    } catch {
      // ignore
    }

    setInitializing(false);
  }, [memoryId]);

  /* -------------------------
   * 載入圖片（IndexedDB）
   * ------------------------- */
  useEffect(() => {
    let active = true;
    let urls: string[] = [];

    async function loadImages() {
      if (!memory?.imageIds) return;

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

  /* -------------------------
   * 生成測驗（⚠️ 不直接跳頁）
   * ------------------------- */
  async function handleGenerateQuiz() {
    setLoading(true);

    try {
      const res = await fetch("http://localhost:4001/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stories }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "生成題目失敗");

      const raw = localStorage.getItem("memories") || "[]";
      const all = JSON.parse(raw) as Memory[];

      const updated = all.map((m) =>
        m.id === memoryId
          ? { ...m, stories, questions: data.questions }
          : m
      );

      localStorage.setItem("memories", JSON.stringify(updated));
      
      const check = JSON.parse(localStorage.getItem("memories") || "[]");
      console.log("✅ after generate quiz:", check);

      toast({
        title: "題目已生成！",
        description: "接下來可以選擇是否錄音",
      });

      // ⭐ 關鍵：顯示選擇視窗
      setShowChoice(true);
    } catch (err: any) {
      toast({
        title: "錯誤",
        description: err.message || "生成失敗",
        variant: "destructive",
      });
    }

    setLoading(false);
  }

  /* -------------------------
   * Render states
   * ------------------------- */
  if (initializing) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container max-w-4xl py-16 text-center text-xl text-muted-foreground">
          載入中...
        </main>
      </div>
    );
  }

  if (!memory) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        找不到記憶或尚未生成故事
      </div>
    );
  }

  /* -------------------------
   * Main render
   * ------------------------- */
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">確認並編輯故事</h1>

        <div className="space-y-10">
          {imageUrls.map((url, index) => (
            <Card key={memory.imageIds?.[index] ?? index} className="rounded-2xl">
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 items-start gap-6">
                {/* 圖片 */}
                <div className="w-full aspect-[4/3] overflow-hidden rounded-xl border bg-muted">
                  {url && (
                    <img
                      src={url}
                      alt={`記憶照片 ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                {/* 文字 */}
                <div>
                  <p className="font-semibold text-xl mb-2">
                    故事 {index + 1}
                  </p>
                  <Textarea
                    value={stories[index] || ""}
                    onChange={(e) => {
                      const copy = [...stories];
                      copy[index] = e.target.value;
                      setStories(copy);
                    }}
                    rows={6}
                    className="text-lg p-4 rounded-xl resize-y"
                    placeholder="請描述這張照片的回憶..."
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end mt-10">
          <Button
            onClick={handleGenerateQuiz}
            disabled={loading}
            size="lg"
            className="h-14 px-10 text-xl"
          >
            {loading ? "生成中..." : "確認並生成題目"}
          </Button>
        </div>
      </main>

      {/* -------------------------
       * 選擇 Dialog
       * ------------------------- */}
      <Dialog open={showChoice} onOpenChange={setShowChoice}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              接下來要做什麼？
            </DialogTitle>
            <DialogDescription>
              你可以選擇自行錄音題目，或直接開始測驗
            </DialogDescription>
          </DialogHeader>


          <div className="space-y-4 mt-4">
            <Button
              className="w-full h-14 text-lg"
              onClick={() => setLocation(`/record/${memoryId}`)}
            >
              🎙 自己錄音題目
            </Button>

            <Button
              variant="outline"
              className="w-full h-14 text-lg"
              onClick={() => setLocation(`/quiz/${memoryId}`)}
            >
              ▶️ 直接開始測驗
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
