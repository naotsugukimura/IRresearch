import { cn } from "@/lib/utils";
import { IMPACT_CONFIG } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

interface ImpactBadgeProps {
  impact: "high" | "medium" | "low";
  className?: string;
}

export function ImpactBadge({ impact, className }: ImpactBadgeProps) {
  const config = IMPACT_CONFIG[impact];

  return (
    <Badge
      variant="outline"
      className={cn("text-[10px]", config.bgClass, className)}
    >
      {config.label}
    </Badge>
  );
}
