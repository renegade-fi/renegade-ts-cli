#!/usr/bin/env bun
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { cliOptions, loadConfigDefaults } from "./cli";
import { BINARY_NAME } from "./constants";
// Import commands
import * as config from "./commands/config";
import * as orderHistory from "./commands/order-history";
import * as setup from "./commands/setup";
import * as wallet from "./commands/wallet";
import * as taskHistory from "./commands/task-history";
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
