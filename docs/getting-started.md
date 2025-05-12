# Getting Started with GhostZK

This guide will help you set up and run the GhostZK project on your local machine.

## Prerequisites

- Node.js (v16.0.0 or higher)
- npm (v7.0.0 or higher)
- Rust (for WASM compilation)
- wasm-pack (for building WebAssembly modules)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/ghostzk.git
cd ghostzk
```

2. Install dependencies:

```bash
npm install
```

3. Build all packages:

```bash
npm run build
```

## Project Structure

GhostZK is organized as a monorepo with the following package structure:

- `packages/proof-engine`: Zero-knowledge proof generation engine
- `packages/token-protocol`: Aleo-based token contract with staking
- `packages/relayer`: Meta-transaction relayer for gasless transactions
- `packages/bridge`: Bridge between Aleo and other networks
- `packages/wallet-extension`: Browser extension wallet
- `packages/wallet-mobile`: Mobile wallet application

## Configuration

Create a `.env` file in the project root with the following variables:

```
# Network configuration
ALEO_NETWORK=testnet3
ALEO_API_URL=https://api.explorer.aleo.org/v1

# Relayer configuration
RELAYER_PRIVATE_KEY=your_private_key_here
RELAYER_ADDRESS=your_address_here
MAX_GAS_SUBSIDY=1000000
```

Replace `your_private_key_here` and `your_address_here` with your Aleo account details.

## Running the Components

### Proof Engine Tests

```bash
cd packages/proof-engine
npm test
```

### Token Protocol

To test the token protocol:

```bash
cd packages/token-protocol
npm test
```

### Relayer Service

To start the relayer service:

```bash
cd packages/relayer
npm run dev
```

The relayer will be available at `http://localhost:3000`.

## Next Steps

- Check out the [Architecture Overview](./architecture.md) for a deeper understanding of the system
- See the [Development Guide](./development-guide.md) for details on contributing to the project
- Explore the [API Reference](./api/) for information on available endpoints and methods

## Troubleshooting

- If you encounter issues with WASM compilation, ensure you have the latest version of wasm-pack installed and that your Rust toolchain is up-to-date.
- For dependency issues, try clearing your npm cache with `npm cache clean --force` and reinstalling dependencies.
- Check the project's GitHub issues for known problems and solutions.
