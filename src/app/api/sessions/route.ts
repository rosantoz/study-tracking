import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { badRequest, fromZod, unauthorized } from "@/lib/api-response";
import {
  createSessionSchema,
  sessionsQuerySchema,
  type SessionDTO,
} from "@/types/api";
import {
  createSession,
  listSessions,
} from "@/server/repositories/sessions";
import { assertSubjectOwned } from "@/server/repositories/subjects";

async function getStudentId() {
  const session = await auth();
  return (session?.user as { id?: string } | undefined)?.id ?? null;
}

function toSessionDTO(s: {
  id: string;
  date: Date;
  minutes: number;
  notes: string | null;
  subject: { id: string; name: string };
}): SessionDTO {
  return {
    id: s.id,
    date: s.date.toISOString().slice(0, 10),
    minutes: s.minutes,
    notes: s.notes,
    subject: s.subject,
  };
}

export async function GET(req: NextRequest) {
  const studentId = await getStudentId();
  if (!studentId) return unauthorized();

  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const parsed = sessionsQuerySchema.safeParse(params);
  if (!parsed.success) return fromZod(parsed.error);

  const { subjectId, from, to } = parsed.data;
  const sessions = await listSessions(studentId, {
    subjectId,
    from: from ? new Date(`${from}T00:00:00.000Z`) : undefined,
    to: to ? new Date(`${to}T23:59:59.999Z`) : undefined,
  });

  return NextResponse.json({ sessions: sessions.map(toSessionDTO) });
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

  const parsed = createSessionSchema.safeParse(body);
  if (!parsed.success) return fromZod(parsed.error);

  try {
    await assertSubjectOwned(studentId, parsed.data.subjectId);
  } catch {
    return badRequest("Subject not found");
  }

  const created = await createSession(studentId, {
    subjectId: parsed.data.subjectId,
    date: new Date(`${parsed.data.date}T00:00:00.000Z`),
    minutes: parsed.data.minutes,
    notes: parsed.data.notes ?? null,
  });

  return NextResponse.json({ session: toSessionDTO(created) }, { status: 201 });
}
