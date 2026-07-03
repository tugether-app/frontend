// ZeroDev wrapper: deploy a per-goal GoalVault via GoalVaultFactory (called from
// the creator's own smart account -- ERC-4337 accounts can only call into other
// contracts, not perform a raw CREATE, hence the factory). Vote/release/refund/
// claim wiring is a separate, later pass -- withdraw() below stays a stub.

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

  const publicClient = createPublicClient({ chain: arbitrumSepolia, transport: http(ARBITRUM_RPC) });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  const [event] = parseEventLogs({ abi: FACTORY_ABI, eventName: "VaultCreated", logs: receipt.logs });
  if (!event) throw new Error("Vault deployment did not emit VaultCreated.");

  return { vaultAddr: event.args.vault };
}

// TODO(next pass): build + send vote/release/refund/claim userOps against the
// redesigned GoalVault (see contracts/src/GoalVault.sol). Still a stub.
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
