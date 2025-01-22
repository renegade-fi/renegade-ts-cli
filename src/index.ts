#!/usr/bin/env bun
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { CLI } from "./constants";
import { cliOptions } from "./commands/cli";

// Import commands
import * as setup from "./commands/setup";
import * as walletState from "./commands/read-wallet";

// Handle Ctrl+C gracefully
process.on("SIGINT", () => {
  console.log("\nOperation cancelled");
  process.exit(0);
});

// Configure CLI
yargs(hideBin(process.argv))
  .scriptName(CLI.NAME)
  .options(cliOptions)
  .command(setup)
  .command(walletState)
  .demandCommand(1, "You need to specify a command")
  .strict()
  .help().argv;
