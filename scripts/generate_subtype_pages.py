"""
Generate Next.js page files for all disability sub-type detail pages.
Reads from data/disability-subtypes/*.json and creates app/disability/{parent}/{slug}/page.tsx
"""
import json
import os
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data" / "disability-subtypes"
APP_DIR = Path(__file__).parent.parent / "app" / "disability"

# Load all subtype JSONs
subtype_files = sorted(DATA_DIR.glob("*.json"))

PAGE_TEMPLATE = '''import {{ Sidebar, MobileNav }} from "@/components/layout/Sidebar";
import {{ Breadcrumb }} from "@/components/layout/Breadcrumb";
import {{ PageHeader }} from "@/components/layout/PageHeader";
import {{ SubTypeDetailPage }} from "@/components/disability/SubTypeDetailPage";
import {{ getDisabilitySubType }} from "@/lib/data";
import {{ notFound }} from "next/navigation";

export default function {func_name}Page() {{
  const data = getDisabilitySubType("{parent_id}", "{sub_id}");
  if (!data) return notFound();

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-20 border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <MobileNav />
            <div>
              <Breadcrumb />
              <PageHeader
                title={{data.name}}
                description={{`{parent_title} > ${{data.name}}`}}
              />
            </div>
          </div>
        </div>
        <div className="p-4 md:p-6">
          <SubTypeDetailPage data={{data}} />
        </div>
      </main>
    </div>
  );
}}
'''

def slug_to_func_name(slug):
    """Convert slug to PascalCase function name."""
    parts = slug.replace("-", " ").split()
    return "".join(p.capitalize() for p in parts)


total_pages = 0

for sf in subtype_files:
    with open(sf, "r", encoding="utf-8") as f:
        data = json.load(f)

    parent_id = data["parentId"]
    parent_title = data["parentTitle"]

    for sub in data["subTypes"]:
        sub_id = sub["id"]
        func_name = slug_to_func_name(sub_id)

        # Create directory
        page_dir = APP_DIR / parent_id / sub_id
        page_dir.mkdir(parents=True, exist_ok=True)

        # Write page file
        content = PAGE_TEMPLATE.format(
            func_name=func_name,
            parent_id=parent_id,
            sub_id=sub_id,
            parent_title=parent_title,
        )

        page_file = page_dir / "page.tsx"
        with open(page_file, "w", encoding="utf-8") as f:
            f.write(content)

        total_pages += 1

print(f"Generated {total_pages} sub-type pages from {len(subtype_files)} category files")
