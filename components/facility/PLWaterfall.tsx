"use client";

import dynamic from "next/dynamic";
import type { FacilityPL } from "@/lib/types";

const PLWaterfallInner = dynamic(() => import("./PLWaterfallInner"), {
  ssr: false,
  loading: () => (
    <div className="h-[450px] animate-pulse rounded-lg bg-muted" />
  ),
});

interface Props {
  data: FacilityPL;
}

export function PLWaterfall(props: Props) {
  return <PLWaterfallInner {...props} />;
}
