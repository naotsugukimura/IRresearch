"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TrendsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/market");
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-sm text-muted-foreground">リダイレクト中...</p>
    </div>
  );
}
