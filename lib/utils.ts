import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { CompanyCategory, ThreatLevel } from "./types";
import { CATEGORY_CONFIG, THREAT_LEVEL_CONFIG, COMPANY_COLORS } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================================
// 数値フォーマッタ
// ============================================================

export function formatCurrency(value: number, unit: "million" = "million"): string {
  if (unit === "million") {
    if (value >= 10000) {
      return `${(value / 10000).toFixed(1)}兆`;
    }
    if (value >= 100) {
      return `${(value / 10).toFixed(0)}億`;
    }
    return `${value}百万`;
  }
  return `${value}`;
}

export function formatRevenue(value: number): string {
  if (value >= 100000) {
    return `${(value / 1000).toFixed(0)}億`;
  }
  if (value >= 10000) {
    return `${(value / 1000).toFixed(1)}億`;
  }
  return `${value.toLocaleString()}百万`;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString("ja-JP");
}

// ============================================================
// カラーゲッター
// ============================================================

export function getCategoryColor(category: CompanyCategory): string {
  return CATEGORY_CONFIG[category].color;
}

export function getCategoryLabel(category: CompanyCategory): string {
  return CATEGORY_CONFIG[category].label;
}

export function getThreatColor(level: ThreatLevel): string {
  return THREAT_LEVEL_CONFIG[level].color;
}

export function getThreatLabel(level: ThreatLevel): string {
  return THREAT_LEVEL_CONFIG[level].label;
}

export function getCompanyColor(companyId: string): string {
  return COMPANY_COLORS[companyId] ?? "#6B7280";
}

// ============================================================
// 日付
// ============================================================

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export function formatYearMonth(year: number, month?: number): string {
  if (month) {
    return `${year}年${month}月`;
  }
  return `${year}年`;
}

// ============================================================
// YoY計算
// ============================================================

export function calcYoY(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}
