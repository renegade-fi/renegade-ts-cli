import { getOrderHistory } from "@renegade-fi/node";
import type { Arguments, CommandBuilder } from "yargs";
import ora from "ora";
import type { Cli } from "../cli";
import { ORDER_HISTORY_COMMAND } from "../constants.js";
import { handleSdkError } from "../errors.js";
import { formatError } from "../formatters/error.js";
import { formatOrderHistory } from "../formatters/wallet.js";
import { createContext } from "./context.js";

export interface OrderHistoryArgs extends Cli {
  limit?: number;
}

export const command = ORDER_HISTORY_COMMAND;
export const desc = "Display order history";

export const builder: CommandBuilder<{}, OrderHistoryArgs> = {
  limit: {
    type: "number",
    description: "Maximum number of orders to display",
    default: 10,
  },
};

export const handler = async (argv: Arguments<OrderHistoryArgs>) => {
  const spinner = ora("Fetching order history from relayer");
  try {
    const ctx = await createContext(argv);
    spinner.start();
    const orderMap = await getOrderHistory(ctx.config, {
      limit: argv.limit,
    }).catch((error) => {
      throw handleSdkError(error);
    });

    spinner.succeed("Fetched order history from relayer");
    console.log("");

    if (!orderMap) {
      console.log("No orders found in history");
      return;
    }

    // Convert map values to array and format
    const orders = Array.from(orderMap.values());
    console.log(formatOrderHistory(orders));
  } catch (error) {
    spinner.fail();
    console.error(formatError(error as Error));
    process.exit(1);
  }
};
