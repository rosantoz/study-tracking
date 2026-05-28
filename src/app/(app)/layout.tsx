import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Nav } from "@/components/nav";
import { AuthSessionProvider } from "@/components/session-provider";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <AuthSessionProvider>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <Nav userName={session.user.name ?? session.user.email ?? null} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
          {children}
        </main>
      </div>
    </AuthSessionProvider>
  );
}
