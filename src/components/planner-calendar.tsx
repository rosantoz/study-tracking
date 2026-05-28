"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { TaskFormDialog } from "@/components/task-form-dialog";
import { isoDate, monthGridDays } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { PlannedTaskDTO, TaskStatus } from "@/types/api";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CHIP_LIMIT = 3;

export function PlannerCalendar() {
  const toast = useToast();
  const [viewMonth, setViewMonth] = useState<Date>(() => new Date());
  const [tasks, setTasks] = useState<PlannedTaskDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogDate, setDialogDate] = useState<string>(isoDate(new Date()));

  const days = useMemo(() => monthGridDays(viewMonth), [viewMonth]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const from = isoDate(startOfWeek(startOfMonth(viewMonth), { weekStartsOn: 1 }));
      const to = isoDate(endOfWeek(endOfMonth(viewMonth), { weekStartsOn: 1 }));
      const { tasks } = await api.tasks.list({ from, to });
      setTasks(tasks);
    } catch (err) {
      toast.show((err as Error).message, "error");
    } finally {
      setLoading(false);
    }
  }, [viewMonth, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, PlannedTaskDTO[]>();
    for (const t of tasks) {
      const list = map.get(t.date) ?? [];
      list.push(t);
      map.set(t.date, list);
    }
    return map;
  }, [tasks]);

  function openDialogFor(day: Date) {
    setDialogDate(isoDate(day));
    setDialogOpen(true);
  }

  function onCreated(task: PlannedTaskDTO) {
    setTasks((prev) => [...prev, task]);
  }

  async function toggleStatus(task: PlannedTaskDTO) {
    const nextStatus: TaskStatus = task.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t)),
    );
    try {
      await api.tasks.update(task.id, { status: nextStatus });
    } catch (err) {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t)),
      );
      toast.show((err as Error).message, "error");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setViewMonth((d) => subMonths(d, 1))}
            aria-label="Previous month"
          >
            ‹
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setViewMonth(new Date())}
          >
            Today
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setViewMonth((d) => addMonths(d, 1))}
            aria-label="Next month"
          >
            ›
          </Button>
        </div>
        <div className="text-sm font-semibold text-foreground">
          {format(viewMonth, "MMMM yyyy")}
        </div>
        <div className="text-xs text-muted">
          {loading ? "Loading…" : `${tasks.length} task${tasks.length === 1 ? "" : "s"}`}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="grid grid-cols-7 border-b border-border bg-accent/40">
          {WEEKDAYS.map((w) => (
            <div
              key={w}
              className="px-2 py-2 text-center text-xs font-medium uppercase tracking-wide text-muted"
            >
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const key = isoDate(day);
            const dayTasks = tasksByDate.get(key) ?? [];
            const inMonth = isSameMonth(day, viewMonth);
            const today = isToday(day);
            const visible = dayTasks.slice(0, CHIP_LIMIT);
            const extra = dayTasks.length - visible.length;
            return (
              <button
                type="button"
                key={key}
                onClick={() => openDialogFor(day)}
                className={cn(
                  "flex min-h-[96px] flex-col items-stretch gap-1 border-b border-r border-border p-1.5 text-left transition-colors hover:bg-accent/60 sm:min-h-[112px]",
                  !inMonth && "bg-background/40",
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                      inMonth ? "text-foreground" : "text-muted",
                      today && "bg-primary text-primary-foreground",
                    )}
                  >
                    {format(day, "d")}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  {visible.map((t) => (
                    <span
                      key={t.id}
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStatus(t);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleStatus(t);
                        }
                      }}
                      title={`${t.subject.name} · ${t.startTime}–${t.endTime}`}
                      className={cn(
                        "truncate rounded px-1.5 py-0.5 text-[11px] font-medium",
                        t.status === "COMPLETED"
                          ? "bg-success-soft text-success-soft-foreground line-through"
                          : "bg-primary-soft text-primary-soft-foreground",
                      )}
                    >
                      {t.objective}
                    </span>
                  ))}
                  {extra > 0 && (
                    <span className="px-1.5 text-[11px] text-muted">+{extra} more</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <TaskFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        defaultDate={dialogDate}
        onCreated={onCreated}
      />
    </div>
  );
}
