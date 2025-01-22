import { getBackOfQueueWallet } from "@renegade-fi/node";
import chalk from "chalk";
import ora from "ora";
import type { Arguments, CommandBuilder } from "yargs";
import type { Cli } from "../cli.js";
import { BINARY_NAME, WALLET_COMMAND } from "../constants.js";
import { handleSdkError } from "../errors.js";
import { formatError } from "../formatters/error.js";
import { formatWallet } from "../formatters/wallet.js";
import { createContext } from "./context.js";

export type WalletField = "orders" | "balances" | "fees";

export interface ShowWalletArgs extends Cli {
  field?: WalletField;
  filter?: boolean;
}

export const command = WALLET_COMMAND;
export const desc = "Display wallet state information";

export const builder: CommandBuilder<{}, ShowWalletArgs> = {
  field: {
    description: "Specific field to display (orders, balances, or fees)",
    type: "string",
    choices: ["orders", "balances", "fees"] as const,
  },
  filter: {
    description: "Whether to filter out default values",
    type: "boolean",
    default: true,
  },
};

export const handler = async (argv: Arguments<ShowWalletArgs>) => {
  const spinner = ora("Fetching wallet from relayer");
  try {
    const ctx = await createContext(argv);
    spinner.start();
    // Force filter=false when field=fees
    const filter = argv.field === "fees" ? false : argv.filter;
    const wallet = await getBackOfQueueWallet(ctx.config, {
      filterDefaults: filter,
    }).catch((error) => {
      throw handleSdkError(error);
    });

    spinner.succeed("Fetched wallet from relayer");
    console.log("");
    console.log(formatWallet(wallet, { field: argv.field }));
    console.log("");
    console.log(printSuccessHints(argv.field));

    process.exit(0);
  } catch (error) {
    spinner.fail();
    console.error(formatError(error as Error));
    process.exit(1);
  }
};

// Helper function for success hints
const printSuccessHints = (field?: WalletField) => {
  switch (field) {
    case "orders":
      return [
        "Try these related commands:",
        chalk.cyan(`  $ ${BINARY_NAME} order-history`),
        "    View detailed order history with fill percentages",
      ].join("\n");
    case "balances":
      return [
        "Try these related commands:",
        chalk.cyan(`  $ ${BINARY_NAME} wallet --field=fees`),
        "    View your fee balances",
      ].join("\n");
    case "fees":
      return [
        "Try these related commands:",
        chalk.cyan(`  $ ${BINARY_NAME} wallet --field=orders`),
        "    View your open orders",
        chalk.cyan(`  $ ${BINARY_NAME} wallet --field=balances`),
        "    View your token balances",
      ].join("\n");
    default:
      return [
        "Try these related commands:",
        chalk.cyan(`  $ ${BINARY_NAME} wallet --field=orders`),
        "    View your open orders",
        chalk.cyan(`  $ ${BINARY_NAME} wallet --field=balances`),
        "    View your token balances",
        chalk.cyan(`  $ ${BINARY_NAME} wallet --field=fees`),
        "    View your fee balances",
      ].join("\n");
  }
};
