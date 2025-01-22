import { homedir } from "os";
import { join } from "path";

// Path to the directory where the config is stored
export const CONFIG_DIR = join(homedir(), ".renegade-ts-cli");

// Path to the config file
export const CONFIG_FILE_PATH = join(CONFIG_DIR, "config.json");

// Name of the binary
export const BINARY_NAME = "renegade";

// Command to setup the CLI
export const SETUP_COMMAND = "setup";

// Command to view and edit the config
export const CONFIG_COMMAND = "config";

// Command to view the wallet state
export const WALLET_COMMAND = "wallet";

// Command to view the order history
export const ORDER_HISTORY_COMMAND = "order-history";

// Command to view the task history
export const TASK_HISTORY_COMMAND = "task-history";

export const CHAINS = {
  ARBITRUM: 42161,
  ARBITRUM_SEPOLIA: 421614,
  NAMES: {
    42161: "Arbitrum One",
    421614: "Arbitrum Sepolia",
  },
} as const;

export const SUPPORTED_CHAINS = [
  CHAINS.ARBITRUM,
  CHAINS.ARBITRUM_SEPOLIA,
] as const;
