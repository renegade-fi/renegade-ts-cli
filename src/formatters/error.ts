import chalk from "chalk";
import type { CLIError } from "../types";

export function formatError(error: Error | CLIError): string {
  const isCliError = "code" in error && "suggestions" in error;

  const errorMessage = [chalk.red("Error: ") + error.message, ""];

  if (isCliError) {
    const cliError = error as CLIError;
    if (cliError.suggestions.length > 0) {
      errorMessage.push(
        "To fix this:",
        ...cliError.suggestions.map((s, i) => `${i + 1}. ${s}`),
        "",
      );
    }

    errorMessage.push("For more help:", "$ cli-tool setup --help");
  }

  return errorMessage.join("\n");
}
