import { cn } from "@/lib/utils";
import { GROWTH_DRIVER_CONFIG } from "@/lib/constants";
import type { GrowthDriverType } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface GrowthDriverTagProps {
  driver: GrowthDriverType;
  className?: string;
}

export function GrowthDriverTag({ driver, className }: GrowthDriverTagProps) {
  const config = GROWTH_DRIVER_CONFIG[driver];

  return (
    <Badge
      variant="outline"
      className={cn("text-[10px]", className)}
      style={{
        borderColor: config.color + "40",
        backgroundColor: config.color + "15",
        color: config.color,
      }}
    >
      {config.label}
    </Badge>
  );
}
