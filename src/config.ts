import { CHAINS } from "./constants";

interface ChainConfig {
  httpUrl: string;
  websocketUrl: string;
  darkPoolAddress: `0x${string}`;
  tokenMappingUrl: string;
}

export const SUPPORTED_CHAINS = [
  CHAINS.ARBITRUM,
  CHAINS.ARBITRUM_SEPOLIA,
] as const;
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

export function getChainConfig(chainId: number): ChainConfig {
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
