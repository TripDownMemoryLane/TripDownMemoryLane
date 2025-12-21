import { useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import type { Memory } from "@shared/schema";
import { loadAudio, saveAudio } from "@/lib/audioDB";

export default function RecordPage() {
  const { id } = useParams<{ id: string }>();
  const memoryId = Number(id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [memory, setMemory] = useState<Memory | null>(null);
  const [recordings, setRecordings] = useState<(Blob | null)[]>([]);
  const [recordingIndex, setRecordingIndex] = useState<number | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  /* -------------------------
   * 讀取 memory
   * ------------------------- */
  useEffect(() => {
    const raw = localStorage.getItem("memories");
    if (!raw) return;

    try {
      const list = JSON.parse(raw) as any[];
      const found = list.find(
        (m) => Number(m.id) === Number(memoryId)
      );

      if (!found) {
        setMemory(null);
        return;
      }

      setMemory(found);

      if (found.questions) {
        setRecordings(new Array(found.questions.length).fill(null));
      }
    } catch (err) {
      console.error("RecordPage localStorage error", err);
    }
  }, [memoryId]);

  /* -------------------------
   * 載入既有錄音
   * ------------------------- */
  useEffect(() => {
    if (!memory?.questions) return;

    async function loadAll() {
      const loaded = await Promise.all(
        memory.questions.map((_: any, i: number) =>
          loadAudio(`${memoryId}-${i}`)
        )
      );
      setRecordings(loaded);
    }

    loadAll();
  }, [memory, memoryId]);

  /* -------------------------
   * 錄音控制
   * ------------------------- */
  async function startRecording(index: number) {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      await saveAudio(`${memoryId}-${index}`, blob);

      setRecordings((prev) => {
        const copy = [...prev];
        copy[index] = blob;
        return copy;
      });
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
    setRecordingIndex(index);
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    setRecordingIndex(null);
  }

  /* -------------------------
   * Guard
   * ------------------------- */
  if (!memory) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container max-w-2xl py-16 text-center">
          載入中…
        </main>
      </div>
    );
  }

  if (!memory.questions) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container max-w-2xl py-16 text-center">
          尚未生成題目
        </main>
      </div>
    );
  }

  /* -------------------------
   * Render
   * ------------------------- */
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto max-w-2xl px-4 py-8 space-y-6">
        {/* 返回 */}
        <Button
          variant="ghost"
          size="lg"
          className="-ml-2"
          onClick={() => setLocation(`/review/${memoryId}`)}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          返回
        </Button>

        {/* 標題 */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">錄製題目聲音</h1>
          <p className="text-muted-foreground">
            請一次念完整題目與選項
          </p>
        </div>

        {/* 題目卡片 */}
        <div className="space-y-6">
          {memory.questions.map((q: any, i: number) => (
            <Card key={i} className="rounded-3xl">
              <CardContent className="p-6 space-y-4">
                {/* 題號 */}
                <div className="text-lg font-semibold">
                  第 {i + 1} 題
                </div>

                {/* 題目內容 */}
                <div className="rounded-xl bg-muted/50 p-4 space-y-2">
                  <p className="text-xl font-bold leading-relaxed">
                    {q.question}
                  </p>
                  <ul className="space-y-1 text-muted-foreground">
                    {q.options.map((opt: string, idx: number) => (
                      <li key={idx}>
                        {String.fromCharCode(65 + idx)}. {opt}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 操作列 */}
                <div className="flex flex-wrap items-center gap-4 pt-4 border-t">
                  {recordingIndex === i ? (
                    <Button
                      variant="destructive"
                      size="lg"
                      className="h-14 px-8 text-lg"
                      onClick={stopRecording}
                    >
                      ⏹ 停止錄音
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      className="h-14 px-8 text-lg"
                      onClick={() => startRecording(i)}
                    >
                      🎙 開始錄音
                    </Button>
                  )}

                  {recordings[i] && (
                    <audio
                      controls
                      src={URL.createObjectURL(recordings[i]!)}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 完成 */}
        <div className="flex justify-end pt-4">
          <Button
            size="lg"
            className="h-14 px-10 text-xl"
            onClick={() => {
              toast({ title: "錄音完成！" });
              setLocation(`/quiz/${memoryId}`);
            }}
          >
            完成並開始測驗
          </Button>
        </div>
      </main>
    </div>
  );
}
