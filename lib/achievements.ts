import type { Goal } from "./types";

// Derived client-side from goals the user already has -- no backend change,
// no on-chain read. Off-chain "nudges" per the pitch deck (public/deck.html),
// not NFTs: this app's whole pitch is "no wallet talk", so gas-costing
// vanity badges would cut against that.
export const SUPER_SAVER_THRESHOLD = 50; // display units (dollars)

export type BadgeId =
  | "badge-first-goal"
  | "badge-first-deposit"
  | "badge-first-member"
  | "badge-goal-completed"
  | "badge-super-saver";

export function computeUnlockedBadges(goals: Goal[], userAddr: string | undefined): Set<BadgeId> {
  const unlocked = new Set<BadgeId>();
  if (!userAddr) return unlocked;

  const mine = goals.filter((g) => g.creatorAddr === userAddr);
  const joined = goals.filter((g) => g.members.some((m) => m.memberAddr === userAddr));

  if (mine.length > 0) unlocked.add("badge-first-goal");
  if (mine.some((g) => g.members.length > 1)) unlocked.add("badge-first-member");

  const myTotalDeposited = joined.reduce((sum, g) => {
    const me = g.members.find((m) => m.memberAddr === userAddr);
    return sum + (me?.totalDeposited ?? 0);
  }, 0);
  if (myTotalDeposited > 0) unlocked.add("badge-first-deposit");
  if (myTotalDeposited >= SUPER_SAVER_THRESHOLD) unlocked.add("badge-super-saver");

  if ([...mine, ...joined].some((g) => g.status !== "open")) unlocked.add("badge-goal-completed");

  return unlocked;
}
