// ZeroDev wrapper: deploy a per-goal GoalVault smart account and enforce the
// lock rule (funds withdrawable only once target is reached) via permissions.
// STUB: returns fake vault addresses + tx hashes. Swap for @zerodev/sdk +
// @zerodev/permissions when NEXT_PUBLIC_ZERODEV_PROJECT_ID is set.

const hasKey = !!process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID;

function fakeHex(seed: string, len: number): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 137 + seed.charCodeAt(i)) >>> 0;
  return "0x" + h.toString(16).padStart(len, "0").slice(0, len);
}

// TODO(live): deploy GoalVault, install lock permission keyed to targetAmount.
export async function deployGoalVault(args: {
  creator: string;
  targetAmount: number;
}): Promise<{ vaultAddr: string }> {
  if (hasKey) throw new Error("ZeroDev live mode not wired yet");
  return { vaultAddr: fakeHex(`${args.creator}:${args.targetAmount}`, 40) };
}

// TODO(live): build + send withdraw userOp; the permission reverts pre-target.
export async function withdraw(args: {
  vaultAddr: string;
  to: string;
}): Promise<{ withdrawTx: string }> {
  if (hasKey) throw new Error("ZeroDev live mode not wired yet");
  return { withdrawTx: fakeHex(`${args.vaultAddr}:${args.to}`, 64) };
}

export function isLive(): boolean {
  return hasKey;
}
