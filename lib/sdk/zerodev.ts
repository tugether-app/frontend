// ZeroDev wrapper: deploy a per-goal GoalVault via GoalVaultFactory (called from
// the creator's own smart account -- ERC-4337 accounts can only call into other
// contracts, not perform a raw CREATE, hence the factory).

import { createPublicClient, http, parseEventLogs, type Address, type EIP1193Provider } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { getKernelAccountClient } from "./smartAccount";

const hasKey = !!process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID;
const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_GOALVAULT_FACTORY_ADDRESS as Address | undefined;
const USDC_ADDRESS = process.env.NEXT_PUBLIC_TEST_USDC_ADDRESS as Address | undefined; // testnet USDC; swap for real USDC on mainnet
const ARBITRUM_RPC = process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc";

const FACTORY_ABI = [
  {
    type: "function",
    name: "createVault",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "target", type: "uint256" },
      { name: "creator", type: "address" },
    ],
    outputs: [{ name: "vault", type: "address" }],
  },
  {
    type: "event",
    name: "VaultCreated",
    inputs: [
      { name: "vault", type: "address", indexed: true },
      { name: "creator", type: "address", indexed: true },
      { name: "token", type: "address", indexed: false },
      { name: "target", type: "uint256", indexed: false },
    ],
  },
] as const;

const ERC20_ABI = [
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

const VAULT_DEPOSIT_ABI = [
  {
    type: "function",
    name: "deposit",
    stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
  },
] as const;

const VAULT_READ_ABI = [
  { type: "function", name: "releaseVotes", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "refundVotes", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "memberCount", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "released", stateMutability: "view", inputs: [], outputs: [{ type: "bool" }] },
  { type: "function", name: "refunded", stateMutability: "view", inputs: [], outputs: [{ type: "bool" }] },
  {
    type: "function",
    name: "voteOf",
    stateMutability: "view",
    inputs: [{ name: "member", type: "address" }],
    outputs: [{ type: "uint8" }], // enum Vote: None=0, Release=1, Refund=2
  },
  {
    type: "function",
    name: "contributions",
    stateMutability: "view",
    inputs: [{ name: "member", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
] as const;

const VAULT_ACTION_ABI = [
  { type: "function", name: "voteRelease", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { type: "function", name: "voteRefund", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { type: "function", name: "release", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { type: "function", name: "refund", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { type: "function", name: "claim", stateMutability: "nonpayable", inputs: [], outputs: [] },
] as const;

export interface VaultState {
  releaseVotes: number;
  refundVotes: number;
  memberCount: number;
  released: boolean;
  refunded: boolean;
  myVote: 0 | 1 | 2; // 0=None, 1=Release, 2=Refund
  myContribution: number; // display units (dollars)
}

function publicClient() {
  return createPublicClient({ chain: arbitrumSepolia, transport: http(ARBITRUM_RPC) });
}

function fakeHex(seed: string, len: number): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 137 + seed.charCodeAt(i)) >>> 0;
  return "0x" + h.toString(16).padStart(len, "0").slice(0, len);
}

// Deploys a fresh GoalVault via the factory, using the creator's own ZeroDev
// smart account (sponsored userOp) -- no backend signer, no private key ever
// touches the server.
export async function deployGoalVault(args: {
  eip1193Provider: EIP1193Provider;
  creator: Address;
  targetAmount: number; // display units (dollars), matches Goal.targetAmount
}): Promise<{ vaultAddr: string }> {
  if (!hasKey || !FACTORY_ADDRESS || !USDC_ADDRESS) {
    throw new Error("ZeroDev vault factory is not configured. Set NEXT_PUBLIC_GOALVAULT_FACTORY_ADDRESS.");
  }

  const kernelClient = await getKernelAccountClient(args.eip1193Provider);
  const targetUnits = BigInt(Math.round(args.targetAmount * 1_000_000)); // USDC has 6 decimals

  const hash = await kernelClient.writeContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: "createVault",
    args: [USDC_ADDRESS, targetUnits, args.creator],
  });

  const pc = publicClient();
  const receipt = await pc.waitForTransactionReceipt({ hash });
  const [event] = parseEventLogs({ abi: FACTORY_ABI, eventName: "VaultCreated", logs: receipt.logs });
  if (!event) throw new Error("Vault deployment did not emit VaultCreated.");

  return { vaultAddr: event.args.vault };
}

// Approves and deposits in one sponsored userOp (batched calls), from the
// depositing member's own smart account.
export async function depositToVault(args: {
  eip1193Provider: EIP1193Provider;
  vaultAddr: Address;
  amount: number; // display units (dollars), matches Goal amounts today
}): Promise<{ txHash: string }> {
  if (!hasKey || !USDC_ADDRESS) throw new Error("ZeroDev is not configured.");

  const kernelClient = await getKernelAccountClient(args.eip1193Provider);
  const units = BigInt(Math.round(args.amount * 1_000_000)); // USDC has 6 decimals

  const hash = await kernelClient.sendTransaction({
    calls: [
      { to: USDC_ADDRESS, abi: ERC20_ABI, functionName: "approve", args: [args.vaultAddr, units] },
      { to: args.vaultAddr, abi: VAULT_DEPOSIT_ABI, functionName: "deposit", args: [units] },
    ],
  });

  const pc = publicClient();
  const receipt = await pc.waitForTransactionReceipt({ hash });
  if (receipt.status !== "success") throw new Error("Deposit transaction reverted.");

  return { txHash: hash };
}

// Read-only: on-chain vault state including vote tallies and the caller's own vote.
// `memberAddr` is optional -- omit to skip per-member fields (myVote, myContribution).
export async function readVaultState(args: { vaultAddr: Address; memberAddr?: Address }): Promise<VaultState> {
  const pc = publicClient();
  const base = args.vaultAddr;

  const [releaseVotes, refundVotes, memberCount, released, refunded] = await Promise.all([
    pc.readContract({ address: base, abi: VAULT_READ_ABI, functionName: "releaseVotes" }),
    pc.readContract({ address: base, abi: VAULT_READ_ABI, functionName: "refundVotes" }),
    pc.readContract({ address: base, abi: VAULT_READ_ABI, functionName: "memberCount" }),
    pc.readContract({ address: base, abi: VAULT_READ_ABI, functionName: "released" }),
    pc.readContract({ address: base, abi: VAULT_READ_ABI, functionName: "refunded" }),
  ]);

  let myVote: 0 | 1 | 2 = 0;
  let myContribution = 0;
  if (args.memberAddr) {
    const [voteRaw, contribRaw] = await Promise.all([
      pc.readContract({ address: base, abi: VAULT_READ_ABI, functionName: "voteOf", args: [args.memberAddr] }),
      pc.readContract({ address: base, abi: VAULT_READ_ABI, functionName: "contributions", args: [args.memberAddr] }),
    ]);
    myVote = Number(voteRaw) as 0 | 1 | 2;
    myContribution = Number(contribRaw) / 1_000_000;
  }

  return {
    releaseVotes: Number(releaseVotes),
    refundVotes: Number(refundVotes),
    memberCount: Number(memberCount),
    released: released as boolean,
    refunded: refunded as boolean,
    myVote,
    myContribution,
  };
}

// Vote to release (send all funds to creator/treasurer) or refund (each member claims back).
export async function voteOnVault(args: {
  eip1193Provider: EIP1193Provider;
  vaultAddr: Address;
  choice: "release" | "refund";
}): Promise<{ txHash: string }> {
  if (!hasKey) throw new Error("ZeroDev is not configured.");
  const kernelClient = await getKernelAccountClient(args.eip1193Provider);
  const functionName = args.choice === "release" ? "voteRelease" : "voteRefund";

  const hash = await kernelClient.writeContract({
    address: args.vaultAddr,
    abi: VAULT_ACTION_ABI,
    functionName,
  });

  const pc = publicClient();
  const receipt = await pc.waitForTransactionReceipt({ hash });
  if (receipt.status !== "success") throw new Error("Vote transaction reverted.");
  return { txHash: hash };
}

// Permissionless: sends pooled balance to creator once >=50% voted Release.
export async function executeRelease(args: {
  eip1193Provider: EIP1193Provider;
  vaultAddr: Address;
}): Promise<{ txHash: string }> {
  if (!hasKey) throw new Error("ZeroDev is not configured.");
  const kernelClient = await getKernelAccountClient(args.eip1193Provider);

  const hash = await kernelClient.writeContract({
    address: args.vaultAddr,
    abi: VAULT_ACTION_ABI,
    functionName: "release",
  });

  const pc = publicClient();
  const receipt = await pc.waitForTransactionReceipt({ hash });
  if (receipt.status !== "success") throw new Error("Release transaction reverted.");
  return { txHash: hash };
}

// Permissionless: marks vault as refundable once >=50% voted Refund.
export async function executeRefund(args: {
  eip1193Provider: EIP1193Provider;
  vaultAddr: Address;
}): Promise<{ txHash: string }> {
  if (!hasKey) throw new Error("ZeroDev is not configured.");
  const kernelClient = await getKernelAccountClient(args.eip1193Provider);

  const hash = await kernelClient.writeContract({
    address: args.vaultAddr,
    abi: VAULT_ACTION_ABI,
    functionName: "refund",
  });

  const pc = publicClient();
  const receipt = await pc.waitForTransactionReceipt({ hash });
  if (receipt.status !== "success") throw new Error("Refund transaction reverted.");
  return { txHash: hash };
}

// Pull-pattern claim: each member withdraws their own contribution after a refund vote.
export async function claimRefund(args: {
  eip1193Provider: EIP1193Provider;
  vaultAddr: Address;
}): Promise<{ txHash: string }> {
  if (!hasKey) throw new Error("ZeroDev is not configured.");
  const kernelClient = await getKernelAccountClient(args.eip1193Provider);

  const hash = await kernelClient.writeContract({
    address: args.vaultAddr,
    abi: VAULT_ACTION_ABI,
    functionName: "claim",
  });

  const pc = publicClient();
  const receipt = await pc.waitForTransactionReceipt({ hash });
  if (receipt.status !== "success") throw new Error("Claim transaction reverted.");
  return { txHash: hash };
}

// Read-only: how much test USDC `addr` currently holds, in display units
// (dollars). No signer needed -- just a public read.
export async function getUsdcBalance(addr: Address): Promise<number> {
  if (!USDC_ADDRESS) return 0;
  const pc = publicClient();
  const units = await pc.readContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [addr],
  });
  return Number(units) / 1_000_000;
}

export function isLive(): boolean {
  return hasKey;
}
