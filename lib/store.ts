import type { Goal } from "./types";
import { SEED_GOALS } from "./mock";

// In-memory data store for the mock BE pass. Mutable, server-side only
// (imported by db.ts / API routes, never by client components).
// Resets on server restart (fine for hackathon demo). This is the single swap
// point: replace these arrays + accessors with Supabase queries (see db.ts)
// without touching the API routes.

// Clone the seed so mutations don't leak back into the literal.
const goals: Goal[] = SEED_GOALS.map((g) => ({ ...g, members: g.members.map((m) => ({ ...m })) }));

export function allGoals(): Goal[] {
  return goals;
}

export function findBySlug(slug: string): Goal | undefined {
  return goals.find((g) => g.joinSlug === slug);
}

export function findById(id: string): Goal | undefined {
  return goals.find((g) => g.id === id);
}

export function insert(goal: Goal): Goal {
  goals.unshift(goal);
  return goal;
}
