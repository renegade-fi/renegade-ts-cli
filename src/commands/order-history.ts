import { getOrderHistory } from "@renegade-fi/node";
import type { Arguments, CommandBuilder } from "yargs";
import type { Cli } from "../cli";
import { ORDER_HISTORY_COMMAND } from "../constants";
import { handleSdkError } from "../errors";
import { formatError } from "../formatters/error";
import { formatOrderHistory } from "../formatters/wallet";
import { createContext } from "./context";

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
  try {
    const ctx = await createContext(argv);
    const orderMap = await getOrderHistory(ctx.config, {
      limit: argv.limit,
    }).catch((error) => {
      throw handleSdkError(error);
    });

    if (!orderMap) {
      console.log("No orders found in history");
      return;
    }

    // Convert map values to array and format
    const orders = Array.from(orderMap.values());
    console.log(formatOrderHistory(orders));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
};
