import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { badRequest, fromZod, unauthorized } from "@/lib/api-response";
import {
  createPlannedTaskSchema,
  plannedTasksQuerySchema,
  type PlannedTaskDTO,
} from "@/types/api";
import {
  createPlannedTask,
  listPlannedTasks,
} from "@/server/repositories/planned-tasks";
import { assertSubjectOwned } from "@/server/repositories/subjects";

async function getStudentId() {
  const session = await auth();
  return (session?.user as { id?: string } | undefined)?.id ?? null;
}

function toTaskDTO(t: {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  objective: string;
  status: string;
  subject: { id: string; name: string };
}): PlannedTaskDTO {
  return {
    id: t.id,
    date: t.date.toISOString().slice(0, 10),
    startTime: t.startTime,
    endTime: t.endTime,
    objective: t.objective,
    status: t.status as PlannedTaskDTO["status"],
    subject: t.subject,
  };
}

export async function GET(req: NextRequest) {
  const studentId = await getStudentId();
  if (!studentId) return unauthorized();

  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const parsed = plannedTasksQuerySchema.safeParse(params);
  if (!parsed.success) return fromZod(parsed.error);

  const { subjectId, from, to, status } = parsed.data;
  const tasks = await listPlannedTasks(studentId, {
    subjectId,
    status,
    from: from ? new Date(`${from}T00:00:00.000Z`) : undefined,
    to: to ? new Date(`${to}T23:59:59.999Z`) : undefined,
  });

  return NextResponse.json({ tasks: tasks.map(toTaskDTO) });
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

  const parsed = createPlannedTaskSchema.safeParse(body);
  if (!parsed.success) return fromZod(parsed.error);

  try {
    await assertSubjectOwned(studentId, parsed.data.subjectId);
  } catch {
    return badRequest("Subject not found");
  }

  const created = await createPlannedTask(studentId, {
    subjectId: parsed.data.subjectId,
    date: new Date(`${parsed.data.date}T00:00:00.000Z`),
    startTime: parsed.data.startTime,
    endTime: parsed.data.endTime,
    objective: parsed.data.objective,
  });

  return NextResponse.json({ task: toTaskDTO(created) }, { status: 201 });
}
