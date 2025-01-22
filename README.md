# Renegade CLI

A command-line interface tool for viewing and querying the Renegade protocol.

## Installation

```bash
# Install globally using npm (or your preferred package manager)
npm install -g @renegade-fi/cli
# or
yarn global add @renegade-fi/cli
# or
pnpm add -g @renegade-fi/cli
# or
bun install -g @renegade-fi/cli
```

## Getting Started

### 1. Prepare Your Wallet File
You'll need a wallet secrets file (JSON format) that looks like this:

```json
{
  "wallet_id": "****-****-****-****",
  "blinder_seed": "0x***",
  "share_seed": "0x***",
  "symmetric_key": "0x***",
  "sk_match": "0x***"
}
```

To generate this file, follow the instructions at: https://docs.renegade.fi/technical-reference/typescript-sdk#generating-wallet-secrets

Note: This wallet file only enables read operations (like viewing balances and orders).

### 2. Configure the CLI
Run the setup command to configure your environment:
```bash
renegade setup
```

The setup will prompt you for:
- Path to your wallet secrets file
- Chain selection:
  - Arbitrum One (42161)
  - Arbitrum Sepolia (421614)

You can later view or modify these settings using:
```bash
# View current configuration
renegade config

# Reset configuration and run setup again
renegade config reset
```

You can also temporarily override the configured settings for any command:
```bash
# Use a different wallet file
renegade wallet --wallet-path=/path/to/other/wallet.json

# Use a different chain
renegade wallet --chain-id=421614
```

## Available Commands

### Setup
Configure your environment settings:
```bash
renegade setup
```

### Config
View and reset CLI configuration:
```bash
# View current configuration
renegade config

# Reset configuration
renegade config reset
```

### Wallet
View wallet status and balance. By default shows all wallet information.

```bash
# View all wallet information
renegade wallet

# View only open orders
renegade wallet --field=orders

# View only token balances
renegade wallet --field=balances

# View only fee balances
renegade wallet --field=fees

# Include default/zero values in output
renegade wallet --no-filter
```

### Order History
View detailed order history including fill percentages and execution details. Use this command for a more comprehensive view of your orders compared to the basic order list in the wallet command.

```bash
# View last 10 orders
renegade order-history

# View specific number of orders
renegade order-history --limit 20
```

### Task History
View your task history. By default shows last 10 tasks.

```bash
# View last 10 tasks
renegade task-history

# View specific number of tasks
renegade task-history --limit 20
```