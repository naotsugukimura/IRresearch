"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Globe,
  Building,
  Building2,
  GraduationCap,
  Menu,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, type NavItem } from "@/lib/constants";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const ICON_MAP = {
  LayoutDashboard,
  Globe,
  Building,
  Building2,
  GraduationCap,
} as const;

function NavGroup({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const isGroupActive = item.children
    ? item.children.some((c) =>
        c.href === "/" ? pathname === "/" : pathname.startsWith(c.href)
      ) ||
      (item.href !== "/" && pathname.startsWith(item.href))
    : pathname === item.href;
  const [open, setOpen] = useState(isGroupActive);
  const Icon = ICON_MAP[item.icon as keyof typeof ICON_MAP];

  // No children — simple link
  if (!item.children) {
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          pathname === item.href
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
        )}
      >
        {Icon && <Icon className="h-4 w-4 shrink-0" />}
        {item.label}
      </Link>
    );
  }

  // With children — collapsible group
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          isGroupActive
            ? "text-accent-foreground"
            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
        )}
      >
        {Icon && <Icon className="h-4 w-4 shrink-0" />}
        <span className="flex-1 text-left">{item.label}</span>
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
            open && "rotate-90"
          )}
        />
      </button>
      {open && (
        <div className="ml-4 flex flex-col gap-0.5 border-l border-border pl-3 pt-0.5">
          {item.children.map((child) => {
            const isExactMatch =
              child.href === "/market" ||
              child.href === "/facility" ||
              child.href === "/company";
            const isChildActive = isExactMatch
              ? pathname === child.href
              : pathname.startsWith(child.href);
            return (
              <Link
                key={child.href}
                href={child.href}
                onClick={onNavigate}
                className={cn(
                  "rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                  isChildActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                {child.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

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
        <nav className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => (
            <NavGroup
              key={item.href}
              item={item}
              pathname={pathname}
              onNavigate={onNavigate}
            />
          ))}
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
