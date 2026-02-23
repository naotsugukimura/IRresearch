import { Sidebar, MobileNav } from "@/components/layout/Sidebar";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHeader } from "@/components/layout/PageHeader";
import { ServiceFlowChartSection } from "@/components/facility/ServiceFlowChartSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Users, Building2, FileText, Activity } from "lucide-react";

const FLOW_PHASES = [
  {
    phase: "Phase 1",
    title: "相談・計画",
    icon: Users,
    color: "#3B82F6",
    steps: ["困りごと発生", "相談窓口へ", "サービス等利用計画案作成"],
    duration: "1-2週間",
  },
  {
    phase: "Phase 2",
    title: "申請・審査",
    icon: FileText,
    color: "#F59E0B",
    steps: ["市区町村に申請", "認定調査(80項目)", "障害支援区分認定", "支給決定・受給者証交付"],
    duration: "1-2ヶ月",
  },
  {
    phase: "Phase 3",
    title: "契約・利用開始",
    icon: Building2,
    color: "#10B981",
    steps: ["事業所選び・見学", "契約・重要事項説明", "個別支援計画作成", "サービス利用開始"],
    duration: "1-2週間",
  },
  {
    phase: "Phase 4",
    title: "モニタリング",
    icon: Activity,
    color: "#8B5CF6",
    steps: ["定期モニタリング", "計画見直し", "記録・報酬請求"],
    duration: "継続（3-6ヶ月ごと）",
  },
];

export default function ServiceFlowPage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-20 border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <MobileNav />
            <div>
              <Breadcrumb />
              <PageHeader
                title="障害福祉サービス 利用フロー"
                description="相談から利用開始・モニタリングまでの全体像をBPMN風フローチャートで可視化"
              />
            </div>
          </div>
        </div>
        <div className="p-4 md:p-6 space-y-6">
          {/* Phase Overview Cards */}
          <div className="grid grid-cols-4 gap-3">
            {FLOW_PHASES.map((phase, i) => {
              const Icon = phase.icon;
              return (
                <Card key={i} className="border-border/50" style={{ borderTopColor: phase.color, borderTopWidth: "2px" }}>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-4 w-4" style={{ color: phase.color }} />
                      <div>
                        <p className="text-[10px] text-muted-foreground">{phase.phase}</p>
                        <p className="text-xs font-bold" style={{ color: phase.color }}>{phase.title}</p>
                      </div>
                    </div>
                    <ul className="space-y-0.5">
                      {phase.steps.map((step, j) => (
                        <li key={j} className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: phase.color }} />
                          {step}
                        </li>
                      ))}
                    </ul>
                    <p className="text-[9px] text-muted-foreground mt-2 flex items-center gap-1">
                      <ArrowRight className="h-2.5 w-2.5" />
                      {phase.duration}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* BPMN Flow Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-400" />
                プロセスフロー図（BPMN風）
              </CardTitle>
              <p className="text-[10px] text-muted-foreground">
                4つのレーン（利用者/相談支援/市区町村/事業所）で各アクターの役割と連携を可視化。ズーム・スクロールで詳細確認できます。
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              <ServiceFlowChartSection />
            </CardContent>
          </Card>

          {/* Key Notes */}
          <Card className="border-border/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">補足情報</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid md:grid-cols-3 gap-3 text-[10px] text-muted-foreground">
                <div>
                  <p className="font-medium text-foreground mb-1">障害支援区分</p>
                  <p>区分1-6の6段階。区分が高いほど利用可能なサービスが増加。訓練等給付は区分不要の場合も。</p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">セルフプラン</p>
                  <p>相談支援事業所を経由せず、利用者自身がサービス等利用計画を作成する方法。指定相談支援不足地域で多い。</p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">モニタリング頻度</p>
                  <p>市区町村が決定。利用開始後3ヶ月以内、以降は3-6ヶ月ごとが標準。変更がある場合は随時。</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
