import { SubjectsManager } from "@/components/subjects-manager";

export default function SubjectsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 text-xl font-bold text-foreground">Subjects</h1>
      <SubjectsManager />
    </div>
  );
}
