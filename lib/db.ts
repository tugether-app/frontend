import type { Goal, GoalStatus, Member } from "./types";
import { allGoals, findById, findBySlug, insert } from "./store";
import { money } from "./format";
import * as zerodev from "./sdk/zerodev";
import * as particle from "./sdk/particle";

// Async data layer. API routes call only this module. Backed by the in-memory
// store for now; swap the store calls for Supabase queries to go live.
// (Async signatures already match a real DB so routes won't change.)

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

function uuid(): string {
  return globalThis.crypto?.randomUUID?.() ?? "id-" + Math.random().toString(36).slice(2);
}

function slugify(name: string): string {
  const b =
    name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 40) || "goal";
  return `${b}-${Math.random().toString(36).slice(2, 6)}`;
}

function recomputeStatus(g: Goal): GoalStatus {
  if (g.status === "closed") return "closed";
  return g.collectedAmount >= g.targetAmount ? "reached" : "open";
}

export async function listGoals(): Promise<Goal[]> {
  return allGoals();
}

export async function getBySlug(slug: string): Promise<Goal> {
  const g = findBySlug(slug);
  if (!g) throw new ApiError(404, "GOAL_NOT_FOUND", "Goal not found.");
  return g;
}

export async function createGoal(input: {
  name: string;
  targetAmount: number;
  creatorAddr?: string;
}): Promise<Goal> {
  if (!input.name || input.name.trim().length < 3)
    throw new ApiError(400, "INVALID_NAME", "Goal name needs at least 3 characters.");
  if (!(input.targetAmount > 0))
    throw new ApiError(400, "INVALID_TARGET", "Target must be greater than zero.");

  const creator = input.creatorAddr ?? "0x0000000000000000000000000000000000000000";
  const { vaultAddr } = await zerodev.deployGoalVault({ creator, targetAmount: input.targetAmount });

  const goal: Goal = {
    id: uuid(),
    joinSlug: slugify(input.name),
    name: input.name.trim(),
    targetDisplay: money(input.targetAmount),
    targetAmount: input.targetAmount,
    collectedAmount: 0,
    status: "open",
    vaultAddr,
    creatorAddr: creator,
    createdAt: new Date().toISOString(),
    members: [],
  };
  return insert(goal);
}

export async function joinGoal(
  id: string,
  input: { memberAddr: string; displayName: string; avatarSeed?: string },
): Promise<Member> {
  const g = findById(id);
  if (!g) throw new ApiError(404, "GOAL_NOT_FOUND", "Goal not found.");
  if (g.members.some((m) => m.memberAddr === input.memberAddr))
    throw new ApiError(409, "ALREADY_MEMBER", "You are already a member of this goal.");

  // First touch: upgrade EOA -> Universal Account (7702).
  const uaAddr = await particle.ensureUniversalAccount(input.memberAddr);

  const member: Member = {
    id: uuid(),
    displayName: input.displayName || "Member",
    avatarSeed: input.avatarSeed || uaAddr,
    totalDeposited: 0,
    joinedAt: new Date().toISOString(),
    memberAddr: uaAddr,
  };
  g.members.push(member);
  return member;
}

export async function recordDeposit(
  id: string,
  input: { memberAddr: string; amount: number; sourceChain?: string },
): Promise<Goal> {
  const g = findById(id);
  if (!g) throw new ApiError(404, "GOAL_NOT_FOUND", "Goal not found.");
  if (!(input.amount > 0)) throw new ApiError(400, "INVALID_AMOUNT", "Deposit amount is not valid.");

  const member = g.members.find((m) => m.memberAddr === input.memberAddr);
  if (!member) throw new ApiError(403, "NOT_MEMBER", "Only members can deposit.");

  // Route the cross-chain deposit into the vault's pooled balance.
  await particle.routeDeposit({
    from: input.memberAddr,
    vaultAddr: g.vaultAddr ?? "",
    amount: input.amount,
    sourceChain: input.sourceChain,
  });

  member.totalDeposited += input.amount;
  g.collectedAmount = Math.min(g.targetAmount, g.collectedAmount + input.amount);
  const next = recomputeStatus(g);
  if (next === "reached" && g.status !== "reached") g.reachedAt = new Date().toISOString();
  g.status = next;
  return g;
}

export async function withdrawGoal(id: string, input: { toAddr: string }): Promise<Goal> {
  const g = findById(id);
  if (!g) throw new ApiError(404, "GOAL_NOT_FOUND", "Goal not found.");
  if (g.status !== "reached")
    throw new ApiError(403, "TARGET_NOT_REACHED", "Funds can only be withdrawn once the target is reached.");

  // Lock rule is enforced on-chain by the ZeroDev permission; this just sends it.
  await zerodev.withdraw({ vaultAddr: g.vaultAddr ?? "", to: input.toAddr });
  g.status = "closed";
  return g;
}
