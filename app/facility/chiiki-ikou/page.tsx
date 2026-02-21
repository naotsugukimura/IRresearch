import { FacilityDetailPage } from "@/components/facility/FacilityDetailPage";
import { getFacilityAnalysis } from "@/lib/data";
import { notFound } from "next/navigation";

export default function Page() {
  const data = getFacilityAnalysis("53");
  if (!data) return notFound();
  return <FacilityDetailPage data={data} title="地域相談支援（地域移行支援）" />;
}
