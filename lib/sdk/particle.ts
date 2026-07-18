// Particle Universal Accounts (UA), EIP-7702 mode. Replaces the old ZeroDev
// Kernel + SRA stack (see CLAUDE.md Architecture Notes). The member's Magic EOA
// is upgraded to a Universal Account in place -- no separate smart-account
// address, no separate deployment step. Every GoalVault call (deposit, vote,
// release, refund, claim) and the factory's createVault go through
// createUniversalTransaction() so msg.sender on-chain is the member's own EOA.
//
// Particle UA has no testnet -- this targets Arbitrum mainnet unconditionally.
//
// Known-unverified detail (flagged honestly, not guessed silently): the exact
// shape of `ua.getTransaction()`'s return value is untyped (`Promise<any>`) in
// @particle-network/universal-account-sdk@1.1.1's own .d.ts. The polling/hash
// extraction below is a best-effort reading of the SDK's public types
// (IUserOpWithChain, UA_TRANSACTION_STATUS) and needs to be confirmed against
// a real transaction once Particle dashboard credentials are complete.

import {
  encodeFunctionData,
  createPublicClient,
  http,
  serializeSignature,
  type Address,
  type EIP1193Provider,
} from "viem";
import { arbitrum } from "viem/chains";
import {
  UniversalAccount,
  CHAIN_ID,
  SUPPORTED_TOKEN_TYPE,
  UA_TRANSACTION_STATUS,
  UNIVERSAL_ACCOUNT_VERSION,
  type IUniversalTransaction,
  type ITransaction,
  type EIP7702Authorization as ParticleAuthorization,
} from "@particle-network/universal-account-sdk";
import { sign7702Authorization, signRootHash } from "./magic";

const PROJECT_ID = process.env.NEXT_PUBLIC_PARTICLE_PROJECT_ID;
const CLIENT_KEY = process.env.NEXT_PUBLIC_PARTICLE_CLIENT_KEY;
const APP_ID = process.env.NEXT_PUBLIC_PARTICLE_APP_ID;
const hasKey = !!PROJECT_ID && !!CLIENT_KEY && !!APP_ID;

const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_GOALVAULT_FACTORY_ADDRESS as Address | undefined;
const USDC_ADDRESS = process.env.NEXT_PUBLIC_TEST_USDC_ADDRESS as Address | undefined; // set to real Arbitrum USDC for the mainnet deploy
const ARBITRUM_RPC = process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL || "https://arb1.arbitrum.io/rpc";

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
  return createPublicClient({ chain: arbitrum, transport: http(ARBITRUM_RPC) });
}

// Marks an error message as ours -- safe to show verbatim in the UI. Anything
// that bubbles up from a third-party SDK (Particle, Magic, viem, the RPC
// itself) is NOT wrapped in this, so callers must never display raw upstream
// error text -- it could be anything, including misleading or alarming
// wording we don't control. Log the raw error for debugging instead; show
// users a generic, translated fallback.
export class VaultFlowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VaultFlowError";
  }
}

function requireConfig() {
  if (!hasKey) {
    throw new VaultFlowError(
      "Particle is not configured. Set NEXT_PUBLIC_PARTICLE_PROJECT_ID/CLIENT_KEY/APP_ID.",
    );
  }
}

async function getEoa(eip1193Provider: EIP1193Provider): Promise<Address> {
  const accounts = (await eip1193Provider.request({ method: "eth_accounts" })) as string[];
  const eoa = accounts[0];
  if (!eoa) throw new VaultFlowError("No signed-in account found.");
  return eoa as Address;
}

function getUniversalAccount(eoa: Address): UniversalAccount {
  requireConfig();
  // Note: SDK v2 dropped the top-level `ownerAddress` from IUniversalAccountConfig
  // -- it lives only inside smartAccountOptions now. Passing it at the top level
  // is a TS error under v2 (though ignored at runtime).
  return new UniversalAccount({
    projectId: PROJECT_ID!,
    projectClientKey: CLIENT_KEY!,
    projectAppUuid: APP_ID!,
    // Per Particle's official UA SDK reference (ua-reference/web/initialization):
    // `name` must be the literal string "UNIVERSAL", `version` must be the
    // SDK's own UNIVERSAL_ACCOUNT_VERSION constant. An earlier guess used
    // "UniversalAccount" for `name` -- that mismatch is the likely cause of a
    // "System maintenance..." (-32801) rejection from universal-rpc.particle.network
    // seen during live testing.
    smartAccountOptions: {
      useEIP7702: true,
      name: "UNIVERSAL",
      version: UNIVERSAL_ACCOUNT_VERSION,
      ownerAddress: eoa,
    },
  });
}

// Signs any first-time EIP-7702 delegation authorizations plus the transaction's
// rootHash with the member's Magic EOA, submits it, and waits until Particle
// reports it finished (polls -- cross-chain routing isn't synchronous like a
// single UserOp was under ZeroDev). Shared by every write path: contract calls
// (createUniversalTransaction) and plain transfers (createTransferTransaction).
async function signAndSubmit(ua: UniversalAccount, eoa: Address, transaction: ITransaction): Promise<void> {
  // First transaction per chain needs a signed EIP-7702 delegation authorization;
  // subsequent ones are already delegated (userOp.eip7702Delegated === true).
  const authorizations: ParticleAuthorization[] = [];
  for (const userOp of transaction.userOps) {
    const auth7702 = "eip7702Auth" in userOp ? userOp.eip7702Auth : undefined;
    const delegated = "eip7702Delegated" in userOp ? userOp.eip7702Delegated : false;
    if (auth7702 && !delegated) {
      const signed = await sign7702Authorization({
        contractAddress: auth7702.address,
        chainId: auth7702.chainId,
        nonce: auth7702.nonce,
      });
      authorizations.push({
        userOpHash: userOp.userOpHash,
        signature: serializeSignature({
          r: signed.r as `0x${string}`,
          s: signed.s as `0x${string}`,
          v: BigInt(signed.v),
        }),
      });
    }
  }

  const signature = await signRootHash(eoa, transaction.rootHash);
  await ua.sendTransaction(transaction, signature, authorizations.length ? authorizations : undefined);
  await waitForFinished(ua, transaction.transactionId);
}

// Builds a Universal Transaction from one or more EVM calls on Arbitrum, signs
// and submits it. Returns once Particle reports the transaction finished.
async function executeUniversalTransaction(args: {
  eip1193Provider: EIP1193Provider;
  calls: { to: Address; data: `0x${string}`; value?: bigint }[];
  expectUsdc?: number; // display units (dollars) of USDC this call needs available on Arbitrum
}): Promise<{ txHash: string; transactionId: string }> {
  requireConfig();
  const eoa = await getEoa(args.eip1193Provider);
  const ua = getUniversalAccount(eoa);

  const payload: IUniversalTransaction = {
    chainId: CHAIN_ID.ARBITRUM_MAINNET_ONE,
    expectTokens: args.expectUsdc
      ? [{ type: SUPPORTED_TOKEN_TYPE.USDC, amount: String(args.expectUsdc) }]
      : [],
    transactions: args.calls.map((c) => ({
      to: c.to,
      data: c.data,
      value: c.value !== undefined ? `0x${c.value.toString(16)}` : undefined,
    })),
  };

  const transaction = await ua.createUniversalTransaction(payload);
  await signAndSubmit(ua, eoa, transaction);
  const txHash = await resolveArbitrumTxHash(ua, transaction.transactionId, transaction.rootHash);

  return { txHash, transactionId: transaction.transactionId };
}

// Polls Particle's transaction status until it's terminal (finished or failed).
async function waitForFinished(ua: UniversalAccount, transactionId: string): Promise<void> {
  const FAILED = new Set<number>([
    UA_TRANSACTION_STATUS.EXECUTION_FAILED,
    UA_TRANSACTION_STATUS.REFUND_FAILED,
    UA_TRANSACTION_STATUS.PENNY_FAILED,
  ]);
  const maxAttempts = 60; // ~2 minutes at 2s intervals
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await ua.getTransaction(transactionId);
    const status = result?.status ?? result?.transactionStatus;
    if (status === UA_TRANSACTION_STATUS.FINISHED) return;
    if (typeof status === "number" && FAILED.has(status)) {
      throw new VaultFlowError("Particle transaction failed.");
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new VaultFlowError("Particle transaction timed out waiting for confirmation.");
}

// Best-effort extraction of the actual Arbitrum tx hash for the finished
// transaction, so callers can read event logs or link to Arbiscan. Falls back
// to the Particle rootHash (not an on-chain hash, but at least a stable id) if
// the shape doesn't match what's expected -- see file header note.
async function resolveArbitrumTxHash(ua: UniversalAccount, transactionId: string, rootHash: string): Promise<string> {
  const result = await ua.getTransaction(transactionId);
  const fromUserOps = result?.userOps?.[0]?.txHash ?? result?.userOps?.[0]?.transactionHash;
  return fromUserOps ?? result?.transactionHash ?? result?.hash ?? rootHash;
}

// All GoalVault addresses this creator has ever deployed via the factory, read
// from the factory's `VaultCreated` events (creator is an indexed topic, so the
// RPC filters server-side). Used to identify a freshly created vault without
// depending on Particle v2's opaque getTransaction() tx-hash shape.
async function getCreatorVaults(creator: Address): Promise<Address[]> {
  if (!FACTORY_ADDRESS) return [];
  const pc = publicClient();
  const logs = await pc.getContractEvents({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    eventName: "VaultCreated",
    args: { creator },
    fromBlock: 0n,
    toBlock: "latest",
  });
  return logs.map((l) => l.args.vault as Address);
}

// Deploys a fresh GoalVault via the factory. Pure contract call, no token
// movement, so expectTokens is empty.
//
// Particle UA v2 settles the call on Arbitrum but getTransaction() doesn't
// surface the settled Arbitrum tx hash in a documented shape, so instead of
// reading a receipt by hash we locate the new vault via the factory's
// `VaultCreated(creator)` events: snapshot the creator's existing vaults, run
// the transaction, then poll until a vault appears that wasn't there before.
export async function deployGoalVault(args: {
  eip1193Provider: EIP1193Provider;
  creator: Address;
  targetAmount: number; // display units (dollars), matches Goal.targetAmount
}): Promise<{ vaultAddr: string }> {
  if (!FACTORY_ADDRESS || !USDC_ADDRESS) {
    throw new VaultFlowError("GoalVault factory is not configured. Set NEXT_PUBLIC_GOALVAULT_FACTORY_ADDRESS.");
  }
  const targetUnits = BigInt(Math.round(args.targetAmount * 1_000_000)); // USDC has 6 decimals

  const data = encodeFunctionData({
    abi: FACTORY_ABI,
    functionName: "createVault",
    args: [USDC_ADDRESS, targetUnits, args.creator],
  });

  const before = new Set((await getCreatorVaults(args.creator)).map((a) => a.toLowerCase()));

  await executeUniversalTransaction({
    eip1193Provider: args.eip1193Provider,
    calls: [{ to: FACTORY_ADDRESS, data }],
  });

  // Poll for the newly created vault (indexing lag between Particle reporting
  // "finished" and the event being queryable on the public RPC).
  for (let attempt = 0; attempt < 30; attempt++) {
    const current = await getCreatorVaults(args.creator);
    const fresh = current.find((v) => !before.has(v.toLowerCase()));
    if (fresh) return { vaultAddr: fresh };
    await new Promise((r) => setTimeout(r, 2000));
  }

  throw new VaultFlowError("Vault was created on-chain but could not be located yet. Refresh and check your goals.");
}

// Approves and deposits in one Universal Transaction (batched calls), from the
// depositing member's own Universal Account.
export async function depositToVault(args: {
  eip1193Provider: EIP1193Provider;
  vaultAddr: Address;
  amount: number; // display units (dollars), matches Goal amounts today
}): Promise<{ txHash: string }> {
  if (!USDC_ADDRESS) throw new VaultFlowError("Particle is not configured.");
  const units = BigInt(Math.round(args.amount * 1_000_000)); // USDC has 6 decimals

  const approveData = encodeFunctionData({
    abi: ERC20_ABI,
    functionName: "approve",
    args: [args.vaultAddr, units],
  });
  const depositData = encodeFunctionData({
    abi: VAULT_DEPOSIT_ABI,
    functionName: "deposit",
    args: [units],
  });

  const { txHash } = await executeUniversalTransaction({
    eip1193Provider: args.eip1193Provider,
    calls: [
      { to: USDC_ADDRESS, data: approveData },
      { to: args.vaultAddr, data: depositData },
    ],
    expectUsdc: args.amount,
  });

  return { txHash };
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
  const functionName = args.choice === "release" ? "voteRelease" : "voteRefund";
  const data = encodeFunctionData({ abi: VAULT_ACTION_ABI, functionName });

  const { txHash } = await executeUniversalTransaction({
    eip1193Provider: args.eip1193Provider,
    calls: [{ to: args.vaultAddr, data }],
  });
  return { txHash };
}

// Permissionless: sends pooled balance to creator once >=50% voted Release.
export async function executeRelease(args: {
  eip1193Provider: EIP1193Provider;
  vaultAddr: Address;
}): Promise<{ txHash: string }> {
  const data = encodeFunctionData({ abi: VAULT_ACTION_ABI, functionName: "release" });
  const { txHash } = await executeUniversalTransaction({
    eip1193Provider: args.eip1193Provider,
    calls: [{ to: args.vaultAddr, data }],
  });
  return { txHash };
}

// Permissionless: marks vault as refundable once >=50% voted Refund.
export async function executeRefund(args: {
  eip1193Provider: EIP1193Provider;
  vaultAddr: Address;
}): Promise<{ txHash: string }> {
  const data = encodeFunctionData({ abi: VAULT_ACTION_ABI, functionName: "refund" });
  const { txHash } = await executeUniversalTransaction({
    eip1193Provider: args.eip1193Provider,
    calls: [{ to: args.vaultAddr, data }],
  });
  return { txHash };
}

// Pull-pattern claim: each member withdraws their own contribution after a refund vote.
export async function claimRefund(args: {
  eip1193Provider: EIP1193Provider;
  vaultAddr: Address;
}): Promise<{ txHash: string }> {
  const data = encodeFunctionData({ abi: VAULT_ACTION_ABI, functionName: "claim" });
  const { txHash } = await executeUniversalTransaction({
    eip1193Provider: args.eip1193Provider,
    calls: [{ to: args.vaultAddr, data }],
  });
  return { txHash };
}

// Sends `amount` USDC from the signed-in user's Universal Account to any address
// -- e.g. moving funds back out to a personal MetaMask wallet after testing, or
// a treasurer forwarding a released goal onward. Particle sources the USDC from
// the UA's balance; here the receiver is paid in USDC on Arbitrum.
export async function sendFunds(args: {
  eip1193Provider: EIP1193Provider;
  to: Address;
  amount: number; // display units (dollars) of USDC
}): Promise<{ transactionId: string }> {
  requireConfig();
  if (!USDC_ADDRESS) throw new VaultFlowError("Particle is not configured.");
  const eoa = await getEoa(args.eip1193Provider);
  const ua = getUniversalAccount(eoa);

  const transaction = await ua.createTransferTransaction({
    token: { chainId: CHAIN_ID.ARBITRUM_MAINNET_ONE, address: USDC_ADDRESS },
    amount: String(args.amount),
    receiver: args.to,
  });
  await signAndSubmit(ua, eoa, transaction);

  return { transactionId: transaction.transactionId };
}

// Read-only: how much USDC `addr` currently holds on Arbitrum, in display units
// (dollars). No signer needed -- just a public read. Particle UA aggregates
// cross-chain balance too (ua.getPrimaryAssets()) but the vault only ever sees
// funds once routed to Arbitrum, so this local read is what matters for the UI.
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

export interface UnifiedBalance {
  totalUsd: number; // combined value across every chain, in USD
  assets: { symbol: string; amount: number; amountUsd: number }[];
}

// The member's unified Universal Account balance -- all assets across all chains
// aggregated into one USD figure, via Particle's getPrimaryAssets(). This is the
// "one balance everywhere" view: e.g. USDC on Base + ETH on Arbitrum shown as a
// single total. Read-only (no signing); builds the UA from the address alone.
export async function getUnifiedBalance(addr: Address): Promise<UnifiedBalance> {
  requireConfig();
  const ua = getUniversalAccount(addr);
  const res = await ua.getPrimaryAssets();
  const assets = (res?.assets ?? [])
    .map((a) => ({
      symbol: String(a.tokenType).toUpperCase(),
      amount: a.amount,
      amountUsd: a.amountInUSD,
    }))
    .filter((a) => a.amount > 0);
  return { totalUsd: res?.totalAmountInUSD ?? 0, assets };
}

export function isLive(): boolean {
  return hasKey;
}
