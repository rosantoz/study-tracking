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
