import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { badRequest, fromZod, notFound, unauthorized } from "@/lib/api-response";
import { createSubjectSchema } from "@/types/api";
import { deleteSubject, updateSubject } from "@/server/repositories/subjects";

async function getStudentId() {
  const session = await auth();
  return (session?.user as { id?: string } | undefined)?.id ?? null;
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

  const parsed = createSubjectSchema.safeParse(body);
  if (!parsed.success) return fromZod(parsed.error);

  const { id } = await ctx.params;
  try {
    const subject = await updateSubject(studentId, id, parsed.data.name);
    return NextResponse.json({ subject });
  } catch (err) {
    if ((err as Error).message === "SUBJECT_NAME_TAKEN") {
      return badRequest("A subject with that name already exists");
    }
    return notFound("Subject not found");
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
    await deleteSubject(studentId, id);
  } catch {
    return notFound("Subject not found");
  }
  return NextResponse.json({ ok: true });
}
