import { SessionForm } from "@/components/session-form";

export default function NewSessionPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-xl font-bold text-slate-900">New session</h1>
      <SessionForm />
    </div>
  );
}
