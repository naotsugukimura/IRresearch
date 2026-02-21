import { FacilityDetailPage } from "@/components/facility/FacilityDetailPage";
import { getHoukagoDayAnalysis } from "@/lib/data";

export default function HoukagoDayPage() {
  const data = getHoukagoDayAnalysis();
  return <FacilityDetailPage data={data} title="放課後等デイサービス" />;
}
