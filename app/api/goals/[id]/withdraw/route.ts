import { withdrawGoal } from "@/lib/db";
import { ok, fail, readJson } from "@/lib/http";

// POST /api/goals/:id/withdraw -> withdraw; allowed only if status reached.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await readJson<{ toAddr: string }>(req);
    const goal = await withdrawGoal(id, body);
    return ok(goal);
  } catch (e) {
    return fail(e);
  }
}
