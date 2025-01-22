import chalk from "chalk";
import inquirer from "inquirer";
import ora from "ora";
import { homedir } from "os";
import { join } from "path";
import type { Arguments, CommandBuilder } from "yargs";
import type { Cli } from "../cli.js";
import {
  BINARY_NAME,
  CHAINS,
  ORDER_HISTORY_COMMAND,
  SETUP_COMMAND,
  TASK_HISTORY_COMMAND,
  WALLET_COMMAND,
} from "../constants.js";
import { ConfigError } from "../errors.js";
import { formatError } from "../formatters/error.js";
import { readConfig, validateWalletPath, writeConfig } from "../config.js";
import { createContext } from "./context.js";

export const command = SETUP_COMMAND;
export const desc = "Interactive setup for wallet configuration";

export const builder: CommandBuilder<{}, Cli> = {};

export const handler = async (argv: Arguments<Cli>) => {
  try {
    printWelcomeMessage();

    const { defaultPath, defaultChainId, existingConfig } =
      await getDefaultValues(argv);
    await checkExistingConfig(existingConfig);

    const { walletPath, chainId } = await promptForConfig(
      defaultPath,
      defaultChainId,
    );
    await validateAndSaveConfig(walletPath, chainId);

    const ctx = await createContext({
      ...argv,
      "wallet-path": walletPath,
      "chain-id": chainId,
    });
    console.log(printSuccessHints(ctx, walletPath));

    process.exit(0);
  } catch (error) {
    if (error instanceof ConfigError) {
      console.error(formatError(error));
    } else {
      console.error(
        chalk.red("Setup failed:"),
        error instanceof Error ? error.message : String(error),
      );
    }
    process.exit(1);
  }
};

const printWelcomeMessage = () => {
  console.log(chalk.cyan("\nWelcome to the Renegade CLI Setup! 🜆\n"));
  console.log(
    "This setup requires your wallet secrets file, which should look like this:",
  );
  console.log();
  console.log(chalk.gray("wallet.json:"));
  console.log(
    chalk.gray("┌────────────────────────────────────────────────────┐"),
  );
  console.log(chalk.gray("│") + " {");
  console.log(chalk.gray("│") + '   "wallet_id": "****-****-****-****",');
  console.log(chalk.gray("│") + '   "blinder_seed": "0x***",');
  console.log(chalk.gray("│") + '   "share_seed": "0x***",');
  console.log(chalk.gray("│") + '   "symmetric_key": "0x***",');
  console.log(chalk.gray("│") + '   "sk_match": "0x***"');
  console.log(chalk.gray("│") + " }");
  console.log(
    chalk.gray("└────────────────────────────────────────────────────┘"),
  );
  console.log();
  console.log(
    chalk.blue(
      "→ Follow these instructions to generate your wallet secrets file: https://docs.renegade.fi/technical-reference/typescript-sdk#generating-wallet-secrets",
    ),
  );
  console.log();
  console.log(
    chalk.yellow("Note:") +
      " This wallet file only enables read operations (like viewing balances and orders).",
  );
  console.log();
};

const getDefaultValues = async (argv: Arguments<Cli>) => {
  const existingConfig = await readConfig();
  const defaultWalletPath = join(homedir(), "wallet.json");
  return {
    defaultPath:
      argv["wallet-path"] || existingConfig?.walletPath || defaultWalletPath,
    defaultChainId:
      argv["chain-id"] || existingConfig?.chainId || CHAINS.ARBITRUM,
    existingConfig,
  };
};

const checkExistingConfig = async (existingConfig: any) => {
  if (!existingConfig) return true;

  const { shouldOverwrite } = await inquirer.prompt([
    {
      type: "confirm",
      name: "shouldOverwrite",
      message: "Existing configuration found. Would you like to overwrite it?",
      default: false,
    },
  ]);

  if (!shouldOverwrite) {
    console.log(
      chalk.yellow(
        "\nSetup cancelled. Current configuration remains unchanged.",
      ),
    );
    console.log(
      `Use ${chalk.cyan(`${BINARY_NAME} config view`)} to see current settings`,
    );
    console.log(
      `Use ${chalk.cyan(`${BINARY_NAME} config reset`)} to reset configuration\n`,
    );
    process.exit(0);
  }

  return shouldOverwrite;
};

const promptForConfig = async (defaultPath: string, defaultChainId: number) => {
  return inquirer.prompt([
    {
      type: "input",
      name: "walletPath",
      message: "Enter the path to your wallet secrets file:",
      default: defaultPath,
    },
    {
      type: "list",
      name: "chainId",
      message: "Select the chain to use:",
      choices: [
        {
          name: `Arbitrum One (${CHAINS.ARBITRUM})`,
          value: CHAINS.ARBITRUM,
        },
        {
          name: `Arbitrum Sepolia (${CHAINS.ARBITRUM_SEPOLIA})`,
          value: CHAINS.ARBITRUM_SEPOLIA,
        },
      ],
      default: defaultChainId,
    },
  ]);
};

const validateAndSaveConfig = async (
  walletPath: string,
  chainId: typeof CHAINS.ARBITRUM | typeof CHAINS.ARBITRUM_SEPOLIA,
) => {
  const spinner = ora("Validating wallet...").start();

  try {
    await validateWalletPath(walletPath);
    spinner.succeed("Wallet secrets file is valid");

    await writeConfig({ walletPath, chainId });
    spinner.succeed("Configuration saved");
    return true;
  } catch (error) {
    spinner.fail(
      error instanceof ConfigError
        ? error.message
        : "Invalid wallet secrets file",
    );
    throw error;
  }
};

// Helper function for success hints
const printSuccessHints = (ctx: any, walletPath: string) => {
  return [
    "",
    chalk.green("✓") +
      ` Chain ID set to ${ctx.chainId} (${CHAINS.NAMES[ctx.chainId as keyof typeof CHAINS.NAMES]})`,
    chalk.green("✓") + ` Using wallet at ${walletPath}`,
    "",
    "Try these commands:",
    chalk.cyan(`  $ ${BINARY_NAME} ${WALLET_COMMAND}`),
    chalk.cyan(`  $ ${BINARY_NAME} ${ORDER_HISTORY_COMMAND}`),
    chalk.cyan(`  $ ${BINARY_NAME} ${TASK_HISTORY_COMMAND}`),
  ].join("\n");
};
