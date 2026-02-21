import Link from "next/link";
import { Sidebar, MobileNav } from "@/components/layout/Sidebar";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHeader } from "@/components/layout/PageHeader";
import { Building2, ArrowRight } from "lucide-react";

const SERVICE_TYPES = [
  {
    code: "65",
    name: "放課後等デイサービス",
    href: "/facility/houkago-day",
    description: "障害のある児童（小〜高校生）が放課後や休日に通い、療育支援を受けるサービス",
    stats: "約22,748事業所 / 約37.5万人利用",
    status: "available" as const,
  },
  {
    code: "63",
    name: "児童発達支援",
    href: "#",
    description: "就学前の障害のある子どもに対する発達支援サービス",
    stats: "約12,800事業所",
    status: "coming" as const,
  },
  {
    code: "32",
    name: "就労継続支援B型",
    href: "#",
    description: "一般企業等での就労が困難な障害者に働く場と工賃を提供",
    stats: "約17,000事業所",
    status: "coming" as const,
  },
  {
    code: "31",
    name: "就労継続支援A型",
    href: "#",
    description: "雇用契約に基づく就労機会と支援を提供",
    stats: "約4,350事業所",
    status: "coming" as const,
  },
  {
    code: "27",
    name: "就労移行支援",
    href: "#",
    description: "一般企業等への就職を目指す障害者への訓練・支援",
    stats: "約3,200事業所",
    status: "coming" as const,
  },
  {
    code: "22",
    name: "生活介護",
    href: "#",
    description: "常時介護を要する障害者への日中活動と介護サービス",
    stats: "約10,600事業所",
    status: "coming" as const,
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
                description="障害福祉サービス事業所のミクロ分析 — 参入法人・運営実態・収支構造"
              />
            </div>
          </div>
        </div>
        <div className="p-4 md:p-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICE_TYPES.map((svc) => {
              const isAvailable = svc.status === "available";
              const Wrapper = isAvailable ? Link : "div";
              return (
                <Wrapper
                  key={svc.code}
                  href={svc.href}
                  className={`group rounded-lg border border-border bg-card p-4 transition-colors ${
                    isAvailable
                      ? "hover:border-blue-500/50 hover:bg-accent/30"
                      : "opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <h3 className="text-sm font-bold">{svc.name}</h3>
                    </div>
                    {isAvailable ? (
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    ) : (
                      <span className="rounded-full bg-muted/40 px-1.5 py-0.5 text-[9px] text-muted-foreground">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                    {svc.description}
                  </p>
                  <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                    {svc.stats}
                  </p>
                </Wrapper>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
