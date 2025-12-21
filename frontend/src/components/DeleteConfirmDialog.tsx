import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
}: DeleteConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl">確定要刪除嗎？</AlertDialogTitle>
          <AlertDialogDescription className="text-lg">
            {title ? (
              <>確定要刪除「{title}」嗎？此操作無法復原。</>
            ) : (
              <>此操作無法復原，請確認是否要刪除。</>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-3 sm:flex-row">
          <AlertDialogCancel
            className="h-14 text-lg rounded-xl"
            data-testid="button-cancel-delete"
          >
            取消
          </AlertDialogCancel>
          <AlertDialogAction
            className="h-14 text-lg rounded-xl bg-destructive text-destructive-foreground"
            onClick={onConfirm}
            data-testid="button-confirm-delete"
          >
            確定刪除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
