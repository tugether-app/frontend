import { joinGoal } from "@/lib/db";
import { ok, fail, readJson } from "@/lib/http";

// POST /api/goals/:id/join -> register member (after Magic login), upgrade to UA.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await readJson<{ memberAddr: string; displayName: string; avatarSeed?: string }>(req);
    const member = await joinGoal(id, body);
    return ok({ member }, 201);
  } catch (e) {
    return fail(e);
  }
}
