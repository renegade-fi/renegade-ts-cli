import chalk from "chalk";
import ora from "ora";
import type { Arguments, CommandBuilder } from "yargs";
import { CLI } from "../constants";
import { formatError } from "../formatters/error";
import type { Cli } from "./cli";
import { createContext } from "./context";

export const command = CLI.COMMANDS.SETUP;
export const desc = "Validate wallet file and chain ID settings";

export const builder: CommandBuilder<{}, Cli> = {};

export const handler = async (argv: Arguments<Cli>) => {
  const spinner = ora("Initializing wallet...").start();

  try {
    const ctx = await createContext(argv);
    spinner.succeed("Wallet initialized successfully");

    // Success output
    console.log("");
    console.log(chalk.green("✓") + ` Chain ID set to ${ctx.chainId}`);
    console.log(chalk.green("✓") + ` Using wallet at ${argv["wallet-path"]}`);
    console.log("");
    console.log("Ready to use! Try:");
    console.log(chalk.cyan(`  $ ${CLI.NAME} wallet state`));

    process.exit(0);
  } catch (error) {
    spinner.fail("Setup failed");
    console.error(formatError(error as Error));
    process.exit(1);
  }
};
