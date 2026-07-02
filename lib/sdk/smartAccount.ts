// ZeroDev Kernel smart account for the logged-in member (via the Magic signer).
// Separate from lib/sdk/zerodev.ts, which deploys/withdraws from a goal's
// GoalVault -- that stays a distinct concern. This file only turns a member's
// Magic signer into their own smart account address.

import { createPublicClient, http, type EIP1193Provider } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { createKernelAccount, createKernelAccountClient, createZeroDevPaymasterClient } from "@zerodev/sdk";
import { getEntryPoint, KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";

const hasKey = !!process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID;
const ENTRY_POINT = getEntryPoint("0.7");
// Arbitrum Sepolia for now (dev/testing, matches the ZeroDev project chain).
// Switch to arbitrum (mainnet, https://arb1.arbitrum.io/rpc) for the mainnet deploy.
const ARBITRUM_RPC = process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc";
const CHAIN = arbitrumSepolia;

export function isLive(): boolean {
  return hasKey;
}

function requireConfig() {
  if (!hasKey) throw new Error("ZeroDev is not configured. Set NEXT_PUBLIC_ZERODEV_PROJECT_ID.");
}

function getPublicClient() {
  return createPublicClient({ chain: CHAIN, transport: http(ARBITRUM_RPC) });
}

async function buildKernelAccount(eip1193Provider: EIP1193Provider) {
  const publicClient = getPublicClient();
  const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
    signer: eip1193Provider,
    entryPoint: ENTRY_POINT,
    kernelVersion: KERNEL_V3_1,
  });
  return createKernelAccount(publicClient, {
    plugins: { sudo: ecdsaValidator },
    entryPoint: ENTRY_POINT,
    kernelVersion: KERNEL_V3_1,
  });
}

// Counterfactual address only -- CREATE2, no transaction, no gas. The account
// deploys itself lazily on its first userOp.
export async function getSmartAccountAddress(eip1193Provider: EIP1193Provider): Promise<string> {
  requireConfig();
  const account = await buildKernelAccount(eip1193Provider);
  return account.address;
}

// Full client for sending sponsored userOps (deposit/withdraw). Not called
// during login; a future deposit flow reuses this instead of rebuilding it.
// Session key permissions (@zerodev/permissions) are intentionally not wired
// in yet -- add a `regular` plugin here when that lands.
export async function getKernelAccountClient(eip1193Provider: EIP1193Provider) {
  requireConfig();
  const account = await buildKernelAccount(eip1193Provider);
  const zerodevRpc = process.env.NEXT_PUBLIC_ZERODEV_RPC_URL;
  if (!zerodevRpc) throw new Error("ZeroDev is not configured. Set NEXT_PUBLIC_ZERODEV_RPC_URL.");
  const paymasterClient = createZeroDevPaymasterClient({ chain: CHAIN, transport: http(zerodevRpc) });
  return createKernelAccountClient({
    account,
    chain: CHAIN,
    bundlerTransport: http(zerodevRpc),
    paymaster: paymasterClient,
  });
}
