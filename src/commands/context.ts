import {
  createExternalKeyConfig,
  loadTokenMapping,
  Token,
  type ExternalConfig,
  type GeneratedSecrets,
} from "@renegade-fi/node";
import { readFile } from "fs/promises";
import { getChainConfig } from "../config";
import { ConfigError } from "../services/config";
import type { Cli } from "./cli";

export interface CommandContext {
  // The ID of the current chain
  chainId: number;
  // The HTTP URL of the Renegade relayer
  httpUrl: string;
  // The WebSocket URL of the Renegade relayer
  websocketUrl: string;
  // The address of the Renegade dark pool
  darkPoolAddress: `0x${string}`;
  // The cryptographic secrets loaded from the wallet file
  secrets: GeneratedSecrets;
  // The Config object to use with the Renegade SDK
  //
  // TODO: Add support for other types of Config
  config: ExternalConfig;
}

export async function createContext(args: Cli): Promise<CommandContext> {
  try {
    // Get chain-specific configuration
    const chainConfig = getChainConfig(args["chain-id"]);
    // Read and parse wallet secrets
    const walletData = await readFile(args["wallet-path"], "utf-8");
    const secrets = JSON.parse(walletData) as GeneratedSecrets;

    // Load token mapping url into environment variable
    process.env.TOKEN_MAPPING_URL = chainConfig.tokenMappingUrl;

    // Load the token mapping
    await loadTokenMapping();

    // Create the Config object to use with the Renegade SDK
    const config = createExternalKeyConfig({
      relayerUrl: chainConfig.httpUrl,
      darkPoolAddress: chainConfig.darkPoolAddress,
      websocketUrl: chainConfig.websocketUrl,
      walletId: secrets.wallet_id,
      symmetricKey: secrets.symmetric_key,
      // CLI is read-only for now, so public key and signMessage are not needed
      publicKey: "0x",
      signMessage: async (message: string) => {
        throw new Error("signMessage is not implemented");
      },
    });

    return {
      chainId: args["chain-id"],
      ...chainConfig,
      secrets,
      config,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new ConfigError(error.message, "WALLET_ERROR", [
        "Ensure your wallet file is valid JSON and contains the required secrets",
      ]);
    }
    throw error;
  }
}
