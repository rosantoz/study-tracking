"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { isoDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { PlannedTaskDTO } from "@/types/api";

type Filter = "today" | "upcoming";

export function UpcomingTasks() {
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>("upcoming");
  const [tasks, setTasks] = useState<PlannedTaskDTO[] | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    async (f: Filter) => {
      setLoading(true);
      try {
        const today = isoDate(new Date());
        const params =
          f === "today"
            ? { from: today, to: today, status: "PENDING" as const }
            : { from: today, status: "PENDING" as const };
        const { tasks } = await api.tasks.list(params);
        setTasks(tasks);
      } catch (err) {
        toast.show((err as Error).message, "error");
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    load(filter);
  }, [filter, load]);

  async function onComplete(task: PlannedTaskDTO) {
    setTasks((prev) => prev?.filter((t) => t.id !== task.id) ?? prev);
    try {
      await api.tasks.update(task.id, { status: "COMPLETED" });
      toast.show("Task completed", "success");
    } catch (err) {
      setTasks((prev) => (prev ? [...prev, task] : prev));
      toast.show((err as Error).message, "error");
    }
  }

  async function onDelete(task: PlannedTaskDTO) {
    const prev = tasks;
    setTasks((curr) => curr?.filter((t) => t.id !== task.id) ?? curr);
    try {
      await api.tasks.delete(task.id);
      toast.show("Task deleted", "success");
    } catch (err) {
      setTasks(prev);
      toast.show((err as Error).message, "error");
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Upcoming tasks</CardTitle>
            <CardDescription>Planned study sessions ahead.</CardDescription>
          </div>
          <div
            role="tablist"
            aria-label="Filter tasks"
            className="inline-flex items-center gap-0.5 rounded-md border border-border bg-card p-0.5"
          >
            <FilterButton
              active={filter === "today"}
              onClick={() => setFilter("today")}
              label="Today"
            />
            <FilterButton
              active={filter === "upcoming"}
              onClick={() => setFilter("upcoming")}
              label="All upcoming"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading && tasks === null ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : tasks && tasks.length === 0 ? (
          <p className="text-sm text-muted">
            {filter === "today" ? "No tasks for today." : "No upcoming tasks."}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {tasks?.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/40 p-3"
              >
                <label className="flex flex-1 cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={() => onComplete(t)}
                    className="mt-0.5 h-4 w-4 cursor-pointer accent-indigo-600"
                    aria-label={`Mark "${t.objective}" complete`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-foreground">
                      {t.objective}
                    </div>
                    <div className="text-xs text-muted">
                      {t.subject.name} · {t.date} · {t.startTime}–{t.endTime}
                    </div>
                  </div>
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(t)}
                >
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function FilterButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "rounded px-2.5 py-1 text-xs font-medium transition-colors",
        active
          ? "bg-accent text-foreground"
          : "text-muted hover:bg-accent hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
