import { getBySlug } from "@/lib/db";
import { ok, fail } from "@/lib/http";

// GET /api/goals/by-slug/:slug -> resolve invite link to goal detail.
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    return ok(await getBySlug(slug));
  } catch (e) {
    return fail(e);
  }
}
