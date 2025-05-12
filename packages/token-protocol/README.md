# GhostZK Token Protocol

A privacy-preserving token protocol built on Aleo using Leo programming language.

## Overview

The GhostZK Token Protocol enables private transactions on the Aleo blockchain. It leverages zero-knowledge proofs to ensure user privacy while maintaining the security and integrity of the blockchain.

Key features:
- **Dual-mode operation**: Supports both public and private token transactions
- **Shielded transfers**: Fully private token transfers that conceal transaction amounts and participants
- **Conversion operations**: Shield (public → private) and unshield (private → public) functionality
- **Metadata support**: Optional encrypted metadata field for extended functionality

## Contract Structure

The token protocol implements the following components:

- **Token Record**: Represents ownership of tokens in a private context
- **Public Balances**: Mapping of addresses to token amounts for public tokens
- **Supply Management**: Functions to track and modify the total token supply

## Functions

### Public Operations

- `initialize(initial_supply)`: Initialize the token contract with initial supply
- `mint_public(receiver, amount)`: Mint public tokens to a recipient
- `transfer_public(receiver, amount)`: Transfer public tokens to another address
- `burn_public(amount)`: Burn public tokens

### Private Operations

- `mint_private(receiver, amount)`: Mint private tokens to a recipient
- `transfer_private(token, receiver, amount)`: Transfer private tokens
- `burn_private(token, amount)`: Burn private tokens

### Conversion Operations

- `shield(amount)`: Convert public tokens to private tokens
- `unshield(token, amount)`: Convert private tokens to public tokens

### View Functions

- `get_public_balance(address)`: Get the public balance of an address
- `get_total_supply()`: Get the total supply of tokens

## Development Setup

### Prerequisites

- Install the Leo programming language:
  ```bash
  curl -L https://get.leo-lang.org | sh
  ```

### Build and Test

To build the token protocol:

```bash
cd packages/token-protocol
leo build
```

To run tests:

```bash
leo test
```

## Usage Examples

### Initializing the Token

```bash
leo run initialize 1000000u64
```

### Creating a Private Token Transfer

```bash
# Example of transferring 100 tokens privately
leo run transfer_private "{owner: aleo1xxx...token_data}" aleo1yyy... 100u64
```

## Privacy Considerations

- Private transactions use zero-knowledge proofs to conceal transaction details
- Token amounts and participant addresses are hidden in private transfers
- Shielded operations provide a privacy layer similar to zCash's shielded pools

## Advanced Features

- **Metadata field**: Can be used for token identification or additional encrypted data
- **Multi-Asset Support**: Enables the protocol to be extended for multiple token types

## License

MIT