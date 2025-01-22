import chalk from "chalk";
import UI from "cliui";
import { formatUnits } from "viem";
import { Token } from "@renegade-fi/node";
import type { Wallet, Order } from "@renegade-fi/node";
import type { WalletField } from "../commands/cli";

interface FormatOptions {
  field?: WalletField;
}

// Helper functions for formatting
function formatSide(side: "Buy" | "Sell"): string {
  return side === "Buy" ? chalk.green("BUY") : chalk.red("SELL");
}

function formatExternal(allowExternal: boolean): string {
  return allowExternal ? chalk.green("Yes") : chalk.red("No");
}

function formatAmount(amount: bigint, token: Token): string {
  return formatUnits(amount, token.decimals);
}

function formatAsset(mint: `0x${string}`): string {
  const token = Token.findByAddress(mint);
  return token.ticker;
}

export function formatWallet(
  wallet: Wallet,
  options: FormatOptions = {},
): string {
  const sections: string[] = [];

  // If no specific field is requested, show everything
  if (!options.field) {
    if (wallet.orders.length > 0) sections.push(formatOrders(wallet.orders));
    if (wallet.balances.length > 0)
      sections.push(formatBalances(wallet.balances));
    return sections.join("\n\n");
  }

  // Show only requested field
  switch (options.field) {
    case "orders":
      return formatOrders(wallet.orders);
    case "balances":
      return formatBalances(wallet.balances);
    default:
      return "No data to display";
  }
}

function formatOrders(orders: Order[]): string {
  if (orders.length === 0) {
    return "No orders found";
  }

  const ui = UI({ width: 120, wrap: false });

  // Add title
  ui.div({
    text: chalk.bold("Orders"),
    padding: [1, 0, 1, 0],
  });

  // Add header row
  ui.div(
    { text: "ID", width: 40, align: "left", padding: [0, 1, 0, 0] },
    { text: "Side", width: 6, align: "left", padding: [0, 1, 0, 0] },
    { text: "Asset", width: 8, align: "left", padding: [0, 1, 0, 0] },
    { text: "Amount", width: 12, align: "right", padding: [0, 1, 0, 0] },
    { text: "External", width: 8, align: "left", padding: [0, 1, 0, 0] },
  );

  // Add separator
  ui.div({ text: "━".repeat(80), padding: [0, 0, 1, 0] });

  // Add order rows
  orders.forEach((order) => {
    const token = Token.findByAddress(order.base_mint);
    ui.div(
      {
        text: order.id.toString(),
        width: 40,
        align: "left",
        padding: [0, 1, 0, 0],
      },
      {
        text: formatSide(order.side),
        width: 6,
        align: "left",
        padding: [0, 1, 0, 0],
      },
      {
        text: formatAsset(order.base_mint),
        width: 8,
        align: "left",
        padding: [0, 1, 0, 0],
      },
      {
        text: formatAmount(order.amount, token),
        width: 12,
        align: "right",
        padding: [0, 1, 0, 0],
      },
      {
        text: formatExternal(order.allow_external_matches),
        width: 8,
        align: "left",
        padding: [0, 1, 0, 0],
      },
    );
  });

  // Add total
  ui.div({
    text: `Total orders: ${orders.length}`,
    padding: [1, 0, 0, 0],
  });

  return ui.toString();
}

function formatBalances(balances: Wallet["balances"]): string {
  if (balances.length === 0) {
    return "No balances found";
  }

  const ui = UI({ width: 120, wrap: false });

  // Add title
  ui.div({
    text: chalk.bold("Balances"),
    padding: [1, 0, 1, 0],
  });

  // Add header row
  ui.div(
    { text: "Asset", width: 8, align: "left", padding: [0, 1, 0, 0] },
    { text: "Amount", width: 15, align: "right", padding: [0, 1, 0, 0] },
  );

  // Add separator
  ui.div({ text: "━".repeat(30), padding: [0, 0, 1, 0] });

  // Add balance rows
  balances.forEach((balance) => {
    const token = Token.findByAddress(balance.mint);
    ui.div(
      {
        text: formatAsset(balance.mint),
        width: 8,
        align: "left",
        padding: [0, 1, 0, 0],
      },
      {
        text: formatAmount(balance.amount, token),
        width: 15,
        align: "right",
        padding: [0, 1, 0, 0],
      },
    );
  });

  // Add total
  ui.div({
    text: `Total tokens: ${balances.length}`,
    padding: [1, 0, 0, 0],
  });

  return ui.toString();
}
