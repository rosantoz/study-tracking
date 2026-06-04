import { prisma } from "@/lib/prisma";

export type SessionFilters = {
  subjectId?: string;
  from?: Date;
  to?: Date;
};

export async function listSessions(studentId: string, filters: SessionFilters = {}) {
  const { subjectId, from, to } = filters;

  return prisma.studySession.findMany({
    where: {
      studentId,
      ...(subjectId ? { subjectId } : {}),
      ...(from || to
        ? {
            date: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    },
    orderBy: { date: "desc" },
    include: { subject: { select: { id: true, name: true } } },
  });
}

export async function createSession(
  studentId: string,
  data: { subjectId: string; date: Date; minutes: number; notes?: string | null },
) {
  return prisma.studySession.create({
    data: {
      studentId,
      subjectId: data.subjectId,
      date: data.date,
      minutes: data.minutes,
      notes: data.notes ?? null,
    },
    include: { subject: { select: { id: true, name: true } } },
  });
}

export async function deleteSession(studentId: string, sessionId: string) {
  const result = await prisma.studySession.deleteMany({
    where: { id: sessionId, studentId },
  });
  if (result.count === 0) throw new Error("SESSION_NOT_FOUND");
}

export async function sumMinutesInRange(
  studentId: string,
  range: { start: Date; end: Date },
  subjectId?: string,
) {
  const agg = await prisma.studySession.aggregate({
    where: {
      studentId,
      ...(subjectId ? { subjectId } : {}),
      date: { gte: range.start, lte: range.end },
    },
    _sum: { minutes: true },
  });
  return agg._sum.minutes ?? 0;
}

export async function minutesGroupedBySubject(
  studentId: string,
  range: { start: Date; end: Date },
) {
  const grouped = await prisma.studySession.groupBy({
    by: ["subjectId"],
    where: {
      studentId,
      date: { gte: range.start, lte: range.end },
    },
    _sum: { minutes: true },
  });

  if (grouped.length === 0) return [];

  const subjects = await prisma.subject.findMany({
    where: { id: { in: grouped.map((g) => g.subjectId) } },
    select: { id: true, name: true },
  });
  const nameById = new Map(subjects.map((s) => [s.id, s.name]));

  return grouped
    .map((g) => ({
      subjectId: g.subjectId,
      subjectName: nameById.get(g.subjectId) ?? "Unknown",
      minutes: g._sum.minutes ?? 0,
    }))
    .sort((a, b) => b.minutes - a.minutes);
}
