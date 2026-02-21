"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Globe,
  Building,
  Building2,
  GitCompareArrows,
  TrendingUp,
  StickyNote,
  GraduationCap,
  Menu,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const ICON_MAP = {
  LayoutDashboard,
  Globe,
  Building,
  Building2,
  GitCompareArrows,
  TrendingUp,
  StickyNote,
  GraduationCap,
} as const;

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-4 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
          IR
        </div>
        <div>
          <h1 className="text-sm font-bold leading-tight">競合IR分析</h1>
          <p className="text-[10px] text-muted-foreground">障害福祉支援部</p>
        </div>
      </div>
      <Separator />
      <ScrollArea className="flex-1 px-2 py-3">
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = ICON_MAP[item.icon as keyof typeof ICON_MAP];
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
      <Separator />
      <div className="px-4 py-3">
        <p className="text-[10px] text-muted-foreground">
          SMS株式会社 障害福祉支援部
        </p>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-56 shrink-0 border-r border-border bg-card md:block">
      <NavContent />
    </aside>
  );
}

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-56 p-0">
        <NavContent onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
