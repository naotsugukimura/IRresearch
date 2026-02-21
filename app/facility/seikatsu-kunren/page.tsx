import { FacilityDetailPage } from "@/components/facility/FacilityDetailPage";
import { getFacilityAnalysis } from "@/lib/data";
import { notFound } from "next/navigation";

export default function Page() {
  const data = getFacilityAnalysis("24");
  if (!data) return notFound();
  return <FacilityDetailPage data={data} title="自立訓練（生活訓練）" />;
}
