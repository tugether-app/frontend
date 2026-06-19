import { NextResponse } from "next/server";
import { ApiError } from "./db";

// Uniform JSON responses. Error shape matches docs/SCHEMA.md:
//   { "error": { "code": "...", "message": "..." } }

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function fail(err: unknown) {
  if (err instanceof ApiError) {
    return NextResponse.json({ error: { code: err.code, message: err.message } }, { status: err.status });
  }
  console.error("Unhandled API error:", err);
  return NextResponse.json(
    { error: { code: "INTERNAL", message: "Something went wrong. Please try again." } },
    { status: 500 },
  );
}

export async function readJson<T>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw new ApiError(400, "BAD_JSON", "Body request tidak valid.");
  }
}
