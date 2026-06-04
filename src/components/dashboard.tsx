"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { cn, formatMinutes } from "@/lib/utils";
import { PerSubjectBar } from "@/components/charts/per-subject-bar";
import { GoalProgressList } from "@/components/charts/goal-progress";
import { UpcomingTasks } from "@/components/upcoming-tasks";
import type { DashboardDTO } from "@/types/api";

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardContent>
        <div className="pt-2">
          <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
          <div className="mt-1 text-2xl font-bold text-foreground">{value}</div>
          {hint && <div className="mt-1 text-xs text-muted">{hint}</div>}
        </div>
      </CardContent>
    </Card>
  );
}

function LifetimeToggle({
  on,
  onChange,
}: {
  on: boolean;
  onChange: (on: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
      <span>Lifetime stats</span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label="Show lifetime stats"
        onClick={() => onChange(!on)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background",
          on ? "bg-indigo-600 dark:bg-indigo-500" : "bg-accent",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
            on && "translate-x-5",
          )}
        />
      </button>
    </label>
  );
}

export function Dashboard() {
  const toast = useToast();
  const [data, setData] = useState<DashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [lifetime, setLifetime] = useState(false);

  useEffect(() => {
    api.dashboard
      .get()
      .then(setData)
      .catch((e) => toast.show((e as Error).message, "error"))
      .finally(() => setLoading(false));
  }, [toast]);

  if (loading) {
    return <p className="text-sm text-muted">Loading dashboard…</p>;
  }
  if (!data) {
    return <p className="text-sm text-danger">Could not load dashboard.</p>;
  }

  const goalsCompleted = data.goalsProgress.filter((g) => g.percent >= 100).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <LifetimeToggle on={lifetime} onChange={setLifetime} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lifetime ? (
          <>
            <StatCard
              label="Total hours studied"
              value={formatMinutes(data.lifetimeMinutes)}
              hint="All-time study time"
            />
            <StatCard
              label="Sessions logged"
              value={String(data.sessionCount)}
              hint="All-time sessions"
            />
            <StatCard
              label="Goals completed"
              value={String(goalsCompleted)}
              hint={
                data.goalsProgress.length === 0
                  ? "No goals set yet"
                  : `of ${data.goalsProgress.length} active`
              }
            />
          </>
        ) : (
          <>
            <StatCard label="Today" value={formatMinutes(data.todayMinutes)} hint="Total study time today" />
            <StatCard label="This week" value={formatMinutes(data.weekMinutes)} hint="Mon–Sun total" />
            <StatCard
              label="Active goals"
              value={String(data.goalsProgress.length)}
              hint={
                data.goalsProgress.length === 0
                  ? "No goals set yet"
                  : `${goalsCompleted} completed`
              }
            />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>
              {lifetime
                ? "Minutes by subject — all time"
                : "Minutes by subject — this week"}
            </CardTitle>
            <CardDescription>Where you spent your study time.</CardDescription>
          </CardHeader>
          <CardContent>
            <PerSubjectBar
              data={lifetime ? data.perSubjectAllTime : data.perSubjectThisWeek}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Goal progress</CardTitle>
            <CardDescription>Current period for each goal.</CardDescription>
          </CardHeader>
          <CardContent>
            <GoalProgressList goals={data.goalsProgress} />
          </CardContent>
        </Card>
      </div>

      <UpcomingTasks />
    </div>
  );
}
