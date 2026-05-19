import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { unauthorized } from "@/lib/api-response";
import { getDashboard } from "@/server/services/dashboard";

async function getStudentId() {
  const session = await auth();
  return (session?.user as { id?: string } | undefined)?.id ?? null;
}

export async function GET() {
  const studentId = await getStudentId();
  if (!studentId) return unauthorized();
  const data = await getDashboard(studentId);
  return NextResponse.json(data);
}
