import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { badRequest, fromZod, unauthorized } from "@/lib/api-response";
import { createSubjectSchema } from "@/types/api";
import {
  createSubject,
  listSubjects,
  listSubjectsWithUsage,
} from "@/server/repositories/subjects";

async function getStudentId() {
  const session = await auth();
  return (session?.user as { id?: string } | undefined)?.id ?? null;
}

export async function GET(req: NextRequest) {
  const studentId = await getStudentId();
  if (!studentId) return unauthorized();
  if (req.nextUrl.searchParams.get("withUsage") === "true") {
    const subjects = await listSubjectsWithUsage(studentId);
    return NextResponse.json({ subjects });
  }
  const subjects = await listSubjects(studentId);
  return NextResponse.json({ subjects });
}

export async function POST(req: NextRequest) {
  const studentId = await getStudentId();
  if (!studentId) return unauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const parsed = createSubjectSchema.safeParse(body);
  if (!parsed.success) return fromZod(parsed.error);

  const subject = await createSubject(studentId, parsed.data.name);
  return NextResponse.json({ subject }, { status: 201 });
}
