// Particle Universal Accounts wrapper (EIP-7702): upgrade EOA to a Universal
// Account and route a cross-chain deposit into a goal's pooled balance.
// STUB: returns fake UA addresses + tx hashes. Swap for
// @particle-network/universal-account-sdk when keys are set.

const hasKey = !!process.env.NEXT_PUBLIC_PARTICLE_PROJECT_ID;

function fakeTx(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 131 + seed.charCodeAt(i)) >>> 0;
  return "0x" + h.toString(16).padStart(64, "0").slice(0, 64);
}

export interface DepositRoute {
  depositTx: string;
  sourceChain: string;
}

// TODO(live): on first deposit, upgrade member EOA to UA via 7702.
export async function ensureUniversalAccount(eoa: string): Promise<string> {
  if (hasKey) throw new Error("Particle UA live mode not wired yet");
  return eoa; // UA address == EOA in 7702 mode
}

// TODO(live): route any-asset/any-chain deposit into the vault, pooled balance.
export async function routeDeposit(args: {
  from: string;
  vaultAddr: string;
  amount: number;
  sourceChain?: string;
}): Promise<DepositRoute> {
  if (hasKey) throw new Error("Particle UA live mode not wired yet");
  return {
    depositTx: fakeTx(`${args.from}:${args.vaultAddr}:${args.amount}`),
    sourceChain: args.sourceChain ?? "arbitrum",
  };
}

export function isLive(): boolean {
  return hasKey;
}
