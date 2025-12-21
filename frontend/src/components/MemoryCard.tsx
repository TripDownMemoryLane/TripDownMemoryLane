import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Trash2,
  Sparkles,
  Loader2,
  Tag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Memory } from "@shared/schema";
import { loadPhoto } from "@/lib/photoDB";

interface MemoryCardProps {
  memory: Memory;
  onStartQuiz: (memory: Memory) => void;
  onGenerateQuestions: (memory: Memory) => void;
  onDelete: (memory: Memory) => void;
  isGenerating?: boolean;
  categoryLabel?: string;
}

export function MemoryCard({
  memory,
  onStartQuiz,
  onGenerateQuestions,
  onDelete,
  isGenerating,
  categoryLabel,
}: MemoryCardProps) {
  const hasQuestions = !!memory.questions && memory.questions.length > 0;

  // IndexedDB 的唯一圖片來源
  const imageIds = memory.imageIds ?? [];
  const hasMultipleImages = imageIds.length > 1;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageUrl, setImageUrl] = useState<string>("");

  // ----------------------------------
  // 載入 IndexedDB Blob → ObjectURL
  // ----------------------------------
  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    async function load() {
      if (!imageIds.length) return;

      const blob = await loadPhoto(imageIds[currentIndex]);
      if (!blob || !active) return;

      objectUrl = URL.createObjectURL(blob);
      setImageUrl(objectUrl);
    }

    load();

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [imageIds, currentIndex]);

  const showPrev = () => {
    if (!hasMultipleImages) return;
    setCurrentIndex((prev) => (prev - 1 + imageIds.length) % imageIds.length);
  };

  const showNext = () => {
    if (!hasMultipleImages) return;
    setCurrentIndex((prev) => (prev + 1) % imageIds.length);
  };

  return (
    <Card
      className="overflow-hidden rounded-2xl"
      data-testid={`card-memory-${memory.id}`}
    >
      {/* ---------------- 圖片區 ---------------- */}
      <div className="relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={memory.title}
            className="w-full aspect-video object-cover"
            data-testid={`img-memory-${memory.id}`}
          />
        ) : (
          <div className="w-full aspect-video flex items-center justify-center bg-muted text-muted-foreground">
            尚未上傳照片
          </div>
        )}

        {/* 左右切換 */}
        {hasMultipleImages && (
          <>
            <button
              type="button"
              onClick={showPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full bg-black/50 text-white p-2"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={showNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full bg-black/50 text-white p-2"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* 指示點 */}
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
              {imageIds.map((_, i) => (
                <span
                  key={i}
                  className={`h-2 w-2 rounded-full ${
                    i === currentIndex ? "bg-white" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* 右上角標籤 */}
        <div className="absolute top-3 right-3 flex flex-wrap gap-2 justify-end">
          {categoryLabel && (
            <Badge
              variant="secondary"
              className="text-sm px-3 py-1 bg-background/80 backdrop-blur-sm"
            >
              <Tag className="w-3 h-3 mr-1" />
              {categoryLabel}
            </Badge>
          )}

          {hasQuestions && (
            <Badge className="text-base px-3 py-1">
              {memory.questions!.length} 題測驗
            </Badge>
          )}
        </div>
      </div>

      {/* ---------------- 文字區 ---------------- */}
      <CardContent className="p-6 space-y-4">
        <h3 className="text-2xl font-bold line-clamp-1">
          {memory.title}
        </h3>

        <p className="text-lg text-muted-foreground line-clamp-3">
          {memory.description}
        </p>

        {(memory.people || memory.date || memory.location) && (
          <div className="flex flex-wrap gap-2">
            {memory.people && (
              <Badge variant="secondary" className="text-sm">
                {memory.people}
              </Badge>
            )}
            {memory.date && (
              <Badge variant="secondary" className="text-sm">
                {memory.date}
              </Badge>
            )}
            {memory.location && (
              <Badge variant="secondary" className="text-sm">
                {memory.location}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      {/* ---------------- 操作區 ---------------- */}
      <CardFooter className="p-6 pt-0 flex flex-wrap gap-3">
        {hasQuestions ? (
          <Button
            size="lg"
            className="flex-1 h-14 text-lg font-semibold rounded-xl"
            onClick={() => onStartQuiz(memory)}
          >
            <Play className="w-5 h-5 mr-2" />
            開始測驗
          </Button>
        ) : (
          <Button
            size="lg"
            className="flex-1 h-14 text-lg font-semibold rounded-xl"
            onClick={() => onGenerateQuestions(memory)}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                生成故事
              </>
            )}
          </Button>
        )}

        <Button
          size="lg"
          variant="outline"
          className="h-14 rounded-xl"
          onClick={() => onDelete(memory)}
          aria-label="刪除記憶"
        >
          <Trash2 className="w-5 h-5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
