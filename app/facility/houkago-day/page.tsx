import { FacilityDetailPage } from "@/components/facility/FacilityDetailPage";
import { getFacilityAnalysis } from "@/lib/data";
import { notFound } from "next/navigation";

export default function HoukagoDayPage() {
  const data = getFacilityAnalysis("65");
  if (!data) return notFound();
  return <FacilityDetailPage data={data} title="放課後等デイサービス" />;
}
