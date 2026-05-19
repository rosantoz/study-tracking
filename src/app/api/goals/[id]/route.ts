import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { notFound, unauthorized } from "@/lib/api-response";
import { deleteGoal } from "@/server/repositories/goals";

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
    await deleteGoal(studentId, id);
  } catch {
    return notFound("Goal not found");
  }
  return NextResponse.json({ ok: true });
}
