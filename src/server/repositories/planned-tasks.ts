import { prisma } from "@/lib/prisma";

export type TaskStatus = "PENDING" | "COMPLETED";

export type PlannedTaskFilters = {
  subjectId?: string;
  from?: Date;
  to?: Date;
  status?: TaskStatus;
};

export async function listPlannedTasks(
  studentId: string,
  filters: PlannedTaskFilters = {},
) {
  const { subjectId, from, to, status } = filters;

  return prisma.plannedTask.findMany({
    where: {
      studentId,
      ...(subjectId ? { subjectId } : {}),
      ...(status ? { status } : {}),
      ...(from || to
        ? {
            date: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
    include: { subject: { select: { id: true, name: true } } },
  });
}

export async function createPlannedTask(
  studentId: string,
  data: {
    subjectId: string;
    date: Date;
    startTime: string;
    endTime: string;
    objective: string;
  },
) {
  return prisma.plannedTask.create({
    data: {
      studentId,
      subjectId: data.subjectId,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      objective: data.objective,
    },
    include: { subject: { select: { id: true, name: true } } },
  });
}

export async function updatePlannedTaskStatus(
  studentId: string,
  taskId: string,
  status: TaskStatus,
) {
  const result = await prisma.plannedTask.updateMany({
    where: { id: taskId, studentId },
    data: { status },
  });
  if (result.count === 0) throw new Error("TASK_NOT_FOUND");
  const task = await prisma.plannedTask.findUnique({
    where: { id: taskId },
    include: { subject: { select: { id: true, name: true } } },
  });
  if (!task) throw new Error("TASK_NOT_FOUND");
  return task;
}

export async function deletePlannedTask(studentId: string, taskId: string) {
  const result = await prisma.plannedTask.deleteMany({
    where: { id: taskId, studentId },
  });
  if (result.count === 0) throw new Error("TASK_NOT_FOUND");
}
