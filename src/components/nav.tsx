"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

const items = [
  { href: "/", label: "Dashboard" },
  { href: "/sessions", label: "Sessions" },
  { href: "/planner", label: "Planner" },
  { href: "/goals", label: "Goals" },
  { href: "/subjects", label: "Subjects" },
];

export function Nav({ userName }: { userName: string | null }) {
  const pathname = usePathname();

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-1">
          <Link href="/" className="mr-4 text-sm font-semibold text-foreground">
            📚 Study Tracker
          </Link>
          <nav className="hidden gap-1 sm:flex">
            {items.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-primary-soft text-primary-soft-foreground"
                      : "text-muted hover:bg-accent hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {userName && (
            <span className="hidden text-sm text-muted sm:inline">{userName}</span>
          )}
          <ThemeToggle />
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground hover:bg-accent"
          >
            Sign out
          </button>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-border px-2 py-1 sm:hidden">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "shrink-0 rounded-md px-3 py-1.5 text-sm",
                active
                  ? "bg-primary-soft text-primary-soft-foreground"
                  : "text-muted hover:bg-accent hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
