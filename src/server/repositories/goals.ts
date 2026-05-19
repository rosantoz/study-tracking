import { prisma } from "@/lib/prisma";

export type GoalPeriod = "WEEKLY" | "MONTHLY";

export async function listGoals(studentId: string) {
  return prisma.goal.findMany({
    where: { studentId },
    orderBy: [{ period: "asc" }, { createdAt: "desc" }],
    include: { subject: { select: { id: true, name: true } } },
  });
}

export async function upsertGoal(
  studentId: string,
  data: { subjectId: string; targetMinutes: number; period: GoalPeriod },
) {
  return prisma.goal.upsert({
    where: {
      studentId_subjectId_period: {
        studentId,
        subjectId: data.subjectId,
        period: data.period,
      },
    },
    update: { targetMinutes: data.targetMinutes },
    create: {
      studentId,
      subjectId: data.subjectId,
      targetMinutes: data.targetMinutes,
      period: data.period,
    },
    include: { subject: { select: { id: true, name: true } } },
  });
}

export async function deleteGoal(studentId: string, goalId: string) {
  const result = await prisma.goal.deleteMany({
    where: { id: goalId, studentId },
  });
  if (result.count === 0) throw new Error("GOAL_NOT_FOUND");
}
