"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { getCompanyById } from "@/lib/data";

const PATH_LABELS: Record<string, string> = {
  company: "企業分析",
  compare: "企業比較",
  trends: "業界トレンド",
  notes: "分析ノート",
};

export function Breadcrumb() {
  const pathname = usePathname();

  if (pathname === "/") return null;

  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [
    { label: "ダッシュボード", href: "/" },
  ];

  let currentPath = "";
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    currentPath += `/${seg}`;

    if (PATH_LABELS[seg]) {
      crumbs.push({ label: PATH_LABELS[seg], href: currentPath });
    } else if (i > 0 && segments[i - 1] === "company") {
      const company = getCompanyById(seg);
      crumbs.push({
        label: company?.name ?? seg,
        href: currentPath,
      });
    }
  }

  return (
    <nav className="flex items-center gap-1 text-xs text-muted-foreground">
      <Home className="h-3 w-3" />
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3 w-3" />}
          {i === crumbs.length - 1 ? (
            <span className="text-foreground">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-foreground">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
