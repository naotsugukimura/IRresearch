import { FileQuestion } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title?: string;
  description?: string;
  className?: string;
}

export function EmptyState({
  title = "データ未整備",
  description = "この企業のデータはまだ整備されていません。data/ディレクトリのJSONファイルにデータを追加してください。",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 py-12 text-center",
        className
      )}
    >
      <FileQuestion className="mb-3 h-10 w-10 text-muted-foreground/50" />
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground/70">
        {description}
      </p>
    </div>
  );
}
