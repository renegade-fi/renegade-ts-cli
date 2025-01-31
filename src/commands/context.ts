import {
  createExternalKeyConfig,
  loadTokenMapping,
  type ExternalConfig,
  type GeneratedSecrets,
} from "@renegade-fi/node";
import { readFile } from "fs/promises";
import type { Cli } from "../cli.js";
import { CHAINS, SUPPORTED_CHAINS } from "../constants.js";
import { ConfigError, ErrorCode } from "../errors.js";
import { validateWalletPath } from "../config.js";

// Required fields that must exist in a wallet file
const REQUIRED_WALLET_FIELDS = [
  "wallet_id",
  "blinder_seed",
  "share_seed",
  "symmetric_key",
  "sk_match",
] as const;

function validateWalletSecrets(secrets: GeneratedSecrets): void {
  for (const field of REQUIRED_WALLET_FIELDS) {
    if (!secrets[field]) {
      throw new ConfigError(
        `Missing required field in wallet secrets: ${field}`,
        ErrorCode.INVALID_WALLET_FORMAT,
        [
          `Ensure your wallet secrets file contains the ${field} field`,
          "All wallet fields must have non-empty values",
          "Try running 'setup' to create a new wallet",
        ],
      );
    }
  }
}

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

// Loads the wallet secrets from the given path and validates them
async function loadWalletSecrets(
  walletPath: string,
): Promise<GeneratedSecrets> {
  await validateWalletPath(walletPath);
  const walletData = await readFile(walletPath, "utf-8");
  const secrets = JSON.parse(walletData) as GeneratedSecrets;
  validateWalletSecrets(secrets);
  return secrets;
}

// Initializes the token mapping for SDK
async function initializeTokenMapping(tokenMappingUrl: string): Promise<void> {
  try {
    process.env.TOKEN_MAPPING_URL = tokenMappingUrl;
    await loadTokenMapping();
  } catch (error) {
    throw new ConfigError(
      "Failed to load token mapping",
      ErrorCode.TOKEN_MAPPING_ERROR,
      [
        "Check your internet connection",
        "Verify the token mapping URL is accessible",
        `Current URL: ${tokenMappingUrl}`,
      ],
    );
  }
}

export async function createContext(args: Cli): Promise<CommandContext> {
  // Get chain-specific configuration
  const chainConfig = getChainConfig(args["chain-id"]);
  if (!chainConfig) {
    throw new ConfigError(
      `Invalid chain ID: ${args["chain-id"]}`,
      ErrorCode.CHAIN_CONFIG_ERROR,
      ["Use a supported chain ID", "Run with --help to see supported chains"],
    );
  }

  // Load wallet and token mapping in parallel
  const [secrets] = await Promise.all([
    loadWalletSecrets(args["wallet-path"]),
    initializeTokenMapping(chainConfig.tokenMappingUrl),
  ]);

  // Create the Config object to use with the Renegade SDK
  const config = createExternalKeyConfig({
    chainId: args["chain-id"],
    relayerUrl: chainConfig.httpUrl,
    darkPoolAddress: chainConfig.darkPoolAddress,
    websocketUrl: chainConfig.websocketUrl,
    walletId: secrets.wallet_id,
    symmetricKey: secrets.symmetric_key,
    // CLI is read-only for now, so public key and signMessage are not needed
    publicKey: "0x",
    signMessage: async () => {
      throw new Error("signMessage is not implemented");
    },
  });

  return {
    chainId: args["chain-id"],
    ...chainConfig,
    secrets,
    config,
  };
}

function getChainConfig(chainId: number): ChainConfig {
  if (!SUPPORTED_CHAINS.includes(chainId as SupportedChainId)) {
    const chainNames = SUPPORTED_CHAINS.map(
      (id) => `${id} (${CHAINS.NAMES[id]})`,
    ).join(", ");
    throw new Error(
      `Unsupported chain ID: ${chainId}. ` + `Supported chains: ${chainNames}`,
    );
  }
  return CHAIN_CONFIGS[chainId as SupportedChainId];
}

type SupportedChainId = (typeof SUPPORTED_CHAINS)[number];

const CHAIN_CONFIGS: Record<SupportedChainId, ChainConfig> = {
  [CHAINS.ARBITRUM]: {
    httpUrl: "https://mainnet.cluster0.renegade.fi:3000",
    websocketUrl: "wss://mainnet.cluster0.renegade.fi:4000",
    darkPoolAddress: "0x30bd8eab29181f790d7e495786d4b96d7afdc518",
    tokenMappingUrl:
      "https://raw.githubusercontent.com/renegade-fi/token-mappings/main/mainnet.json",
  },
  [CHAINS.ARBITRUM_SEPOLIA]: {
    httpUrl: "https://testnet.cluster0.renegade.fi:3000",
    websocketUrl: "wss://testnet.cluster0.renegade.fi:4000",
    darkPoolAddress: "0x9af58F1Ff20aB22e819E40B57FFd784d115a9ef5",
    tokenMappingUrl:
      "https://raw.githubusercontent.com/renegade-fi/token-mappings/main/testnet.json",
  },
} as const;

interface ChainConfig {
  httpUrl: string;
  websocketUrl: string;
  darkPoolAddress: `0x${string}`;
  tokenMappingUrl: string;
}
