export interface CLIError extends Error {
  code: string;
  suggestions: string[];
}
