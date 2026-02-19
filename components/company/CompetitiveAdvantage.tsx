import {
  Shield,
  AlertTriangle,
  Sparkles,
  Lock,
  TriangleAlert,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CompetitiveAdvantage as CompetitiveAdvantageType } from "@/lib/types";

interface CompetitiveAdvantageProps {
  data: CompetitiveAdvantageType;
}

function ListSection({
  title,
  items,
  icon: Icon,
  color,
}: {
  title: string;
  items: string[];
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5" style={{ color }} />
        <h4 className="text-xs font-medium" style={{ color }}>
          {title}
        </h4>
      </div>
      <ul className="mt-1.5 space-y-1">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-xs text-muted-foreground"
          >
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: color }} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CompetitiveAdvantage({ data }: CompetitiveAdvantageProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">SWOT分析</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ListSection
            title="強み"
            items={data.strengths}
            icon={Shield}
            color="#10B981"
          />
          <ListSection
            title="弱み"
            items={data.weaknesses}
            icon={AlertTriangle}
            color="#F59E0B"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">競争環境</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ListSection
            title="差別化要素"
            items={data.differentiators}
            icon={Sparkles}
            color="#3B82F6"
          />
          <ListSection
            title="参入障壁"
            items={data.barriers}
            icon={Lock}
            color="#8B5CF6"
          />
          <ListSection
            title="リスク要因"
            items={data.risks}
            icon={TriangleAlert}
            color="#EF4444"
          />
        </CardContent>
      </Card>
    </div>
  );
}
