import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { badRequest, fromZod, unauthorized } from "@/lib/api-response";
import { upsertGoalSchema, type GoalDTO } from "@/types/api";
import { listGoals, upsertGoal } from "@/server/repositories/goals";
import { assertSubjectOwned } from "@/server/repositories/subjects";

async function getStudentId() {
  const session = await auth();
  return (session?.user as { id?: string } | undefined)?.id ?? null;
}

function toGoalDTO(g: {
  id: string;
  targetMinutes: number;
  period: string;
  subject: { id: string; name: string };
}): GoalDTO {
  return {
    id: g.id,
    subject: g.subject,
    targetMinutes: g.targetMinutes,
    period: g.period as "WEEKLY" | "MONTHLY",
  };
}

export async function GET() {
  const studentId = await getStudentId();
  if (!studentId) return unauthorized();
  const goals = await listGoals(studentId);
  return NextResponse.json({ goals: goals.map(toGoalDTO) });
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

  const parsed = upsertGoalSchema.safeParse(body);
  if (!parsed.success) return fromZod(parsed.error);

  try {
    await assertSubjectOwned(studentId, parsed.data.subjectId);
  } catch {
    return badRequest("Subject not found");
  }

  const goal = await upsertGoal(studentId, parsed.data);
  return NextResponse.json({ goal: toGoalDTO(goal) }, { status: 201 });
}
