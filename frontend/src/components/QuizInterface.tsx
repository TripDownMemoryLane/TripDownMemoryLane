import { useState, useCallback, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  XCircle,
  ChevronRight,
  Volume2,
} from "lucide-react";
import type { Memory, QuizResult } from "@shared/schema";

interface QuizInterfaceProps {
  memory: Memory;
  imageUrls: string[];
  audioUrls?: (string | null)[]; // ⭐ 使用者錄音
  onComplete: (result: QuizResult) => void;
  onExit: () => void;
}

interface AnswerRecord {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
}

export function QuizInterface({
  memory,
  imageUrls,
  audioUrls = [],
  onComplete,
  onExit,
}: QuizInterfaceProps) {
  const questions = memory.questions || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);

  // 🎧 語音狀態
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const currentQuestion = questions[currentIndex];
  const currentImage = imageUrls[currentIndex] || "";
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentIndex === questions.length - 1;

  // 正確答案 index
  const correctIndex = useMemo(() => {
    if (!currentQuestion) return -1;
    return currentQuestion.options.findIndex(
      (opt: string) => opt === currentQuestion.answer
    );
  }, [currentQuestion]);

  const isCorrect =
    selectedAnswer !== null && selectedAnswer === correctIndex;

  /* --------------------------------------------------
   * 建立語音（🎙 使用者錄音優先，其次 AI）
   * -------------------------------------------------- */
  useEffect(() => {
    // cleanup 舊的
    if (audio) {
      audio.pause();
      audio.src = "";
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setAudio(null);
    setAudioUrl(null);
    setIsPlaying(false);

    // 1️⃣ 使用者錄音（IndexedDB）
    const userAudioUrl = audioUrls[currentIndex];
    if (userAudioUrl) {
      const newAudio = new Audio(userAudioUrl);
      newAudio.onended = () => setIsPlaying(false);

      setAudio(newAudio);
      setAudioUrl(userAudioUrl);
      return;
    }

    // 2️⃣ AI 語音（base64）
    if (!currentQuestion?.fullAudioBase64) return;

    try {
      const base64 = currentQuestion.fullAudioBase64.includes(",")
        ? currentQuestion.fullAudioBase64.split(",")[1]
        : currentQuestion.fullAudioBase64;

      const byteString = atob(base64);
      const arrayBuffer = new Uint8Array(byteString.length);

      for (let i = 0; i < byteString.length; i++) {
        arrayBuffer[i] = byteString.charCodeAt(i);
      }

      const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      const newAudio = new Audio(url);

      newAudio.onended = () => setIsPlaying(false);

      setAudioUrl(url);
      setAudio(newAudio);
    } catch (err) {
      console.error("Audio decode failed:", err);
    }

    return () => {
      if (audio) audio.pause();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [currentIndex, currentQuestion, audioUrls]);

  /* --------------------------------------------------
   * 播放語音
   * -------------------------------------------------- */
  const handlePlayAudio = useCallback(() => {
    if (!audio) return;
    audio.currentTime = 0;
    audio.play();
    setIsPlaying(true);
  }, [audio]);

  /* --------------------------------------------------
   * 答題邏輯（原本）
   * -------------------------------------------------- */
  const handleSelectAnswer = useCallback(
    (index: number) => {
      if (showResult || selectedAnswer !== null) return;
      setSelectedAnswer(index);
      setShowResult(true);
    },
    [showResult, selectedAnswer]
  );

  const handleNext = useCallback(() => {
    if (selectedAnswer === null || !currentQuestion) return;

    const newAnswer: AnswerRecord = {
      questionId: currentQuestion.question,
      selectedAnswer,
      isCorrect: selectedAnswer === correctIndex,
    };

    const updated = [...answers, newAnswer];

    if (isLastQuestion) {
      onComplete({
        memoryId: memory.id,
        totalQuestions: questions.length,
        correctAnswers: updated.filter((a) => a.isCorrect).length,
        answers: updated,
      });
    } else {
      setAnswers(updated);
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  }, [
    selectedAnswer,
    correctIndex,
    currentQuestion,
    answers,
    isLastQuestion,
    memory.id,
    questions.length,
    onComplete,
  ]);

  if (!currentQuestion) return null;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-2xl font-semibold">
            第 {currentIndex + 1} / {questions.length} 題
          </span>
          <Button variant="ghost" onClick={onExit}>
            結束測驗
          </Button>
        </div>
        <Progress value={progress} className="h-3" />
      </div>

      <Card className="rounded-3xl overflow-hidden">
        {/* 📷 題目照片 */}
        {currentImage && (
          <img
            src={currentImage}
            alt={`題目 ${currentIndex + 1}`}
            className="w-full aspect-video object-cover"
          />
        )}

        <CardContent className="p-8 space-y-8">
          {/* 🎧 播放語音（有任一來源才顯示） */}
          {audio && (
            <Button
              variant="outline"
              size="lg"
              className="w-full flex items-center gap-3 text-xl"
              onClick={handlePlayAudio}
              disabled={isPlaying}
            >
              <Volume2 className="w-6 h-6" />
              {isPlaying ? "播放中…" : "播放題目語音"}
            </Button>
          )}

          <h2 className="text-3xl font-bold">
            {currentQuestion.question}
          </h2>

          {/* Options */}
          <div className="space-y-4">
            {currentQuestion.options.map((opt: string, idx: number) => {
              const isSelected = selectedAnswer === idx;
              const isCorrectAnswer = idx === correctIndex;

              let className =
                "w-full min-h-16 px-6 py-4 text-xl text-left rounded-xl border transition-colors";

              if (showResult) {
                if (isCorrectAnswer) {
                  className +=
                    " bg-green-100 text-green-800 border-green-400 dark:bg-green-900/40 dark:text-green-200 dark:border-green-500";
                } else if (isSelected) {
                  className +=
                    " bg-red-100 text-red-800 border-red-400 dark:bg-red-900/40 dark:text-red-200 dark:border-red-500";
                }
              }

              return (
                <Button
                  key={idx}
                  variant="outline"
                  className={className}
                  disabled={showResult}
                  onClick={() => handleSelectAnswer(idx)}
                >
                  <span className="flex gap-3 items-center w-full">
                    <span className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {showResult && isCorrectAnswer && (
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    )}
                    {showResult && isSelected && !isCorrect && (
                      <XCircle className="w-6 h-6 text-destructive" />
                    )}
                  </span>
                </Button>
              );
            })}
          </div>

          {showResult && (
            <Button
              size="lg"
              className="w-full h-16 text-xl font-semibold"
              onClick={handleNext}
            >
              {isLastQuestion ? "查看結果" : "下一題"}
              <ChevronRight className="ml-2" />
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
