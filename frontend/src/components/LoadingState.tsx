import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "載入中..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
      <p className="text-xl text-muted-foreground" data-testid="text-loading">
        {message}
      </p>
    </div>
  );
}
