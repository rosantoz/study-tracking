"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { formatMinutes } from "@/lib/utils";
import type { GoalDTO, GoalPeriod, SubjectDTO } from "@/types/api";

export function GoalsManager() {
  const toast = useToast();
  const [subjects, setSubjects] = useState<SubjectDTO[]>([]);
  const [goals, setGoals] = useState<GoalDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [subjectId, setSubjectId] = useState("");
  const [targetMinutes, setTargetMinutes] = useState("");
  const [period, setPeriod] = useState<GoalPeriod>("WEEKLY");

  useEffect(() => {
    Promise.all([api.subjects.list(), api.goals.list()])
      .then(([s, g]) => {
        setSubjects(s.subjects);
        setGoals(g.goals);
      })
      .catch((e) => toast.show((e as Error).message, "error"))
      .finally(() => setLoading(false));
  }, [toast]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const minutesNum = Number(targetMinutes);
    if (!subjectId) {
      toast.show("Please select a subject", "error");
      return;
    }
    if (!Number.isInteger(minutesNum) || minutesNum <= 0) {
      toast.show("Target minutes must be positive", "error");
      return;
    }
    setSubmitting(true);
    try {
      const { goal } = await api.goals.upsert({
        subjectId,
        targetMinutes: minutesNum,
        period,
      });
      setGoals((prev) => {
        const filtered = prev.filter((g) => g.id !== goal.id);
        return [...filtered, goal].sort((a, b) =>
          a.period === b.period
            ? a.subject.name.localeCompare(b.subject.name)
            : a.period.localeCompare(b.period),
        );
      });
      setTargetMinutes("");
      toast.show("Goal saved", "success");
    } catch (err) {
      toast.show((err as Error).message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete(id: string) {
    try {
      await api.goals.delete(id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
      toast.show("Goal removed", "success");
    } catch (err) {
      toast.show((err as Error).message, "error");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Set a goal</CardTitle>
            <CardDescription>One goal per subject per period. Saving again updates it.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="goal-subject">Subject</Label>
                <Select
                  id="goal-subject"
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  required
                >
                  <option value="">Select subject…</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="goal-period">Period</Label>
                <Select
                  id="goal-period"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as GoalPeriod)}
                >
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="goal-minutes">Target minutes</Label>
                <Input
                  id="goal-minutes"
                  type="number"
                  min={1}
                  step={1}
                  value={targetMinutes}
                  onChange={(e) => setTargetMinutes(e.target.value)}
                  placeholder="e.g. 120"
                  required
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={submitting || loading}>
                  {submitting ? "Saving…" : "Save goal"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>Your goals</CardTitle>
            <CardDescription>Active goals across your subjects.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-slate-500">Loading…</p>
            ) : goals.length === 0 ? (
              <p className="text-sm text-slate-500">No goals yet. Create one to start tracking progress.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-slate-100">
                {goals.map((g) => (
                  <li key={g.id} className="flex items-center justify-between py-3">
                    <div>
                      <div className="text-sm font-medium text-slate-900">{g.subject.name}</div>
                      <div className="text-xs text-slate-500">
                        {g.period === "WEEKLY" ? "Weekly" : "Monthly"} target ·{" "}
                        {formatMinutes(g.targetMinutes)}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(g.id)}>
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
