import { ImageIcon, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onAddMemory: () => void;
}

export function EmptyState({ onAddMemory }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="relative mb-8">
        <div className="flex items-center justify-center w-32 h-32 rounded-full bg-muted">
          <ImageIcon className="w-16 h-16 text-muted-foreground" />
        </div>
        <div className="absolute -bottom-2 -right-2 flex items-center justify-center w-12 h-12 rounded-full bg-primary">
          <Heart className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>
      
      <h2 className="text-3xl font-bold mb-4" data-testid="text-empty-title">
        還沒有任何記憶
      </h2>
      <p className="text-xl text-muted-foreground mb-8 max-w-md" data-testid="text-empty-description">
        上傳照片並輸入描述，讓我們一起創造溫馨的回憶測驗
      </p>
      <Button
        size="lg"
        className="h-16 px-12 text-xl font-semibold rounded-xl"
        onClick={onAddMemory}
        data-testid="button-add-first-memory"
      >
        新增第一個記憶
      </Button>
    </div>
  );
}
