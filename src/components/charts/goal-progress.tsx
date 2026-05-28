import { cn, formatMinutes } from "@/lib/utils";
import type { GoalProgressDTO } from "@/types/api";

export function GoalProgressList({ goals }: { goals: GoalProgressDTO[] }) {
  if (goals.length === 0) {
    return (
      <p className="text-sm text-muted">
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
              <span className="font-medium text-foreground">{g.subjectName}</span>
              <span className="ml-2 text-xs uppercase tracking-wide text-muted">
                {g.period === "WEEKLY" ? "Weekly" : "Monthly"}
              </span>
            </div>
            <span className="text-muted">
              {formatMinutes(g.actualMinutes)} / {formatMinutes(g.targetMinutes)}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-accent">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                g.percent >= 100 ? "bg-emerald-500" : "bg-indigo-500",
              )}
              style={{ width: `${Math.min(100, g.percent)}%` }}
            />
          </div>
          <span className="text-xs text-muted">{g.percent}% complete</span>
        </li>
      ))}
    </ul>
  );
}
