"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { formatMinutes } from "@/lib/utils";
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

export function Dashboard() {
  const toast = useToast();
  const [data, setData] = useState<DashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Today" value={formatMinutes(data.todayMinutes)} hint="Total study time today" />
        <StatCard label="This week" value={formatMinutes(data.weekMinutes)} hint="Mon–Sun total" />
        <StatCard
          label="Active goals"
          value={String(data.goalsProgress.length)}
          hint={
            data.goalsProgress.length === 0
              ? "No goals set yet"
              : `${data.goalsProgress.filter((g) => g.percent >= 100).length} completed`
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Minutes by subject — this week</CardTitle>
            <CardDescription>Where you spent your study time.</CardDescription>
          </CardHeader>
          <CardContent>
            <PerSubjectBar data={data.perSubjectThisWeek} />
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
