import Link from "next/link";
import { Sidebar, MobileNav } from "@/components/layout/Sidebar";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHeader } from "@/components/layout/PageHeader";
import { Building2, ArrowRight, Baby, Home, Briefcase, MessageSquare } from "lucide-react";

type ServiceEntry = {
  code: string;
  name: string;
  href: string;
  description: string;
  stats: string;
};

type ServiceCategory = {
  label: string;
  icon: typeof Building2;
  color: string;
  services: ServiceEntry[];
};

const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    label: "障害児通所系",
    icon: Baby,
    color: "text-blue-400",
    services: [
      { code: "65", name: "放課後等デイサービス", href: "/facility/houkago-day", description: "障害のある児童が放課後や休日に通い、療育支援を受けるサービス", stats: "約22,748事業所 / 約37.5万人利用" },
      { code: "63", name: "児童発達支援", href: "/facility/jidou-hattatsu", description: "就学前の障害のある子どもに対する発達支援サービス", stats: "約12,800事業所 / 約23万人利用" },
      { code: "64", name: "医療型児童発達支援", href: "/facility/iryougata-jidou", description: "医療機関に併設し、PT/OT/ST等による医療的リハビリを提供", stats: "約90事業所 / 約2,320人利用" },
      { code: "66", name: "居宅訪問型児童発達支援", href: "/facility/kyotaku-houmon", description: "通所が困難な重度障害児の居宅を訪問して支援を行うサービス", stats: "約350事業所 / 約3,500人利用" },
      { code: "67", name: "保育所等訪問支援", href: "/facility/hoikusho-houmon", description: "保育所・学校等を訪問し、集団生活への適応を支援", stats: "約1,800事業所 / 約6.5万人利用" },
    ],
  },
  {
    label: "居住系",
    icon: Home,
    color: "text-emerald-400",
    services: [
      { code: "35", name: "共同生活援助（GH）", href: "/facility/group-home", description: "障害者が共同生活を営む住居。世話人・生活支援員が配置", stats: "約13,500事業所 / 約22万人利用" },
      { code: "36", name: "自立生活援助", href: "/facility/jiritsu-seikatsu", description: "GH退所者等の一人暮らし障害者への定期訪問＋随時相談", stats: "約800事業所 / 約8,500人利用" },
    ],
  },
  {
    label: "訓練系・就労系",
    icon: Briefcase,
    color: "text-amber-400",
    services: [
      { code: "23", name: "自立訓練（機能訓練）", href: "/facility/kinou-kunren", description: "身体機能の維持・回復を目的としたリハビリ中心の訓練", stats: "約220事業所 / 約4,000人利用" },
      { code: "24", name: "自立訓練（生活訓練）", href: "/facility/seikatsu-kunren", description: "日常生活能力の維持・向上を目的とした訓練（調理・掃除・金銭管理等）", stats: "約1,600事業所 / 約2.2万人利用" },
      { code: "25", name: "宿泊型自立訓練", href: "/facility/shukuhaku-kunren", description: "生活訓練の夜間版。居室を提供し宿泊しながら自立を支援", stats: "約250事業所 / 約3,000人利用" },
      { code: "27", name: "就労移行支援", href: "/facility/shurou-ikou", description: "一般企業等への就職を目指す障害者への訓練・就活支援", stats: "約3,200事業所 / 約3.4万人利用" },
      { code: "31", name: "就労継続支援A型", href: "/facility/shurou-a", description: "雇用契約に基づく就労機会と支援を提供。最低賃金の支払いが必要", stats: "約4,350事業所 / 約8.5万人利用" },
      { code: "32", name: "就労継続支援B型", href: "/facility/shurou-b", description: "雇用契約なし。工賃（作業対価）を支払う。利用期間の制限なし", stats: "約17,000事業所 / 約37.5万人利用" },
      { code: "33", name: "就労定着支援", href: "/facility/shurou-teichaku", description: "一般就労後の障害者への職場定着支援（企業訪問・相談）", stats: "約1,600事業所 / 約3.2万人利用" },
    ],
  },
  {
    label: "相談系",
    icon: MessageSquare,
    color: "text-purple-400",
    services: [
      { code: "53", name: "地域移行支援", href: "/facility/chiiki-ikou", description: "入所施設・精神科病院からの地域生活への移行を支援", stats: "約550事業所 / 約3,400人利用" },
      { code: "54", name: "地域定着支援", href: "/facility/chiiki-teichaku", description: "一人暮らし障害者への24時間連絡体制の確保と緊急訪問", stats: "約500事業所 / 約4,400人利用" },
      { code: "46", name: "計画相談支援", href: "/facility/keikaku-soudan", description: "障害福祉サービスの利用計画を作成する相談支援事業", stats: "約12,000事業所 / 約100万人利用" },
      { code: "47", name: "障害児相談支援", href: "/facility/shougaiji-soudan", description: "障害児の通所サービス利用計画を作成する相談支援", stats: "約7,500事業所 / 約55万人利用" },
    ],
  },
];

export default function FacilityIndexPage() {
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
                title="事業所分析"
                description="障害福祉サービス全19種のミクロ分析 — 参入法人・運営実態・収支構造"
              />
            </div>
          </div>
        </div>
        <div className="space-y-6 p-4 md:p-6">
          {SERVICE_CATEGORIES.map((cat) => (
            <div key={cat.label}>
              <div className="mb-2 flex items-center gap-2">
                <cat.icon className={`h-4 w-4 ${cat.color}`} />
                <h2 className="text-sm font-bold">{cat.label}</h2>
                <span className="text-[10px] text-muted-foreground">
                  {cat.services.length}サービス
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {cat.services.map((svc) => (
                  <Link
                    key={svc.code}
                    href={svc.href}
                    className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-blue-500/50 hover:bg-accent/30"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-bold">{svc.name}</h3>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </div>
                    <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                      {svc.description}
                    </p>
                    <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                      {svc.stats}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
