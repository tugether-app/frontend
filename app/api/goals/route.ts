import { createGoal, listGoals } from "@/lib/db";
import { ok, fail, readJson } from "@/lib/http";

// GET /api/goals -> list goals (demo: all). BE live: scope to session member.
export async function GET() {
  try {
    return ok(await listGoals());
  } catch (e) {
    return fail(e);
  }
}

// POST /api/goals -> create goal. Vault is deployed client-side (creator's own
// smart account via GoalVaultFactory) before this call; we just save metadata.
export async function POST(req: Request) {
  try {
    const body = await readJson<{
      name: string;
      targetAmount: number;
      category?: string;
      creatorAddr?: string;
      vaultAddr: string;
    }>(req);
    const goal = await createGoal(body);
    return ok(goal, 201);
  } catch (e) {
    return fail(e);
  }
}
