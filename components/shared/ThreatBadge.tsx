import { cn } from "@/lib/utils";
import { THREAT_LEVEL_CONFIG } from "@/lib/constants";
import type { ThreatLevel } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface ThreatBadgeProps {
  level: ThreatLevel;
  showLabel?: boolean;
  className?: string;
}

export function ThreatBadge({ level, showLabel = true, className }: ThreatBadgeProps) {
  const safeLevel = (level >= 1 && level <= 5 ? level : 1) as ThreatLevel;
  const config = THREAT_LEVEL_CONFIG[safeLevel];

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 border",
        className
      )}
      style={{
        borderColor: config.color + "40",
        backgroundColor: config.color + "15",
        color: config.color,
      }}
    >
      <span className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "inline-block h-1.5 w-1.5 rounded-full",
              i < level ? "opacity-100" : "opacity-20"
            )}
            style={{ backgroundColor: config.color }}
          />
        ))}
      </span>
      {showLabel && <span className="text-[10px]">{config.label}</span>}
    </Badge>
  );
}
