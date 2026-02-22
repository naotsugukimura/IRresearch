"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

export default function FacilityError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="max-w-md rounded-lg border border-border bg-card p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
          <AlertTriangle className="h-6 w-6 text-red-400" />
        </div>
        <h2 className="text-lg font-bold">
          データの読み込みに失敗しました
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {error.message || "不明なエラーが発生しました"}
        </p>
        <button
          onClick={reset}
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <RefreshCw className="h-4 w-4" />
          再読み込み
        </button>
      </div>
    </div>
  );
}
