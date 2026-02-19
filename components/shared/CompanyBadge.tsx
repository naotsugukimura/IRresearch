import { cn } from "@/lib/utils";
import { getCompanyColor } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface CompanyBadgeProps {
  companyId: string;
  name: string;
  className?: string;
}

export function CompanyBadge({ companyId, name, className }: CompanyBadgeProps) {
  const color = getCompanyColor(companyId);

  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5", className)}
    >
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs">{name}</span>
    </Badge>
  );
}
