import type { Goal } from "./types";

// Seed data for the in-memory store (lib/store.ts). Swap the store for Supabase
// (see docs/SCHEMA.md) to go live; this seed can stay for local/demo.

export const SEED_GOALS: Goal[] = [
  {
    id: "g1",
    joinSlug: "bali-trip-2026",
    name: "Bali trip with the crew",
    targetDisplay: "$5,000",
    targetAmount: 5_000,
    collectedAmount: 3_250,
    status: "open",
    vaultAddr: "0x9aF2c1B4e7D3a0F6c8E1b2A4d5C6f7E8a9B0c1D2",
    creatorAddr: "0x1111111111111111111111111111111111111111",
    createdAt: "2026-06-01T09:00:00Z",
    members: [
      { id: "m1", displayName: "Ezra", avatarSeed: "ezra", totalDeposited: 1_500, joinedAt: "2026-06-01T09:00:00Z", memberAddr: "0x1111111111111111111111111111111111111111" },
      { id: "m2", displayName: "Dina", avatarSeed: "dina", totalDeposited: 1_000, joinedAt: "2026-06-02T10:00:00Z", memberAddr: "0x1212121212121212121212121212121212121212" },
      { id: "m3", displayName: "Rama", avatarSeed: "rama", totalDeposited: 750, joinedAt: "2026-06-03T11:00:00Z", memberAddr: "0x1313131313131313131313131313131313131313" },
    ],
  },
  {
    id: "g2",
    joinSlug: "sarah-wedding-gift",
    name: "Sarah's wedding gift",
    targetDisplay: "$2,000",
    targetAmount: 2_000,
    collectedAmount: 2_000,
    status: "reached",
    vaultAddr: "0x3bC4d5E6f7A8b9C0d1E2f3A4b5C6d7E8f9A0b1C2",
    creatorAddr: "0x2222222222222222222222222222222222222222",
    createdAt: "2026-05-20T09:00:00Z",
    reachedAt: "2026-06-10T12:00:00Z",
    members: [
      { id: "m4", displayName: "Ezra", avatarSeed: "ezra", totalDeposited: 800, joinedAt: "2026-05-20T09:00:00Z", memberAddr: "0x2222222222222222222222222222222222222222" },
      { id: "m5", displayName: "Budi", avatarSeed: "budi", totalDeposited: 700, joinedAt: "2026-05-21T09:00:00Z", memberAddr: "0x2323232323232323232323232323232323232323" },
      { id: "m6", displayName: "Citra", avatarSeed: "citra", totalDeposited: 500, joinedAt: "2026-05-22T09:00:00Z", memberAddr: "0x2424242424242424242424242424242424242424" },
    ],
  },
];
