export const CLI = {
  NAME: "renegade",
  COMMANDS: {
    SETUP: "setup",
    WALLET: {
      STATE: "wallet state",
    },
  },
} as const;

export const CHAINS = {
  ARBITRUM: 42161,
  ARBITRUM_SEPOLIA: 421614,
  NAMES: {
    42161: "Arbitrum One",
    421614: "Arbitrum Sepolia",
  },
} as const;

export const ERRORS = {
  CODES: {
    WALLET_NOT_FOUND: "WALLET_NOT_FOUND",
    INVALID_JSON: "INVALID_JSON",
  },
  MESSAGES: {
    WALLET_NOT_FOUND: (path: string) => `No valid wallet file found at ${path}`,
    INVALID_JSON: (path: string) => `Wallet file at ${path} is not valid JSON`,
  },
} as const;

export const SUCCESS_MESSAGES = {
  WALLET_VALIDATED: "Wallet JSON file validated",
  CHAIN_SET: (chainId: number) =>
    `Chain ID set to ${chainId} (${CHAINS.NAMES[chainId as keyof typeof CHAINS.NAMES]})`,
  WALLET_PATH_SET: (path: string) => `Using wallet at ${path}`,
} as const;

export const HELP_MESSAGES = {
  SETUP: {
    COMMAND: "Validate wallet file and chain ID settings",
    CHAIN_ID: "Chain ID to use (42161 or 421614)",
    WALLET_PATH: "Path to wallet JSON file",
  },
} as const;
