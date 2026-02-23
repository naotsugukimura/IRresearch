import { Sidebar, MobileNav } from "@/components/layout/Sidebar";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Rocket,
  Users,
  TrendingUp,
  ArrowRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Building2,
  FileText,
  MapPin,
  Banknote,
  ShieldCheck,
  Briefcase,
  Scale,
} from "lucide-react";

// ============================================================
// 汎用ライフサイクルデータ（全サービス共通）
// ============================================================

const LIFECYCLE_PHASES = [
  {
    id: "pre-opening",
    label: "開業まで",
    period: "開業前 6〜12ヶ月",
    color: "#3B82F6",
    icon: Rocket,
    summary: "法人設立から指定申請・人員確保・物件契約まで。障害福祉サービスは都道府県・市区町村の「指定」を受けないと運営できない。",
    challenges: [
      { title: "物件探しの壁", severity: "high" as const, description: "消防法・建築基準法・バリアフリー要件を満たす物件は限られる。居抜きでない場合、改修費が数百万円規模に。" },
      { title: "人員基準の確保", severity: "high" as const, description: "管理者・サービス管理責任者（サビ管）等の有資格者確保が最大のボトルネック。採用市場は売り手優位。" },
      { title: "指定申請の複雑さ", severity: "medium" as const, description: "自治体ごとに書式・要件・審査スケジュールが異なる。申請から指定まで2〜3ヶ月かかることも。" },
      { title: "資金繰り", severity: "medium" as const, description: "開業〜初回入金まで約3ヶ月のタイムラグ。初期投資1,000〜3,000万円＋運転資金3ヶ月分の確保が必要。" },
    ],
    keyActions: [
      "事業計画書の策定（市場調査・競合分析・収支予測）",
      "法人設立（株式会社/合同会社/NPO/社福から選択）",
      "物件選定・賃貸契約・内装工事",
      "人員確保（サビ管・支援員・管理者）",
      "指定申請書類の準備・提出",
      "備品・システム（請求ソフト等）導入",
    ],
  },
  {
    id: "year-1",
    label: "1年目",
    period: "開業後 1〜12ヶ月",
    color: "#F59E0B",
    icon: Users,
    summary: "利用者獲得とキャッシュフロー安定化が最優先。相談支援事業所・自治体との関係構築が生命線。",
    challenges: [
      { title: "利用者獲得の壁", severity: "high" as const, description: "新規事業所の認知度はゼロ。相談支援専門員との関係構築に3〜6ヶ月かかる。定員の50%到達が最初の目標。" },
      { title: "キャッシュフロー", severity: "high" as const, description: "国保連からの入金は2ヶ月遅れ。開業3ヶ月目に最初の入金。それまでの運転資金が枯渇するリスク。" },
      { title: "スタッフ定着", severity: "medium" as const, description: "開業直後は業務フローが未整備で現場が混乱しやすい。離職率が高い時期。マニュアル整備と研修が重要。" },
      { title: "請求業務の習熟", severity: "medium" as const, description: "国保連請求は月1回。ミスがあると返戻（差し戻し）で入金が遅れる。初回請求は特に注意が必要。" },
    ],
    keyActions: [
      "相談支援事業所への挨拶回り・関係構築",
      "自治体窓口との連携体制構築",
      "利用者アセスメント・個別支援計画の作成",
      "国保連請求業務の確立",
      "スタッフ研修・OJT体制の整備",
      "利用者満足度の把握と改善",
    ],
  },
  {
    id: "year-2-3",
    label: "2〜3年目",
    period: "安定運営期",
    color: "#8B5CF6",
    icon: TrendingUp,
    summary: "定員充足・黒字化を達成し、運営を安定軌道に乗せる時期。報酬改定への対応と人材育成が課題。",
    challenges: [
      { title: "サビ管バーンアウト", severity: "high" as const, description: "サービス管理責任者に業務が集中しやすい。計画作成・記録・家族対応・スタッフ管理で疲弊するケースが多い。" },
      { title: "報酬改定の影響", severity: "high" as const, description: "3年ごとの報酬改定で単価が変動。基本報酬の引き下げや加算要件の変更に対応が必要。" },
      { title: "多店舗展開の判断", severity: "medium" as const, description: "1事業所が安定したら2号店を出すか？拙速な拡大は経営を圧迫。人材・資金・管理体制の準備が鍵。" },
      { title: "加算取得の最適化", severity: "medium" as const, description: "処遇改善加算・福祉専門職員配置加算等、取れる加算を最大化して収益性を向上させる。" },
    ],
    keyActions: [
      "加算取得の棚卸し・最適化",
      "中堅スタッフの育成（次のサビ管候補）",
      "業務効率化（ICT・記録システム活用）",
      "利用者の成果・アウトカム測定",
      "報酬改定情報の早期キャッチアップ",
      "2号店開設の可否判断・事業計画",
    ],
  },
  {
    id: "growth",
    label: "成長期・分岐",
    period: "3年目以降",
    color: "#10B981",
    icon: TrendingUp,
    summary: "事業を拡大するか、現状維持で質を高めるか、撤退するかの分岐点。経営判断の質が問われる。",
    challenges: [
      { title: "スケーリングの壁", severity: "high" as const, description: "多店舗展開にはエリアマネージャー的な中間管理職が必要。現場プレイヤーからマネジメント人材への育成が課題。" },
      { title: "法改正リスク", severity: "medium" as const, description: "障害者総合支援法の改正、報酬体系の見直し、人員配置基準の変更等。政策動向のモニタリングが不可欠。" },
      { title: "M&A・事業承継", severity: "medium" as const, description: "業界全体でM&Aが活発化。売却・買収・事業承継を視野に入れた経営計画が必要になる。" },
    ],
    keyActions: [
      "中期経営計画の策定（3〜5年）",
      "多角化の検討（複数サービス種別の運営）",
      "M&A・FC・事業承継の選択肢検討",
      "地域における差別化戦略の確立",
      "経営指標のダッシュボード化",
      "後継者・経営幹部の育成",
    ],
  },
];

const STARTUP_STEPS = [
  { step: 1, label: "事業計画策定", duration: "1〜2ヶ月", cost: "0〜50万円", icon: FileText, description: "市場調査・競合分析・収支予測。金融機関への融資申込にも使用。", tips: ["自治体の総量規制（新規指定の制限）を事前確認", "3年間の収支シミュレーションを作成"] },
  { step: 2, label: "法人設立", duration: "2週間〜1ヶ月", cost: "30〜100万円", icon: Scale, description: "株式会社・合同会社・NPO法人・社会福祉法人から選択。事業目的に「障害福祉サービス」を含める。", tips: ["合同会社は設立費用が安い（6万円〜）", "社福は信頼性は高いが設立に1年以上"] },
  { step: 3, label: "物件選定・契約", duration: "1〜3ヶ月", cost: "200〜500万円", icon: MapPin, description: "消防法・建築基準法・バリアフリー要件を満たす物件を探す。改修工事が必要な場合が多い。", tips: ["用途変更の手続きが必要な場合あり", "駐車場・送迎スペースの確保も重要"] },
  { step: 4, label: "人員確保", duration: "1〜3ヶ月", cost: "採用費50〜200万円", icon: Users, description: "管理者・サビ管・支援員の採用。福祉人材は売り手市場のため早期着手が必要。", tips: ["ハローワーク・福祉人材センター・Indeed・紹介会社を併用", "サビ管は資格要件あり（実務経験＋研修修了）"] },
  { step: 5, label: "指定申請", duration: "2〜3ヶ月", cost: "0〜30万円", icon: ShieldCheck, description: "都道府県・政令市に指定申請書類を提出。受理後、書類審査・実地確認を経て指定。", tips: ["自治体により締切日が異なる（毎月/隔月/四半期）", "行政書士に依頼する場合は15〜30万円"] },
  { step: 6, label: "設備・備品導入", duration: "2〜4週間", cost: "100〜300万円", icon: Building2, description: "机・椅子・PC・送迎車両・支援機器等。請求ソフト（カイポケ等）の導入も必須。", tips: ["補助金・助成金の活用を検討", "ICT導入支援事業の活用も可能"] },
  { step: 7, label: "体験利用・PR", duration: "2〜4週間", cost: "10〜50万円", icon: Briefcase, description: "開業前の体験利用会・内覧会を実施。相談支援事業所への挨拶回りを開始。", tips: ["チラシ・Webサイト・Googleマイビジネスの準備", "相談支援事業所へのFAX・訪問が最も効果的"] },
  { step: 8, label: "開業", duration: "—", cost: "—", icon: Rocket, description: "指定日に合わせて開業。初月は利用者数が少ないため、営業活動に注力。", tips: ["初回の国保連請求は翌月10日まで", "開業1ヶ月目は1〜3名の利用者からスタートが一般的"] },
];

const ENTITY_TYPES = [
  { type: "株式会社", cost: "約25万円", speed: "2週間", merit: "意思決定が早い・資金調達しやすい", demerit: "社会的信用がやや低い", share: "約45%", color: "#3B82F6" },
  { type: "合同会社", cost: "約6万円", speed: "1週間", merit: "設立費用が最安・定款認証不要", demerit: "知名度が低い・出資者=社員", share: "約15%", color: "#8B5CF6" },
  { type: "NPO法人", cost: "0円", speed: "3〜6ヶ月", merit: "社会的信用・助成金取りやすい", demerit: "設立に時間がかかる・意思決定が遅い", share: "約25%", color: "#10B981" },
  { type: "社会福祉法人", cost: "数百万円", speed: "1年以上", merit: "最高の社会的信用・税制優遇", demerit: "設立ハードル極めて高い", share: "約15%", color: "#F59E0B" },
];

// ============================================================
// ページコンポーネント
// ============================================================

export default function FacilityLifecyclePage() {
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
                title="事業所ライフサイクル"
                description="障害福祉サービス事業所の開業から成長までの全体像 — どのサービス種別にも共通する汎用的なフレームワーク"
              />
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 space-y-6">
          {/* Phase Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {LIFECYCLE_PHASES.map((phase) => {
              const Icon = phase.icon;
              return (
                <a key={phase.id} href={`#${phase.id}`} className="block group">
                  <Card className="border-border/50 h-full transition-all hover:shadow-md" style={{ borderTopColor: phase.color, borderTopWidth: "2px" }}>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="h-4 w-4" style={{ color: phase.color }} />
                        <span className="text-xs font-bold" style={{ color: phase.color }}>{phase.label}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{phase.period}</p>
                    </CardContent>
                  </Card>
                </a>
              );
            })}
          </div>

          {/* ─── 各フェーズ詳細 ─── */}
          {LIFECYCLE_PHASES.map((phase) => {
            const Icon = phase.icon;
            return (
              <section key={phase.id} id={phase.id}>
                <Card className="border-border/50" style={{ borderLeftColor: phase.color, borderLeftWidth: "3px" }}>
                  <CardContent className="p-4 md:p-6 space-y-4">
                    {/* Phase Header */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${phase.color}20` }}>
                        <Icon className="h-5 w-5" style={{ color: phase.color }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-bold text-foreground">{phase.label}</h2>
                          <Badge variant="outline" className="text-[10px]" style={{ borderColor: `${phase.color}40`, color: phase.color }}>
                            {phase.period}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{phase.summary}</p>
                      </div>
                    </div>

                    {/* Challenges */}
                    <div>
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <AlertTriangle className="h-3 w-3" />
                        よくある課題
                      </h3>
                      <div className="grid gap-2">
                        {phase.challenges.map((ch, i) => (
                          <div key={i} className="rounded-md bg-accent/20 px-3 py-2">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs font-bold text-foreground">{ch.title}</span>
                              <Badge
                                variant="outline"
                                className="text-[8px] py-0 px-1"
                                style={{
                                  borderColor: ch.severity === "high" ? "#EF444460" : "#F59E0B60",
                                  color: ch.severity === "high" ? "#EF4444" : "#F59E0B",
                                }}
                              >
                                {ch.severity === "high" ? "重要" : "注意"}
                              </Badge>
                            </div>
                            <p className="text-[10px] text-muted-foreground">{ch.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Key Actions */}
                    <div>
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3" />
                        やるべきこと
                      </h3>
                      <ul className="grid gap-1">
                        {phase.keyActions.map((action, i) => (
                          <li key={i} className="flex items-start gap-2 text-[11px]">
                            <span className="mt-0.5 shrink-0" style={{ color: phase.color }}>▸</span>
                            <span className="text-foreground">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </section>
            );
          })}

          {/* ─── 開業までの流れ（8ステップ） ─── */}
          <section id="startup-flow">
            <Card className="border-border/50" style={{ borderLeftColor: "#3B82F6", borderLeftWidth: "3px" }}>
              <CardContent className="p-4 md:p-6 space-y-4">
                <div>
                  <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Rocket className="h-5 w-5 text-blue-400" />
                    開業までの流れ（全8ステップ）
                  </h2>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">総期間: </span>
                      <span className="font-bold text-foreground">6〜12ヶ月</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <Banknote className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">総費用: </span>
                      <span className="font-bold text-foreground">1,000〜3,000万円</span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="flex gap-0.5">
                  {STARTUP_STEPS.map((s, i) => (
                    <div
                      key={i}
                      className="h-1.5 rounded-full flex-1"
                      style={{ backgroundColor: `hsl(${210 + i * 15}, 70%, ${50 + i * 3}%)` }}
                    />
                  ))}
                </div>

                {/* Steps Timeline */}
                <div className="space-y-3">
                  {STARTUP_STEPS.map((s) => {
                    const Icon = s.icon;
                    return (
                      <div key={s.step} className="flex gap-3">
                        {/* Step Number */}
                        <div className="flex flex-col items-center shrink-0">
                          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center border border-border">
                            <span className="text-xs font-bold text-foreground">{s.step}</span>
                          </div>
                          {s.step < 8 && <div className="w-px flex-1 bg-border mt-1" />}
                        </div>

                        {/* Content */}
                        <div className="pb-3 flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs font-bold text-foreground">{s.label}</span>
                            {s.duration !== "—" && (
                              <Badge variant="outline" className="text-[9px] py-0 px-1">{s.duration}</Badge>
                            )}
                            {s.cost !== "—" && (
                              <Badge variant="outline" className="text-[9px] py-0 px-1 text-emerald-400 border-emerald-400/40">{s.cost}</Badge>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground">{s.description}</p>
                          {s.tips.length > 0 && (
                            <div className="mt-1 space-y-0.5">
                              {s.tips.map((tip, i) => (
                                <p key={i} className="text-[9px] text-blue-400 flex items-start gap-1">
                                  <span className="shrink-0">💡</span>
                                  {tip}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ─── 法人格比較 ─── */}
          <section id="entity-types">
            <Card className="border-border/50">
              <CardContent className="p-4 md:p-6 space-y-3">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Scale className="h-5 w-5 text-muted-foreground" />
                  法人格の選び方
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  障害福祉サービスの運営には法人格が必須。事業規模・スピード・信用度に応じて最適な法人格を選択する。
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="border-b border-border bg-accent/30">
                        <th className="text-left py-2 px-3 font-bold text-muted-foreground">法人格</th>
                        <th className="text-right py-2 px-3 font-bold text-muted-foreground">設立費用</th>
                        <th className="text-right py-2 px-3 font-bold text-muted-foreground">設立期間</th>
                        <th className="text-left py-2 px-3 font-bold text-muted-foreground">メリット</th>
                        <th className="text-left py-2 px-3 font-bold text-muted-foreground">デメリット</th>
                        <th className="text-right py-2 px-3 font-bold text-muted-foreground">業界シェア</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ENTITY_TYPES.map((e) => (
                        <tr key={e.type} className="border-b border-border/30 hover:bg-accent/20 transition-colors">
                          <td className="py-2 px-3 font-medium text-foreground">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: e.color }} />
                              {e.type}
                            </div>
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-foreground">{e.cost}</td>
                          <td className="py-2 px-3 text-right text-muted-foreground">{e.speed}</td>
                          <td className="py-2 px-3 text-emerald-400">{e.merit}</td>
                          <td className="py-2 px-3 text-red-400">{e.demerit}</td>
                          <td className="py-2 px-3 text-right font-mono text-foreground">{e.share}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ─── サービス別ライフサイクルへの導線 ─── */}
          <Card className="border-border/30">
            <CardContent className="p-4">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                サービス別の詳細ライフサイクル
              </h3>
              <p className="text-[10px] text-muted-foreground mb-3">
                各サービス種別固有の課題・費用・人員基準は、サービス別ページの「ライフサイクル」セクションで確認できます。
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { href: "/facility/houkago-day", label: "放課後デイ" },
                  { href: "/facility/jidou-hattatsu", label: "児童発達支援" },
                  { href: "/facility/shurou-ikou", label: "就労移行支援" },
                  { href: "/facility/shurou-b", label: "就労継続B型" },
                  { href: "/facility/group-home", label: "グループホーム" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors rounded-md border border-border/50 px-2 py-1 hover:bg-accent/20"
                  >
                    {link.label}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
