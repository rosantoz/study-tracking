import { NextResponse } from "next/server";
import { z } from "zod";

export function jsonError(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

export function unauthorized() {
  return jsonError(401, "Unauthorized");
}

export function badRequest(error: string) {
  return jsonError(400, error);
}

export function notFound(error = "Not found") {
  return jsonError(404, error);
}

export function fromZod(err: z.ZodError) {
  const first = err.issues[0];
  return badRequest(first?.message ?? "Invalid request");
}
