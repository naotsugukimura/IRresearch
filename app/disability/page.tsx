import Link from "next/link";
import { Sidebar, MobileNav } from "@/components/layout/Sidebar";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHeader } from "@/components/layout/PageHeader";
import { ArrowRight, Accessibility, Brain, HeartPulse, Sparkles, Zap, Shield, HeartHandshake, AlertTriangle, Wine, Clock, Layers, Syringe, Scale, Home } from "lucide-react";

type DisabilityEntry = {
  id: string;
  name: string;
  href: string;
  description: string;
  stats: string;
  color: string;
  icon: typeof Accessibility;
};

type DisabilityGroup = {
  label: string;
  icon: typeof Accessibility;
  color: string;
  bgColor: string;
  description: string;
  entries: DisabilityEntry[];
};

const DISABILITY_GROUPS: DisabilityGroup[] = [
  {
    label: "三障害（手帳制度）",
    icon: Accessibility,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    description: "障害者手帳の3区分＋発達障害者支援法。障害福祉サービスの基本となる4分類",
    entries: [
      { id: "physical", name: "身体障害", href: "/disability/physical", description: "視覚・聴覚・肢体不自由・内部障害。障害者手帳1〜6級", stats: "約436万人", color: "#3B82F6", icon: Accessibility },
      { id: "intellectual", name: "知的障害", href: "/disability/intellectual", description: "知的機能と適応行動の制限。療育手帳A（重度）・B（中軽度）", stats: "約109万人", color: "#10B981", icon: Brain },
      { id: "mental", name: "精神障害", href: "/disability/mental", description: "統合失調症・うつ病・双極性障害・PTSD等。精神障害者保健福祉手帳1〜3級", stats: "約614万人", color: "#8B5CF6", icon: HeartPulse },
      { id: "developmental", name: "発達障害", href: "/disability/developmental", description: "ASD・ADHD・LD等。生まれつきの脳機能の違い。2005年発達障害者支援法", stats: "約48万人（潜在数百万）", color: "#F59E0B", icon: Sparkles },
    ],
  },
  {
    label: "専門領域",
    icon: Zap,
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
    description: "手帳制度の谷間や特殊な支援アプローチが必要な障害種別",
    entries: [
      { id: "acquired-brain", name: "高次脳機能障害", href: "/disability/acquired-brain", description: "交通事故・脳卒中後の認知障害。記憶・注意・遂行機能の障害", stats: "約50万人", color: "#EC4899", icon: Zap },
      { id: "intractable", name: "難病", href: "/disability/intractable", description: "指定難病341疾患。手帳なしでも障害福祉サービス利用可能", stats: "約105万人", color: "#06B6D4", icon: Shield },
      { id: "addiction", name: "依存症", href: "/disability/addiction", description: "アルコール・薬物・ギャンブル。自助グループが回復の柱", stats: "推定100万人以上", color: "#7C3AED", icon: Wine },
      { id: "dementia", name: "認知症（若年性含む）", href: "/disability/dementia", description: "65歳未満の若年性認知症は障害福祉サービスの対象", stats: "約3.6万人（若年性）", color: "#0891B2", icon: Clock },
    ],
  },
  {
    label: "複合・重度",
    icon: HeartHandshake,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    description: "高度な専門性と手厚い人員配置が求められる支援領域",
    entries: [
      { id: "severe-multiple", name: "重症心身障害", href: "/disability/severe-multiple", description: "重度の知的障害＋重度の身体障害。医療的ケアが常時必要", stats: "約4.3万人", color: "#DC2626", icon: HeartHandshake },
      { id: "challenging-behavior", name: "強度行動障害", href: "/disability/challenging-behavior", description: "自傷・他害・物壊し等が著しい状態。専門研修修了者の配置が加算要件", stats: "推定6〜8万人", color: "#EA580C", icon: AlertTriangle },
      { id: "multiple", name: "重複障害", href: "/disability/multiple", description: "2種以上の障害が重複。盲ろう・知的＋精神等。計画相談の難所", stats: "推定35万人", color: "#6D28D9", icon: Layers },
      { id: "medical-care-child", name: "医療的ケア児", href: "/disability/medical-care-child", description: "人工呼吸器・経管栄養等が必要な児童。2021年支援法施行", stats: "約2万人", color: "#059669", icon: Syringe },
    ],
  },
  {
    label: "社会的課題",
    icon: Scale,
    color: "text-gray-400",
    bgColor: "bg-gray-500/10",
    description: "障害認定の枠に収まりにくいが、障害福祉サービスとの接点が重要な領域",
    entries: [
      { id: "justice-involved", name: "触法障害者", href: "/disability/justice-involved", description: "罪を犯した障害者。受刑者の約20%に知的障害の疑い。司法と福祉の連携", stats: "推定2.7万人", color: "#4B5563", icon: Scale },
      { id: "social-withdrawal", name: "社会的ひきこもり", href: "/disability/social-withdrawal", description: "6ヶ月以上の社会的孤立。8050問題。自立訓練が回復の入口に", stats: "約146万人", color: "#78716C", icon: Home },
    ],
  },
];

export default function DisabilityIndexPage() {
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
                title="障害理解"
                description="障害特性と必要なサポート ── 14種の障害を支援者・同僚として知っておくべきこと"
              />
            </div>
          </div>
        </div>
        <div className="space-y-6 p-4 md:p-6">
          {DISABILITY_GROUPS.map((group) => (
            <div key={group.label}>
              <div className="mb-3 flex items-center gap-2">
                <div className={`rounded-md p-1.5 ${group.bgColor}`}>
                  <group.icon className={`h-4 w-4 ${group.color}`} />
                </div>
                <h2 className="text-sm font-bold">{group.label}</h2>
                <span className="text-[10px] text-muted-foreground">
                  {group.entries.length}種
                </span>
              </div>
              <p className="mb-3 text-xs text-muted-foreground">
                {group.description}
              </p>

              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-4 py-2 text-[11px] font-medium text-muted-foreground">障害種別</th>
                      <th className="px-4 py-2 text-[11px] font-medium text-muted-foreground">推定人数</th>
                      <th className="hidden px-4 py-2 text-[11px] font-medium text-muted-foreground md:table-cell">概要</th>
                      <th className="w-8 px-2 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.entries.map((entry) => (
                      <tr
                        key={entry.id}
                        className="group border-b border-border/50 last:border-b-0 transition-colors hover:bg-accent/30"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={entry.href}
                            className="flex items-center gap-2 text-xs font-bold hover:opacity-80"
                            style={{ color: entry.color }}
                          >
                            <entry.icon className="h-3.5 w-3.5 shrink-0" />
                            {entry.name}
                          </Link>
                          <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground md:hidden">
                            {entry.description}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="whitespace-nowrap font-mono text-[11px] text-muted-foreground">
                            {entry.stats}
                          </span>
                        </td>
                        <td className="hidden px-4 py-3 md:table-cell">
                          <p className="text-[11px] leading-relaxed text-muted-foreground">
                            {entry.description}
                          </p>
                        </td>
                        <td className="px-2 py-3">
                          <Link href={entry.href}>
                            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
