import { todayRange, weekRange, rangeForPeriod } from "@/lib/date";
import { listGoals } from "@/server/repositories/goals";
import {
  sumMinutesInRange,
  minutesGroupedBySubject,
} from "@/server/repositories/sessions";

export type GoalProgress = {
  goalId: string;
  subjectId: string;
  subjectName: string;
  period: "WEEKLY" | "MONTHLY";
  targetMinutes: number;
  actualMinutes: number;
  percent: number;
};

export type DashboardData = {
  todayMinutes: number;
  weekMinutes: number;
  perSubjectThisWeek: { subjectId: string; subjectName: string; minutes: number }[];
  goalsProgress: GoalProgress[];
};

export async function getDashboard(studentId: string): Promise<DashboardData> {
  const now = new Date();
  const today = todayRange(now);
  const week = weekRange(now);

  const [todayMinutes, weekMinutes, perSubjectThisWeek, goals] = await Promise.all([
    sumMinutesInRange(studentId, today),
    sumMinutesInRange(studentId, week),
    minutesGroupedBySubject(studentId, week),
    listGoals(studentId),
  ]);

  const goalsProgress: GoalProgress[] = await Promise.all(
    goals.map(async (goal) => {
      const period = goal.period as "WEEKLY" | "MONTHLY";
      const range = rangeForPeriod(period, now);
      const actualMinutes = await sumMinutesInRange(studentId, range, goal.subjectId);
      const percent =
        goal.targetMinutes > 0
          ? Math.min(100, Math.round((actualMinutes / goal.targetMinutes) * 100))
          : 0;
      return {
        goalId: goal.id,
        subjectId: goal.subjectId,
        subjectName: goal.subject.name,
        period,
        targetMinutes: goal.targetMinutes,
        actualMinutes,
        percent,
      };
    }),
  );

  return { todayMinutes, weekMinutes, perSubjectThisWeek, goalsProgress };
}
