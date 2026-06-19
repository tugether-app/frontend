import { recordDeposit } from "@/lib/db";
import { ok, fail, readJson } from "@/lib/http";

// POST /api/goals/:id/deposit -> route cross-chain deposit, update pooled balance.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await readJson<{ memberAddr: string; amount: number; sourceChain?: string }>(req);
    const goal = await recordDeposit(id, body);
    return ok(goal);
  } catch (e) {
    return fail(e);
  }
}
