export enum ErrorCode {
  // Config related errors
  CONFIG_WRITE_ERROR = "CONFIG_WRITE_ERROR",
  CONFIG_READ_ERROR = "CONFIG_READ_ERROR",
  WALLET_NOT_FOUND = "WALLET_NOT_FOUND",
  INVALID_JSON = "INVALID_JSON",
  INVALID_PERMISSIONS = "INVALID_PERMISSIONS",
  // Context related errors
  TOKEN_MAPPING_ERROR = "TOKEN_MAPPING_ERROR",
  INVALID_WALLET_FORMAT = "INVALID_WALLET_FORMAT",
  CHAIN_CONFIG_ERROR = "CHAIN_CONFIG_ERROR",
  // SDK error
  SDK_ERROR = "SDK_ERROR",
}

export class CLIBaseError extends Error {
  code: ErrorCode;
  suggestions: string[];

  constructor(message: string, code: ErrorCode, suggestions: string[] = []) {
    super(message);
    this.code = code;
    this.suggestions = suggestions;
    this.name = this.constructor.name;
  }

  toString(): string {
    return `${this.message}\n\nSuggestions:\n${this.suggestions.map((s) => `- ${s}`).join("\n")}`;
  }
}

// Specific error classes
export class ConfigError extends CLIBaseError {
  constructor(message: string, code: ErrorCode, suggestions: string[] = []) {
    super(message, code, suggestions);
  }
}

export class WalletError extends CLIBaseError {
  constructor(message: string, code: ErrorCode, suggestions: string[] = []) {
    super(message, code, suggestions);
  }
}

export function handleSdkError(error: unknown): CLIBaseError {
  const message =
    error instanceof Error ? error.message : "Unknown error occurred";
  return new ConfigError(`SDK Error: ${message}`, ErrorCode.SDK_ERROR, [
    `Ensure your wallet secrets file and chain id are properly configured using $ renegade config view`,
  ]);
}
