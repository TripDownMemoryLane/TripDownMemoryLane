import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, RotateCcw, Home, Star } from "lucide-react";
import type { QuizResult } from "@shared/schema";

interface QuizResultsProps {
  result: QuizResult;
  onRetry: () => void;
  onHome: () => void;
}

export function QuizResults({ result, onRetry, onHome }: QuizResultsProps) {
  const percentage = Math.round((result.correctAnswers / result.totalQuestions) * 100);
  
  const getMessage = () => {
    if (percentage === 100) return "完美！你的記憶力真棒！";
    if (percentage >= 80) return "太厲害了！記憶力很好！";
    if (percentage >= 60) return "做得不錯！繼續加油！";
    if (percentage >= 40) return "很好的開始！多練習會更好！";
    return "沒關係，回憶需要時間！";
  };

  const getStars = () => {
    if (percentage >= 80) return 3;
    if (percentage >= 50) return 2;
    if (percentage >= 1) return 1;
    return 0;
  };

  const stars = getStars();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <Card className="w-full max-w-xl rounded-3xl overflow-hidden">
        <CardContent className="p-8 md:p-12 text-center space-y-8">
          <div className="flex items-center justify-center w-32 h-32 mx-auto rounded-full bg-primary/10">
            <Trophy className="w-16 h-16 text-primary" />
          </div>

          <div className="space-y-4">
            <h1
              className="text-4xl md:text-5xl font-bold"
              data-testid="text-result-title"
            >
              測驗完成！
            </h1>
            <p
              className="text-2xl text-muted-foreground"
              data-testid="text-result-message"
            >
              {getMessage()}
            </p>
          </div>

          <div className="flex justify-center gap-2">
            {[...Array(3)].map((_, i) => (
              <Star
                key={i}
                className={`w-12 h-12 ${
                  i < stars
                    ? "text-yellow-500 fill-yellow-500"
                    : "text-muted-foreground/30"
                }`}
                data-testid={`star-${i}`}
              />
            ))}
          </div>

          <div
            className="text-6xl md:text-7xl font-bold text-primary"
            data-testid="text-score"
          >
            {result.correctAnswers} / {result.totalQuestions}
          </div>

          <p className="text-xl text-muted-foreground" data-testid="text-percentage">
            正確率：{percentage}%
          </p>

          <div className="flex flex-col gap-4 pt-4">
            <Button
              size="lg"
              className="w-full h-16 text-xl font-semibold rounded-xl"
              onClick={onRetry}
              data-testid="button-retry-quiz"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              再試一次
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full h-16 text-xl font-semibold rounded-xl"
              onClick={onHome}
              data-testid="button-go-home"
            >
              <Home className="w-5 h-5 mr-2" />
              返回首頁
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
