import type { Goal } from "./types";
import { SEED_GOALS } from "./mock";

// In-memory data store for the mock BE pass. Mutable, server-side only
// (imported by db.ts / API routes, never by client components).
//
// Pinned on globalThis: Next compiles/instantiates each route module
// separately, so a plain module-level array would NOT be shared across
// routes (create vs join would see different stores). globalThis gives one
// instance per server process, and survives dev HMR. Resets on restart.
// Single swap point: replace this with Supabase queries to go live.

const SEED = (): Goal[] =>
  SEED_GOALS.map((g) => ({ ...g, members: g.members.map((m) => ({ ...m })) }));

const g = globalThis as unknown as { __tugGoals?: Goal[] };
g.__tugGoals ??= SEED();
const goals = g.__tugGoals;

export function allGoals(): Goal[] {
  return goals;
}

export function findBySlug(slug: string): Goal | undefined {
  return goals.find((x) => x.joinSlug === slug);
}

export function findById(id: string): Goal | undefined {
  return goals.find((x) => x.id === id);
}

export function insert(goal: Goal): Goal {
  goals.unshift(goal);
  return goal;
}
