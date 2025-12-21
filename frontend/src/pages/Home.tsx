import { useEffect, useState, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import { Plus, Heart, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { MemoryCard } from "@/components/MemoryCard";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import type { Memory } from "@shared/schema";
import { MEMORY_CATEGORIES } from "@shared/schema";
import { deleteMemory } from "@/lib/deleteMemory";
import { loadPhoto } from "@/lib/photoDB";

export default function Home() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  // -------------------------
  // state
  // -------------------------
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    memory?: Memory;
  }>({ open: false });

  const [generatingId, setGeneratingId] = useState<number | null>(null);

  // -------------------------
  // 從 localStorage 載入 memories（唯一資料來源）
  // -------------------------
  const loadMemories = useCallback(() => {
    const raw = localStorage.getItem("memories") || "[]";
    try {
      setMemories(JSON.parse(raw));
    } catch {
      setMemories([]);
    }
    setLoading(false);
  }, []);

  // ⭐ 路由改變就重新同步
  useEffect(() => {
    loadMemories();
  }, [location, loadMemories]);

  // -------------------------
  // category filter
  // -------------------------
  const filteredMemories = useMemo(() => {
    if (!selectedCategory) return memories;
    return memories.filter((m) => m.category === selectedCategory);
  }, [memories, selectedCategory]);

  // -------------------------
  // handlers
  // -------------------------
  const handleAddMemory = useCallback(() => {
    setLocation("/add");
  }, [setLocation]);

  const handleStartQuiz = useCallback(
    (memory: Memory) => {
      setLocation(`/quiz/${memory.id}`);
    },
    [setLocation]
  );

  // IndexedDB → base64（只用來傳 API，不存）
  async function getBase64Images(imageIds: string[]) {
    return Promise.all(
      imageIds.map(
        (id) =>
          new Promise<string>((resolve, reject) => {
            loadPhoto(id).then((blob) => {
              if (!blob) return reject("Image not found");

              const reader = new FileReader();
              reader.onloadend = () =>
                resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          })
      )
    );
  }

  const handleGenerateStory = useCallback(
    async (memory: Memory) => {
      try {
        setGeneratingId(memory.id);

        // 從 IndexedDB 取照片 → base64
        const imagesBase64 = await getBase64Images(memory.imageIds);

        // 呼叫 AI backend
        const res = await fetch(
          "http://localhost:4001/generate-story",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ images: imagesBase64 }),
          }
        );

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "故事生成失敗");
        }

        // 存 stories 到 localStorage
        const raw = localStorage.getItem("memories") || "[]";
        const all: Memory[] = JSON.parse(raw);

        const updated = all.map((m) =>
          m.id === memory.id
            ? { ...m, stories: data.stories }
            : m
        );

        localStorage.setItem(
          "memories",
          JSON.stringify(updated)
        );

        // 跳轉 ReviewStory
        setLocation(`/review/${memory.id}`);
      } catch (err: any) {
        toast({
          title: "生成故事失敗",
          description: err.message || "請稍後再試",
          variant: "destructive",
        });
      } finally {
        setGeneratingId(null);
      }
    },
    [setLocation, toast]
  );

  const handleDeleteClick = useCallback((memory: Memory) => {
    setDeleteDialog({ open: true, memory });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteDialog.memory) return;

    await deleteMemory(deleteDialog.memory.id);
    loadMemories();

    toast({
      title: "已刪除",
      description: "記憶已成功刪除",
    });

    setDeleteDialog({ open: false });
  }, [deleteDialog.memory, loadMemories, toast]);

  const getCategoryLabel = (value: string) =>
    MEMORY_CATEGORIES.find((c) => c.value === value)?.label ||
    value;

  // -------------------------
  // render
  // -------------------------
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto max-w-4xl px-4 py-8">
        {/* Hero */}
        <section className="mb-12">
          <Card className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex items-center justify-center w-24 h-24 md:w-32 md:h-32 rounded-full bg-primary/20">
                  <Heart className="w-12 h-12 md:w-16 md:h-16 text-primary" />
                </div>
                <div className="text-center md:text-left flex-1">
                  <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    歡迎來到記憶花園
                  </h1>
                  <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                    透過照片喚起珍貴回憶，讓長者重溫美好時光
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* List Header */}
        <section>
          <div className="flex flex-col gap-6 mb-8">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-3xl font-bold">我的記憶</h2>
              <Button
                size="lg"
                className="h-14 px-8 text-lg rounded-xl"
                onClick={handleAddMemory}
              >
                <Plus className="w-5 h-5 mr-2" />
                新增記憶
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <Filter className="w-5 h-5 text-muted-foreground" />

              <Badge
                variant={
                  selectedCategory === null
                    ? "default"
                    : "outline"
                }
                className="text-base px-4 py-2 cursor-pointer"
                onClick={() => setSelectedCategory(null)}
              >
                全部
              </Badge>

              {MEMORY_CATEGORIES.map((cat) => (
                <Badge
                  key={cat.value}
                  variant={
                    selectedCategory === cat.value
                      ? "default"
                      : "outline"
                  }
                  className="text-base px-4 py-2 cursor-pointer"
                  onClick={() =>
                    setSelectedCategory(cat.value)
                  }
                >
                  {cat.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <LoadingState message="載入記憶中..." />
          ) : memories.length === 0 ? (
            <EmptyState onAddMemory={handleAddMemory} />
          ) : filteredMemories.length === 0 ? (
            <div className="text-center py-16 text-xl text-muted-foreground">
              此分類沒有記憶，請選擇其他分類或新增記憶
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredMemories.map((memory) => (
                <MemoryCard
                  key={memory.id}
                  memory={memory}
                  onStartQuiz={handleStartQuiz}
                  onGenerateQuestions={handleGenerateStory}
                  onDelete={handleDeleteClick}
                  isGenerating={generatingId === memory.id}
                  categoryLabel={
                    memory.category
                      ? getCategoryLabel(memory.category)
                      : undefined
                  }
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({ open })
        }
        onConfirm={handleDeleteConfirm}
        title={deleteDialog.memory?.title}
      />
    </div>
  );
}
