// Domain types. Mirror docs/SCHEMA.md. State of truth for value + lock rules is
// on-chain (GoalVault); these shapes are the metadata the UI reads.

export type GoalStatus = "open" | "reached" | "closed";

export interface Member {
  id: string;
  displayName: string;
  avatarSeed: string;
  totalDeposited: number;
  joinedAt: string;
  memberAddr?: string; // UA address (set on join via 7702)
}

export interface Goal {
  id: string;
  joinSlug: string;
  name: string;
  targetDisplay: string; // e.g. "Rp 5.000.000"
  targetAmount: number; // in settlement units
  collectedAmount: number;
  status: GoalStatus;
  category?: string;
  vaultAddr?: string;
  creatorAddr?: string;
  createdAt: string;
  reachedAt?: string;
  members: Member[];
}

export interface Deposit {
  memberAddr: string;
  sourceChain: string;
  amount: number;
  depositTx: string;
}
