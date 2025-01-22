import chalk from "chalk";
import type { Arguments, CommandBuilder } from "yargs";
import type { Cli } from "../cli";
import { BINARY_NAME, CHAINS, CONFIG_COMMAND } from "../constants";
import { formatError } from "../formatters/error";
import { deleteConfig, readConfig } from "../config";

export interface ConfigArgs extends Cli {
  subcommand?: "view" | "reset";
}

export const command = `${CONFIG_COMMAND} [subcommand]`;
export const desc = "Manage CLI configuration";

export const builder: CommandBuilder<{}, ConfigArgs> = {
  subcommand: {
    describe: "Config action to perform",
    choices: ["view", "reset"] as const,
    type: "string",
    default: "view",
  },
};

const printModifyHint = () => {
  console.log("\nTo modify configuration:");
  console.log(chalk.cyan(`  $ ${BINARY_NAME} setup`));
};

export const handler = async (argv: Arguments<ConfigArgs>) => {
  try {
    switch (argv.subcommand) {
      case "reset": {
        await deleteConfig();
        console.log(chalk.green("✓") + " Configuration reset successfully");
        console.log("\nRun setup to configure the CLI:");
        console.log(chalk.cyan(`  $ ${BINARY_NAME} setup`));
        break;
      }
      case "view":
      default: {
        const config = await readConfig();
        if (!config) {
          console.log(chalk.yellow("No configuration found"));
          console.log(
            `Run ${chalk.cyan(`${BINARY_NAME} setup`)} to configure the CLI`,
          );
          return;
        }
        console.log("\nCurrent configuration:");
        console.log(
          chalk.cyan("Chain:"),
          `${CHAINS.NAMES[config.chainId]} (${config.chainId})`,
        );
        console.log(chalk.cyan("Path to wallet secrets:"), config.walletPath);
        printModifyHint();
        break;
      }
    }
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
};
