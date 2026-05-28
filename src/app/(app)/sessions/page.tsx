import Link from "next/link";
import { SessionsList } from "@/components/sessions-list";

export default function SessionsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-foreground">Sessions</h1>
        <Link
          href="/sessions/new"
          className="inline-flex h-10 items-center justify-center rounded-md bg-indigo-600 px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background dark:bg-indigo-500 dark:hover:bg-indigo-400"
        >
          + New session
        </Link>
      </div>
      <SessionsList />
    </div>
  );
}
