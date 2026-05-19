import { cn, formatMinutes } from "@/lib/utils";
import type { GoalProgressDTO } from "@/types/api";

export function GoalProgressList({ goals }: { goals: GoalProgressDTO[] }) {
  if (goals.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No goals yet. Head to <strong>Goals</strong> to set your first target.
      </p>
    );
  }
  return (
    <ul className="flex flex-col gap-4">
      {goals.map((g) => (
        <li key={g.goalId} className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="font-medium text-slate-900">{g.subjectName}</span>
              <span className="ml-2 text-xs uppercase tracking-wide text-slate-500">
                {g.period === "WEEKLY" ? "Weekly" : "Monthly"}
              </span>
            </div>
            <span className="text-slate-600">
              {formatMinutes(g.actualMinutes)} / {formatMinutes(g.targetMinutes)}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                g.percent >= 100 ? "bg-emerald-500" : "bg-indigo-500",
              )}
              style={{ width: `${Math.min(100, g.percent)}%` }}
            />
          </div>
          <span className="text-xs text-slate-500">{g.percent}% complete</span>
        </li>
      ))}
    </ul>
  );
}
