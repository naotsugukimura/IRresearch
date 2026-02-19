import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <FileQuestion className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h1 className="mt-4 text-xl font-bold">ページが見つかりません</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <Link href="/">
          <Button variant="outline" className="mt-4">
            ダッシュボードに戻る
          </Button>
        </Link>
      </div>
    </div>
  );
}
