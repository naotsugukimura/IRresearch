import { Clock, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataFreshnessBadgeProps {
  lastUpdated?: string;
  source?: string;
  sourceUrl?: string;
  confidence?: "high" | "medium" | "low";
  className?: string;
}

const CONFIDENCE_STYLES = {
  high: "text-emerald-400",
  medium: "text-amber-400",
  low: "text-red-400",
} as const;

const CONFIDENCE_LABELS = {
  high: "信頼度: 高",
  medium: "信頼度: 中",
  low: "信頼度: 低",
} as const;

export function DataFreshnessBadge({
  lastUpdated,
  source,
  sourceUrl,
  confidence,
  className,
}: DataFreshnessBadgeProps) {
  if (!lastUpdated && !source) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground",
        className
      )}
    >
      {lastUpdated && (
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {lastUpdated}
        </span>
      )}
      {source && (
        <span className="flex items-center gap-1">
          {sourceUrl ? (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground"
            >
              {source}
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          ) : (
            source
          )}
        </span>
      )}
      {confidence && (
        <span className={cn("font-medium", CONFIDENCE_STYLES[confidence])}>
          {CONFIDENCE_LABELS[confidence]}
        </span>
      )}
    </div>
  );
}
