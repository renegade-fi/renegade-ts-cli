import chalk from "chalk";
import { BINARY_NAME } from "../constants.js";

export interface CLIError extends Error {
  code: string;
  suggestions: string[];
}

export function formatError(error: Error | CLIError): string {
  const isCliError = "code" in error && "suggestions" in error;

  const errorMessage = [chalk.red(error.message), ""];

  if (isCliError) {
    const cliError = error as CLIError;
    if (cliError.suggestions.length > 0) {
      errorMessage.push(
        "To fix this:",
        ...cliError.suggestions.map((s, i) => `${i + 1}. ${s}`),
        "",
      );
    }

    errorMessage.push("For more help:", `$ ${BINARY_NAME} --help`);
  }

  return errorMessage.join("\n");
}
