import { cn } from "@/lib/utils";
import { CATEGORY_CONFIG } from "@/lib/constants";
import type { CompanyCategory } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface CategoryBadgeProps {
  category: CompanyCategory;
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const config = CATEGORY_CONFIG[category];

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
      {category}: {config.label}
    </Badge>
  );
}
