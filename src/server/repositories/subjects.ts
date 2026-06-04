import { prisma } from "@/lib/prisma";

export async function listSubjects(studentId: string) {
  return prisma.subject.findMany({
    where: { studentId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export async function createSubject(studentId: string, name: string) {
  const trimmed = name.trim();
  const existing = await prisma.subject.findUnique({
    where: { studentId_name: { studentId, name: trimmed } },
    select: { id: true, name: true },
  });
  if (existing) return existing;
  return prisma.subject.create({
    data: { studentId, name: trimmed },
    select: { id: true, name: true },
  });
}

export async function assertSubjectOwned(studentId: string, subjectId: string) {
  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, studentId },
    select: { id: true },
  });
  if (!subject) throw new Error("SUBJECT_NOT_FOUND");
}

export async function listSubjectsWithUsage(studentId: string) {
  const rows = await prisma.subject.findMany({
    where: { studentId },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      _count: { select: { sessions: true, goals: true, plannedTasks: true } },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    sessionCount: r._count.sessions,
    goalCount: r._count.goals,
    taskCount: r._count.plannedTasks,
  }));
}

export async function updateSubject(
  studentId: string,
  subjectId: string,
  name: string,
) {
  const trimmed = name.trim();
  await assertSubjectOwned(studentId, subjectId);
  const clash = await prisma.subject.findUnique({
    where: { studentId_name: { studentId, name: trimmed } },
    select: { id: true },
  });
  if (clash && clash.id !== subjectId) throw new Error("SUBJECT_NAME_TAKEN");
  return prisma.subject.update({
    where: { id: subjectId },
    data: { name: trimmed },
    select: { id: true, name: true },
  });
}

export async function deleteSubject(studentId: string, subjectId: string) {
  const result = await prisma.subject.deleteMany({
    where: { id: subjectId, studentId },
  });
  if (result.count === 0) throw new Error("SUBJECT_NOT_FOUND");
}
