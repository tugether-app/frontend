import type { ActivityEvent, Goal } from "./types";
import { SEED_GOALS } from "./mock";

// In-memory data store for the mock BE pass. Mutable, server-side only
// (imported by db.ts / API routes, never by client components).
//
// Pinned on globalThis: Next compiles/instantiates each route module
// separately, so a plain module-level array would NOT be shared across
// routes. globalThis gives one instance per server process, survives dev HMR,
// resets on restart. Single swap point: replace with Supabase queries.

const seedGoals = (): Goal[] =>
  SEED_GOALS.map((g) => ({ ...g, members: g.members.map((m) => ({ ...m })) }));

// Synthesize an activity feed from the seed goals so History isn't empty.
function seedEvents(goals: Goal[]): ActivityEvent[] {
  const ev: ActivityEvent[] = [];
  for (const g of goals) {
    const creatorName = g.members.find((m) => m.memberAddr === g.creatorAddr)?.displayName ?? "Someone";
    ev.push({ id: `${g.id}-created`, type: "created", goalSlug: g.joinSlug, goalName: g.name, actor: creatorName, at: g.createdAt });
    for (const m of g.members) {
      ev.push({ id: `${g.id}-join-${m.id}`, type: "joined", goalSlug: g.joinSlug, goalName: g.name, actor: m.displayName, at: m.joinedAt });
      if (m.totalDeposited > 0)
        ev.push({ id: `${g.id}-dep-${m.id}`, type: "deposited", goalSlug: g.joinSlug, goalName: g.name, actor: m.displayName, amount: m.totalDeposited, at: m.joinedAt });
    }
    if (g.reachedAt)
      ev.push({ id: `${g.id}-reached`, type: "reached", goalSlug: g.joinSlug, goalName: g.name, actor: "", at: g.reachedAt });
  }
  return ev.sort((a, b) => +new Date(b.at) - +new Date(a.at));
}

const g = globalThis as unknown as { __tugGoals?: Goal[]; __tugEvents?: ActivityEvent[] };
g.__tugGoals ??= seedGoals();
g.__tugEvents ??= seedEvents(g.__tugGoals);
const goals = g.__tugGoals;
const events = g.__tugEvents;

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

export function allEvents(): ActivityEvent[] {
  return events;
}
export function pushEvent(e: Omit<ActivityEvent, "id" | "at"> & { at?: string }): ActivityEvent {
  const ev: ActivityEvent = { id: "e-" + Math.random().toString(36).slice(2), at: new Date().toISOString(), ...e };
  events.unshift(ev);
  return ev;
}
