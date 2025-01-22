import { readFile, access } from "fs/promises";
import type { CLIError } from "../types";
import { ERRORS } from "../constants";

export class ConfigError extends Error implements CLIError {
  code: string;
  suggestions: string[];

  constructor(message: string, code: string, suggestions: string[] = []) {
    super(message);
    this.code = code;
    this.suggestions = suggestions;
  }
}

export async function validateWalletPath(path: string): Promise<void> {
  try {
    await access(path);
    const content = await readFile(path, "utf-8");
    JSON.parse(content); // Validate JSON structure
  } catch (error) {
    if (error instanceof Error && error.message.includes("ENOENT")) {
      throw new ConfigError(
        ERRORS.MESSAGES.WALLET_NOT_FOUND(path),
        ERRORS.CODES.WALLET_NOT_FOUND,
        [
          `Place your wallet JSON file at ${path}`,
          "Ensure the file contains valid JSON",
        ],
      );
    }
    throw new ConfigError(
      ERRORS.MESSAGES.INVALID_JSON(path),
      ERRORS.CODES.INVALID_JSON,
      ["Ensure the file contains valid JSON"],
    );
  }
}
