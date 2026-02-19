import { Sidebar, MobileNav } from "@/components/layout/Sidebar";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHeader } from "@/components/layout/PageHeader";
import { NoteList } from "@/components/notes/NoteList";
import { getCompanies, getAllNotes } from "@/lib/data";

export default function NotesPage() {
  const companies = getCompanies();
  const notes = getAllNotes();

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
                title="分析ノート"
                description="IR分析の気づき・学びの蓄積"
              />
            </div>
          </div>
        </div>
        <div className="p-4 md:p-6">
          <NoteList notes={notes} companies={companies} />
        </div>
      </main>
    </div>
  );
}
