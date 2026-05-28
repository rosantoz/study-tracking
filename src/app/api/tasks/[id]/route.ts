import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { badRequest, fromZod, notFound, unauthorized } from "@/lib/api-response";
import {
  updatePlannedTaskSchema,
  type PlannedTaskDTO,
} from "@/types/api";
import {
  deletePlannedTask,
  updatePlannedTaskStatus,
} from "@/server/repositories/planned-tasks";

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

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const studentId = await getStudentId();
  if (!studentId) return unauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const parsed = updatePlannedTaskSchema.safeParse(body);
  if (!parsed.success) return fromZod(parsed.error);

  const { id } = await ctx.params;
  try {
    const updated = await updatePlannedTaskStatus(
      studentId,
      id,
      parsed.data.status,
    );
    return NextResponse.json({ task: toTaskDTO(updated) });
  } catch {
    return notFound("Task not found");
  }
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const studentId = await getStudentId();
  if (!studentId) return unauthorized();

  const { id } = await ctx.params;
  try {
    await deletePlannedTask(studentId, id);
  } catch {
    return notFound("Task not found");
  }
  return NextResponse.json({ ok: true });
}
