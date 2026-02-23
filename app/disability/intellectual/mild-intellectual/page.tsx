import { Sidebar, MobileNav } from "@/components/layout/Sidebar";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHeader } from "@/components/layout/PageHeader";
import { SubTypeDetailPage } from "@/components/disability/SubTypeDetailPage";
import { getDisabilitySubType } from "@/lib/data";
import { notFound } from "next/navigation";

export default function MildIntellectualPage() {
  const data = getDisabilitySubType("intellectual", "mild-intellectual");
  if (!data) return notFound();

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
                title={data.name}
                description={`知的障害 > ${data.name}`}
              />
            </div>
          </div>
        </div>
        <div className="p-4 md:p-6">
          <SubTypeDetailPage data={data} />
        </div>
      </main>
    </div>
  );
}
