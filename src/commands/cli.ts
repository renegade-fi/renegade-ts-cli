import type { Options } from "yargs";
import { CHAINS } from "../constants";
import { SUPPORTED_CHAINS } from "../config";

export interface Cli {
  "chain-id": typeof CHAINS.ARBITRUM | typeof CHAINS.ARBITRUM_SEPOLIA;
  "wallet-path": string;
}

export const cliOptions: { [key in keyof Cli]: Options } = {
  "chain-id": {
    description:
      "Chain ID to use (42161 for Arbitrum One, 421614 for Arbitrum Sepolia)",
    demandOption: true,
    type: "number",
    choices: SUPPORTED_CHAINS,
  },
  "wallet-path": {
    description: "Path to wallet JSON file",
    type: "string",
    demandOption: true,
    default: `${process.cwd()}/wallet.json`,
  },
};

export type WalletField = "orders" | "balances";

export interface PrintWalletArgs extends Cli {
  field?: WalletField;
}
