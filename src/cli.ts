import type { Argv, Options } from "yargs";
import { SUPPORTED_CHAINS } from "./constants";
import { CHAINS } from "./constants";
import { readConfig } from "./config";

export interface Cli {
  "chain-id": typeof CHAINS.ARBITRUM | typeof CHAINS.ARBITRUM_SEPOLIA;
  "wallet-path": string;
}

export const cliOptions: { [key in keyof Cli]: Options } = {
  "chain-id": {
    description:
      "Chain ID to use (42161 for Arbitrum One, 421614 for Arbitrum Sepolia)",
    type: "number",
    choices: SUPPORTED_CHAINS,
  },
  "wallet-path": {
    description: "Path to wallet JSON file",
    type: "string",
  },
};

// Middleware to load config-based defaults
export const loadConfigDefaults = async (args: any) => {
  const config = await readConfig();
  if (!config) return;

  args["chain-id"] = args["chain-id"] || config.chainId;
  args["wallet-path"] = args["wallet-path"] || config.walletPath;
};
