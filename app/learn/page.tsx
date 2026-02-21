import { Sidebar, MobileNav } from "@/components/layout/Sidebar";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHeader } from "@/components/layout/PageHeader";
import { getGlossary } from "@/lib/data";
import { GLOSSARY_CATEGORY_COLORS, GLOSSARY_CATEGORY_ICONS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

export default function LearnPage() {
  const glossary = getGlossary();

  const categories = [
    { key: "common", data: glossary.common },
    { key: "retail", data: glossary.retail },
    { key: "saas", data: glossary.saas },
    { key: "recruitment", data: glossary.recruitment },
    { key: "media", data: glossary.media },
  ];

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
                title="学習サポート"
                description="業種別KPI・PLの戦略的読み解き方 ── 勝つための知識を装備せよ"
              />
            </div>
          </div>
        </div>
        <div className="max-w-4xl p-4 md:p-6 space-y-6">
          {/* Usage Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                {"\u{1F3AE}"} {glossary.steps.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {glossary.steps.items.map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-bep/20 flex items-center justify-center text-xs font-bold font-mono shrink-0 text-bep">
                      {item.step}
                    </div>
                    <p className="text-sm pt-1">{item.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Glossary Categories */}
          {categories.map(({ key, data }) => (
            <Card key={key}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <span>{GLOSSARY_CATEGORY_ICONS[key]}</span>
                  <span>{data.title}</span>
                  <Badge
                    variant="outline"
                    className="ml-2 text-xs"
                    style={{ borderColor: GLOSSARY_CATEGORY_COLORS[key], color: GLOSSARY_CATEGORY_COLORS[key] }}
                  >
                    {data.terms.length}項目
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Accordion type="multiple" className="w-full">
                  {data.terms.map((term, i) => (
                    <AccordionItem key={i} value={`${key}-${i}`}>
                      <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                        <span className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: GLOSSARY_CATEGORY_COLORS[key] }}
                          />
                          {term.term}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 pl-4">
                          <p className="text-sm text-muted-foreground">
                            {term.description}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="bg-muted/30 rounded-lg p-3">
                              <p className="text-xs text-muted-foreground mb-1 font-medium">
                                {"\u{1F5FA}\uFE0F"} 戦略メモ
                              </p>
                              <p className="text-sm">{term.formula}</p>
                            </div>
                            <div className="bg-muted/30 rounded-lg p-3">
                              <p className="text-xs text-muted-foreground mb-1 font-medium">
                                {"\u{1F3C6}"} クリア条件
                              </p>
                              <p className="text-sm">{term.benchmark}</p>
                            </div>
                          </div>
                          {term.actionTip && (
                            <div className="bg-bep/10 border border-bep/20 rounded-lg p-3">
                              <p className="text-xs text-bep mb-1 font-medium">
                                {"\u26A1"} ピンチの時の一手
                              </p>
                              <p className="text-sm">{term.actionTip}</p>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
