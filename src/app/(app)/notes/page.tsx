import { NotesFilter } from "@/components/notes-filter";

export default function NotesPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 text-xl font-bold text-foreground">Notes</h1>
      <NotesFilter />
    </div>
  );
}
