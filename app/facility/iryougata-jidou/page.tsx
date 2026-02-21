import { FacilityDetailPage } from "@/components/facility/FacilityDetailPage";
import { getFacilityAnalysis } from "@/lib/data";
import { notFound } from "next/navigation";

export default function Page() {
  const data = getFacilityAnalysis("64");
  if (!data) return notFound();
  return <FacilityDetailPage data={data} title="医療型児童発達支援" />;
}
