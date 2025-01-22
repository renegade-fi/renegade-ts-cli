#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { cliOptions, loadConfigDefaults } from "./cli.js";
import { BINARY_NAME } from "./constants.js";
// Import commands
import * as config from "./commands/config.js";
import * as orderHistory from "./commands/order-history.js";
import * as setup from "./commands/setup.js";
import * as wallet from "./commands/wallet.js";
import * as taskHistory from "./commands/task-history.js";

// Handle Ctrl+C gracefully
process.on("SIGINT", () => {
  console.log("\nOperation cancelled");
  process.exit(0);
});

// Configure CLI
yargs(hideBin(process.argv))
  .scriptName(BINARY_NAME)
  .options(cliOptions)
  .middleware(loadConfigDefaults)
  .command(setup)
  .command(wallet)
  .command(orderHistory)
  .command(taskHistory)
  .command(config)
  .demandCommand(1, "You need to specify a command")
  .strict()
  .help().argv;
