import type { Order, OrderMetadata, Wallet } from "@renegade-fi/node";
import { Token } from "@renegade-fi/node";
import chalk from "chalk";
import UI from "cliui";
import { formatUnits } from "viem";
import type { WalletField } from "../commands/wallet.js";

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

function formatState(state: OrderMetadata["state"]): string {
  switch (state) {
    case "Created":
      return chalk.green("OPEN");
    case "Matching":
      return chalk.green("MATCHING");
    case "SettlingMatch":
      return chalk.green("SETTLING");
    case "Filled":
      return chalk.green("FILLED");
    case "Cancelled":
      return chalk.red("CANCELLED");
    default:
      return chalk.gray(state.toUpperCase());
  }
}

function formatTime(timestamp: bigint): string {
  const date = new Date(Number(timestamp));
  return chalk.dim(
    date.toLocaleString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  );
}

function formatFees(balances: Wallet["balances"], walletId: string): string {
  // Calculate fees first
  const fees = balances
    .map((balance) => ({
      mint: balance.mint,
      totalFees: balance.relayer_fee_balance + balance.protocol_fee_balance,
    }))
    .filter((fee) => fee.totalFees > 0n);

  if (fees.length === 0) {
    return "No fees found";
  }

  const ui = UI({ width: 120, wrap: false });

  // Add title
  ui.div({
    text: chalk.bold("Fees"),
    padding: [1, 0, 1, 0],
  });

  // Add header
  ui.div(
    { text: chalk.bold("Amount"), width: 20, padding: [0, 2, 0, 0] },
    { text: chalk.bold("Asset"), width: 8, padding: [0, 0, 0, 0] },
  );

  // Add fee rows
  fees.forEach(({ mint, totalFees }) => {
    const token = Token.findByAddress(mint);
    ui.div(
      {
        text: formatAmount(totalFees, token),
        width: 20,
        padding: [0, 2, 0, 0],
      },
      { text: formatAsset(mint), width: 8, padding: [0, 0, 0, 0] },
    );
  });

  return ui.toString();
}

function formatFillProgress(percentage: number): string {
  // Create a simple progress bar with 10 characters
  const barSize = 10;
  const filledSize = Math.round((percentage / 100) * barSize);
  const emptySize = barSize - filledSize;

  // Use = for filled and space for empty
  const filled = "=".repeat(filledSize);
  const empty = " ".repeat(emptySize);

  return `[${filled}${empty}]`;
}

function calculateFillPercentage(metadata: OrderMetadata): {
  text: string;
  percentage: number;
} {
  // Sum up all fill amounts
  const totalFilled = metadata.fills.reduce(
    (sum, fill) => sum + fill.amount,
    0n,
  );

  // Calculate percentage
  if (metadata.data.amount === 0n)
    return { text: "  0% Filled", percentage: 0 };
  const percentage = Number((totalFilled * 100n) / metadata.data.amount);
  return {
    text: `${percentage.toString().padStart(3, " ")}% Filled`,
    percentage,
  };
}

export function formatWallet(
  wallet: Wallet,
  options: FormatOptions = {},
): string {
  const { field } = options;

  switch (field) {
    case "orders":
      return formatOrders(wallet.orders);
    case "balances":
      return formatBalances(wallet.balances);
    case "fees":
      return formatFees(wallet.balances, wallet.id);
    default: {
      const sections = [];
      // Add wallet ID section
      sections.push(chalk.bold("Wallet ID"));
      sections.push(wallet.id);
      sections.push("");
      sections.push(formatOrders(wallet.orders));
      sections.push("");
      sections.push(formatBalances(wallet.balances));
      return sections.join("\n");
    }
  }
}

export function formatOrders(orders: Order[]): string {
  if (orders.length === 0) {
    return "No orders found";
  }

  const ui = UI({ width: 120, wrap: false });

  // Add title
  ui.div({
    text: chalk.bold("Orders"),
    padding: [1, 0, 1, 0],
  });

  // Add order rows
  orders.forEach((order) => {
    const token = Token.findByAddress(order.base_mint);
    ui.div(
      {
        text: formatTime(BigInt(Date.now())),
        width: 25,
        padding: [0, 2, 0, 0],
      },
      {
        text: chalk.dim(order.id.toString()),
        width: 38,
        padding: [0, 2, 0, 0],
      },
      { text: formatSide(order.side), width: 6, padding: [0, 2, 0, 0] },
      {
        text: formatAmount(order.amount, token),
        width: 8,
        padding: [0, 0, 0, 0],
      },
      { text: formatAsset(order.base_mint), width: 8, padding: [0, 0, 0, 0] },
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

  // Add balance rows
  balances.forEach((balance) => {
    const token = Token.findByAddress(balance.mint);
    ui.div(
      {
        text: formatAmount(balance.amount, token),
        width: 8,
        padding: [0, 2, 0, 0],
      },
      { text: formatAsset(balance.mint), width: 8, padding: [0, 0, 0, 0] },
    );
  });

  // Add total
  ui.div({
    text: `Total balances: ${balances.length}`,
    padding: [1, 0, 0, 0],
  });

  return ui.toString();
}

export function formatOrderHistory(orders: OrderMetadata[]): string {
  if (orders.length === 0) {
    return "No orders found";
  }

  const ui = UI({ width: 120, wrap: false });

  // Add title
  ui.div({
    text: chalk.bold("Order History"),
    padding: [1, 0, 1, 0],
  });

  // Add order rows
  orders.forEach((metadata) => {
    const token = Token.findByAddress(metadata.data.base_mint);
    const { text: fillPercentage, percentage } =
      calculateFillPercentage(metadata);
    const progressBar = formatFillProgress(percentage);
    ui.div(
      { text: formatTime(metadata.created), width: 25, padding: [0, 2, 0, 0] },
      {
        text: chalk.dim(metadata.id.toString()),
        width: 38,
        padding: [0, 2, 0, 0],
      },
      { text: formatSide(metadata.data.side), width: 8, padding: [0, 2, 0, 0] },
      {
        text: formatAmount(metadata.data.amount, token),
        width: 8,
        padding: [0, 0, 0, 0],
      },
      {
        text: formatAsset(metadata.data.base_mint),
        width: 8,
        padding: [0, 2, 0, 0],
      },
      {
        text: `${progressBar} ${fillPercentage}`,
        width: 30,
        padding: [0, 2, 0, 0],
      },
      { text: formatState(metadata.state), width: 12, padding: [0, 0, 0, 0] },
    );
  });

  // Add total
  ui.div({
    text: `Showing ${orders.length} orders`,
    padding: [1, 0, 0, 0],
  });

  return ui.toString();
}
