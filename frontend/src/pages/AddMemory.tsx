import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { MemoryForm, type MemoryFormData } from "@/components/MemoryForm";
import { MultiPhotoUpload } from "@/components/MultiPhotoUpload";
import { useToast } from "@/hooks/use-toast";
import { savePhoto } from "@/lib/photoDB";

export default function AddMemory() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // IndexedDB 架構：只存 File
  const [photos, setPhotos] = useState<(File | null)[]>([null, null, null]);

  const handleSubmit = useCallback(
    async (formData: MemoryFormData) => {
      const files = photos.filter(Boolean) as File[];

      if (files.length < 3) {
        toast({
          title: "需要三張照片",
          description: "請上傳三張照片才能建立記憶",
          variant: "destructive",
        });
        return;
      }

      // 用時間戳當 memoryId（目前足夠）
      const memoryId = Date.now();

      // 建立 imageIds
      const imageIds = files.map((_, i) => `photo-${memoryId}-${i}`);

      // 存照片到 IndexedDB
      await Promise.all(
        files.map((file, i) => savePhoto(imageIds[i], file))
      );

      // 存 metadata 到 localStorage
      const raw = localStorage.getItem("memories") || "[]";
      const all = JSON.parse(raw);

      const newMemory = {
        id: memoryId,
        ...formData,
        imageIds,
        stories: [],
        questions: [],
      };

      localStorage.setItem(
        "memories",
        JSON.stringify([...all, newMemory])
      );

      toast({
        title: "記憶已儲存！",
        description: "您可以為這個記憶生成故事與測驗",
      });

      setLocation("/?refresh=1");
    },
    [photos, toast, setLocation]
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto max-w-4xl px-4 py-8">
        <Button
          variant="ghost"
          size="lg"
          className="mb-6 -ml-2 text-lg"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          返回
        </Button>

        <h1 className="text-4xl font-bold mb-8">
          新增記憶
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左：照片 */}
          <Card className="rounded-2xl h-fit">
            <CardHeader>
              <CardTitle className="text-2xl">
                上傳照片（3 張）
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MultiPhotoUpload
                images={photos}
                onChange={setPhotos}
              />
            </CardContent>
          </Card>

          {/* 右：表單 */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-2xl">
                記憶詳情
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MemoryForm onSubmit={handleSubmit} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
