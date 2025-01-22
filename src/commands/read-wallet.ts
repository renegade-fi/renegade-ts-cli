import ora from "ora";
import type { Arguments, CommandBuilder } from "yargs";
import { CLI } from "../constants";
import { formatError } from "../formatters/error";
import { formatWallet } from "../formatters/wallet";
import type { PrintWalletArgs } from "./cli";
import { createContext } from "./context";
import { getBackOfQueueWallet } from "@renegade-fi/node";
import type { CommandContext } from "./context";
import { ConfigError } from "../services/config";

export const command = CLI.COMMANDS.WALLET.STATE;
export const desc = "Display wallet state information";

export const builder: CommandBuilder<{}, PrintWalletArgs> = {
  field: {
    description: "Specific field to display (orders or balances)",
    type: "string",
    choices: ["orders", "balances"] as const,
  },
};

export const handler = async (argv: Arguments<PrintWalletArgs>) => {
  const spinner = ora("Loading wallet state...").start();

  try {
    const ctx = await createContext(argv);
    const wallet = await fetchWallet(ctx);

    spinner.succeed("Wallet state loaded");
    console.log("");
    console.log(formatWallet(wallet, { field: argv.field }));

    process.exit(0);
  } catch (error) {
    spinner.fail("Failed to load wallet state");
    console.error(formatError(error as Error));
    process.exit(1);
  }
};

async function fetchWallet(ctx: CommandContext) {
  try {
    return getBackOfQueueWallet(ctx.config);
  } catch (error) {
    if (error instanceof Error) {
      throw new ConfigError(error.message, "WALLET_ERROR", [
        "Ensure your wallet file is valid and you have the correct permissions",
      ]);
    }
    throw error;
  }
}
