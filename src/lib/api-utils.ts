import { NextResponse } from "next/server";
import { ZodError } from "zod";
import type { Session } from "next-auth";
import { auth } from "./auth";

// Generic user-facing error message; never leak internals to the client.
export function errorResponse(message = "Something went wrong. Please try again.", status = 500) {
  return NextResponse.json({ error: message }, { status });
}

export function unauthorizedResponse() {
  return errorResponse("Unauthorized", 401);
}

export function badRequestResponse(message = "Invalid request") {
  return errorResponse(message, 400);
}

// Wrap a route handler: requires a valid session, logs errors server-side only,
// and always returns a generic message to the client on failure.
export async function withApiHandler<T>(
  fn: (session: Session) => Promise<T>
): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user) {
      return unauthorizedResponse();
    }
    const result = await fn(session);
    if (result instanceof NextResponse) return result;
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ZodError) {
      return badRequestResponse(err.issues.map((i) => i.message).join(", "));
    }
    console.error("[API error]", err);
    return errorResponse();
  }
}
