# GhostZK

A privacy-preserving wallet and token protocol built on the Aleo blockchain.

![GhostZK Logo](docs/images/logo.png)

## Overview

GhostZK is a suite of privacy-focused tools and protocols for the Aleo blockchain, enabling users to maintain financial privacy while benefiting from blockchain transparency and security. Built around zero-knowledge proofs, GhostZK provides a complete solution for creating, managing, and transacting with privacy-preserving assets.

## Key Features

- **Privacy-First Design**: Zero-knowledge proof technology protects transaction details while ensuring validity
- **Multi-Platform Wallet**: Browser extension and mobile applications for seamless access
- **Private & Public Operations**: Support for both shielded and transparent transactions
- **Meta-Transactions**: Gas-free transactions via relayer network
- **Cross-Chain Bridge**: Interoperability with Ethereum and other major blockchains
- **On-Device Proof Generation**: WebAssembly-based local proof generation for enhanced privacy

## Repository Structure

```
ghostzk/
├── packages/
│   ├── wallet-extension/     # Browser extension wallet
│   ├── wallet-mobile/        # Mobile wallet applications
│   ├── proof-engine/         # WASM-based proof generation
│   ├── token-protocol/       # Leo smart contracts
│   ├── relayer/              # Gas-free transaction service
│   └── bridge/               # Cross-chain interoperability
├── docs/                     # Documentation
└── scripts/                  # Build and deployment tools
```

## Getting Started

### Prerequisites

- Node.js 16+
- Rust (for WASM compilation)
- Leo language (`curl -L https://get.leo-lang.org | sh`)

### Setup Development Environment

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/ghostzk.git
   cd ghostzk
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Build all packages
   ```bash
   npm run build
   ```

### Using the Browser Extension (Development)

1. Build the extension
   ```bash
   cd packages/wallet-extension
   npm run build:extension
   ```

2. Load the unpacked extension in Chrome/Firefox from the `dist` directory

## Development Roadmap

### Phase 1: Foundation (Current)
- Core token protocol implementation
- Proof engine integration
- Wallet extension skeleton

### Phase 2: Core Functionality
- Key management & account creation
- Token operations (mint, transfer, burn)
- Basic UI/UX implementation
- Pre-Sale Starts

### Phase 3: Advanced Features
- Relayer service for gas-free transactions
- Mobile application development
- Cross-chain bridge integration

### Phase 4: Mainnet Release
- Security audits
- Performance optimizations
- Public beta testing

## Privacy Techniques

GhostZK employs several advanced privacy techniques:

- **Zero-Knowledge Proofs**: Validate transactions without revealing their contents
- **Shielded Transactions**: Hide sender, receiver, and amount information
- **Nullifiers**: Prevent double-spending without revealing transaction history
- **Pedersen Commitments**: Conceal transaction values while ensuring balance conservation
- **Optional Disclosure**: Selective revelation of transaction details for compliance needs

## Contributing

We welcome contributions to GhostZK! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## Security

Security is our highest priority. If you discover a security vulnerability, please send an email to hello@onex.technology. Please do not create public GitHub issues for security vulnerabilities.

## License

GhostZK is released under the [MIT License](LICENSE).
