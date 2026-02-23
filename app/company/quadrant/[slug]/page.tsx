import { notFound } from "next/navigation";
import { QuadrantDetailPage } from "@/components/company/QuadrantDetailPage";
import { QUADRANT_CONFIG, QUADRANT_SLUG_MAP } from "@/lib/constants";
import { getCompaniesByQuadrant, getLatestFiscalYear, getQ1OpsData, getQ2BusinessModels, getQ3IndustryForce, getQ1BpmnModels } from "@/lib/data";
import type { Quadrant, FiscalYear } from "@/lib/types";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return Object.values(QUADRANT_CONFIG).map((config) => ({
    slug: config.slug,
  }));
}

export default async function QuadrantPage({ params }: Props) {
  const { slug } = await params;
  const quadrant = QUADRANT_SLUG_MAP[slug] as Quadrant | undefined;

  if (!quadrant) {
    notFound();
  }

  const config = QUADRANT_CONFIG[quadrant];
  const companies = getCompaniesByQuadrant(quadrant);

  // 各社の最新財務データを取得
  const financialsMap: Record<string, FiscalYear | null> = {};
  for (const c of companies) {
    financialsMap[c.id] = getLatestFiscalYear(c.id);
  }

  // 象限別データ
  const q1OpsData = quadrant === "Q1" ? getQ1OpsData() : undefined;
  const q2BizData = quadrant === "Q2" ? getQ2BusinessModels() : undefined;
  const q3IndustryData = quadrant === "Q3" ? getQ3IndustryForce() : undefined;
  const q1BpmnData = quadrant === "Q1" ? getQ1BpmnModels() : undefined;

  return (
    <QuadrantDetailPage
      quadrant={quadrant}
      config={config}
      companies={companies}
      financialsMap={financialsMap}
      q1OpsData={q1OpsData}
      q2BizData={q2BizData}
      q3IndustryData={q3IndustryData}
      q1BpmnData={q1BpmnData}
    />
  );
}
