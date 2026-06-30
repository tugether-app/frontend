import { listEvents } from "@/lib/db";
import { ok, fail } from "@/lib/http";

// GET /api/activity -> recent activity feed (newest first).
export async function GET() {
  try {
    return ok(await listEvents());
  } catch (e) {
    return fail(e);
  }
}
