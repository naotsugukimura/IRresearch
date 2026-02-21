#!/usr/bin/env python3
"""Generate Next.js page files for all facility analysis service types."""

import os

BASE = os.path.join(os.path.dirname(__file__), "..", "app", "facility")

# slug -> (serviceCode, title)
SERVICES = {
    "jidou-hattatsu":   ("63", "児童発達支援"),
    "iryougata-jidou":  ("64", "医療型児童発達支援"),
    "kyotaku-houmon":   ("66", "居宅訪問型児童発達支援"),
    "hoikusho-houmon":  ("67", "保育所等訪問支援"),
    "group-home":       ("35", "共同生活援助（グループホーム）"),
    "jiritsu-seikatsu": ("36", "自立生活援助"),
    "kinou-kunren":     ("23", "自立訓練（機能訓練）"),
    "seikatsu-kunren":  ("24", "自立訓練（生活訓練）"),
    "shukuhaku-kunren": ("25", "宿泊型自立訓練"),
    "shurou-ikou":      ("27", "就労移行支援"),
    "shurou-a":         ("31", "就労継続支援A型"),
    "shurou-b":         ("32", "就労継続支援B型"),
    "shurou-teichaku":  ("33", "就労定着支援"),
    "chiiki-ikou":      ("53", "地域相談支援（地域移行支援）"),
    "chiiki-teichaku":  ("54", "地域相談支援（地域定着支援）"),
    "keikaku-soudan":   ("46", "計画相談支援"),
    "shougaiji-soudan": ("47", "障害児相談支援"),
}

TEMPLATE = '''import {{ FacilityDetailPage }} from "@/components/facility/FacilityDetailPage";
import {{ getFacilityAnalysis }} from "@/lib/data";
import {{ notFound }} from "next/navigation";

export default function Page() {{
  const data = getFacilityAnalysis("{code}");
  if (!data) return notFound();
  return <FacilityDetailPage data={{data}} title="{title}" />;
}}
'''

if __name__ == "__main__":
    for slug, (code, title) in SERVICES.items():
        dir_path = os.path.join(BASE, slug)
        os.makedirs(dir_path, exist_ok=True)
        page_path = os.path.join(dir_path, "page.tsx")
        content = TEMPLATE.format(code=code, title=title)
        with open(page_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"  Created: {page_path}")
    print(f"\nDone! Generated {len(SERVICES)} page files.")
