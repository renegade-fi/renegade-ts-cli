import {
  access,
  constants,
  mkdir,
  readFile,
  unlink,
  writeFile,
} from "fs/promises";
import { dirname } from "path";
import { CHAINS, CONFIG_DIR, CONFIG_FILE_PATH } from "./constants.js";
import { ConfigError, ErrorCode } from "./errors.js";

interface Config {
  walletPath: string;
  chainId: typeof CHAINS.ARBITRUM | typeof CHAINS.ARBITRUM_SEPOLIA;
}

/** Checks if a file or directory exists at the given path */
export async function checkExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/** Verifies read/write access to a file, throws ConfigError if file is missing or inaccessible */
export async function checkFileAccess(
  path: string,
  mode: number,
): Promise<void> {
  if (!(await checkExists(path))) {
    throw new ConfigError(
      `File not found: ${path}`,
      ErrorCode.WALLET_NOT_FOUND,
      [`Ensure the file exists at ${path}`, "Try using an absolute path"],
    );
  }

  try {
    await access(path, mode);
  } catch {
    const operation = mode === constants.R_OK ? "read" : "write";
    throw new ConfigError(
      `Cannot ${operation} ${path}`,
      ErrorCode.INVALID_PERMISSIONS,
      [`Check if you have ${operation} permissions`],
    );
  }
}

/** Validates that a wallet file exists, is readable, and contains valid JSON */
export async function validateWalletPath(path: string): Promise<void> {
  await checkFileAccess(path, constants.R_OK);

  try {
    const content = await readFile(path, "utf-8");
    JSON.parse(content);
  } catch (error) {
    throw new ConfigError(
      `Could not parse JSON in ${path}`,
      ErrorCode.INVALID_JSON,
      ["Ensure the file contains valid JSON"],
    );
  }
}

/** Reads and parses the config file, returns null if file doesn't exist */
export async function readConfig(): Promise<Config | null> {
  if (!(await checkExists(CONFIG_FILE_PATH))) {
    return null; // File doesn't exist, which is fine during setup
  }

  await checkFileAccess(CONFIG_FILE_PATH, constants.R_OK);

  try {
    const content = await readFile(CONFIG_FILE_PATH, "utf-8");
    return JSON.parse(content);
  } catch {
    throw new ConfigError(
      "Invalid configuration file format",
      ErrorCode.INVALID_JSON,
      ["Ensure the file contains valid JSON"],
    );
  }
}

/** Saves config to disk, creating config directory if needed */
export async function writeConfig(config: Config): Promise<void> {
  const configDir = dirname(CONFIG_FILE_PATH);

  try {
    await mkdir(configDir, { recursive: true });
    if (!(await checkExists(configDir))) {
      throw new ConfigError(
        "Failed to create config directory",
        ErrorCode.INVALID_PERMISSIONS,
        [`Ensure you have write permissions to ${CONFIG_DIR}`],
      );
    }
    await checkFileAccess(configDir, constants.W_OK);
  } catch (error) {
    if (error instanceof ConfigError) throw error;
    throw new ConfigError(
      "Cannot create or write to config directory",
      ErrorCode.INVALID_PERMISSIONS,
      [`Ensure you have write permissions to ${CONFIG_DIR}`],
    );
  }

  try {
    await writeFile(CONFIG_FILE_PATH, JSON.stringify(config, null, 2));
  } catch {
    throw new ConfigError(
      "Failed to save configuration",
      ErrorCode.CONFIG_WRITE_ERROR,
      [`Ensure you have write permissions to ${CONFIG_FILE_PATH}`],
    );
  }
}

/** Removes the config file if it exists */
export async function deleteConfig(): Promise<void> {
  if (!(await checkExists(CONFIG_FILE_PATH))) {
    return; // File doesn't exist, which is fine for deletion
  }

  await checkFileAccess(CONFIG_FILE_PATH, constants.W_OK);

  try {
    await unlink(CONFIG_FILE_PATH);
  } catch {
    throw new ConfigError(
      "Failed to delete configuration",
      ErrorCode.INVALID_PERMISSIONS,
      [`Ensure you have write permissions to ${CONFIG_FILE_PATH}`],
    );
  }
}
