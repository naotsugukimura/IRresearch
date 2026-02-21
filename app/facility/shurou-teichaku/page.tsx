import { FacilityDetailPage } from "@/components/facility/FacilityDetailPage";
import { getFacilityAnalysis } from "@/lib/data";
import { notFound } from "next/navigation";

export default function Page() {
  const data = getFacilityAnalysis("33");
  if (!data) return notFound();
  return <FacilityDetailPage data={data} title="就労定着支援" />;
}
