import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { notFound, unauthorized } from "@/lib/api-response";
import { deleteSession } from "@/server/repositories/sessions";

async function getStudentId() {
  const session = await auth();
  return (session?.user as { id?: string } | undefined)?.id ?? null;
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const studentId = await getStudentId();
  if (!studentId) return unauthorized();

  const { id } = await ctx.params;
  try {
    await deleteSession(studentId, id);
  } catch {
    return notFound("Session not found");
  }
  return NextResponse.json({ ok: true });
}
