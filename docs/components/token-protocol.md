# Token Protocol

The Token Protocol is a core component of the GhostZK ecosystem, implementing a privacy-preserving token with staking functionality on the Aleo platform.

## Overview

The Token Protocol is implemented in Leo, Aleo's domain-specific language for confidential applications. It provides a feature-rich token with both public and private transfer capabilities, as well as staking mechanics for token holders.

## Key Features

- **Private & Public Transfers**: Support for both private (record-based) and public (mapping-based) token transfers
- **Staking Mechanism**: Stake tokens to earn rewards
- **Shield/Unshield**: Convert between private and public token representations
- **Minting & Burning**: Create new tokens or remove existing ones from circulation
- **Reward System**: Dynamic reward calculation based on staking duration

## Contract Structure

### Records

```leo
record Token {
    // The token owner
    owner: address,
    // The token amount
    amount: u64,
    // Optional encrypted metadata field
    metadata: field,
}
```

### Mappings

```leo
// Public token balances
mapping balances: address => u64;

// Staking-related mappings
mapping staked_balances: address => u64;
mapping stake_start_times: address => u64;
mapping reward_rates: field => u64;
mapping total_staked: field => u64;

// Total token supply
mapping total_supply: field => u64;

// Initialization check
mapping initialized: field => bool;
```

### Constants

```leo
// Token symbol and metadata
const TOKEN_SYMBOL: field = 1field;
const DECIMALS: u8 = 8u8;
```

## Core Functionalities

### Token Management

- **Initialize**: Set up the token contract with initial supply
- **Mint**: Create new tokens (public or private)
- **Burn**: Remove tokens from circulation (public or private)
- **Transfer**: Move tokens between addresses (public or private)
- **Shield/Unshield**: Convert between public and private tokens

### Staking

- **Stake Tokens**: Lock tokens to earn rewards
- **Unstake Tokens**: Withdraw staked tokens and claim rewards
- **Set Reward Rate**: Configure the reward distribution rate
- **Calculate Rewards**: Determine rewards based on staking duration

## Implementation Details

### Transitions

#### Staking Functionality

```leo
// Stake tokens publicly
transition stake_tokens(public amount: u64) {
    // Get caller's address
    let caller: address = self.caller;
    
    // Retrieve current balance
    let caller_balance: u64 = Mapping::get(balances, caller);
    
    // Ensure caller has sufficient balance
    assert(caller_balance >= amount);
    
    // Get current time (in blocks)
    let current_block: u64 = block.height;
    
    // Update public balance
    Mapping::set(balances, caller, caller_balance - amount);
    
    // Update staked balance
    let current_staked: u64 = Mapping::get_or_use(staked_balances, caller, 0u64);
    Mapping::set(staked_balances, caller, current_staked + amount);
    
    // Record stake start time
    Mapping::set(stake_start_times, caller, current_block);
    
    // Update total staked amount
    let total: u64 = Mapping::get_or_use(total_staked, TOKEN_SYMBOL, 0u64);
    Mapping::set(total_staked, TOKEN_SYMBOL, total + amount);
}
```

#### Reward Calculation

```leo
// Calculate rewards for staking
function calculate_rewards(staker: address, amount: u64) -> u64 {
    // Get staking start time
    let start_block: u64 = Mapping::get_or_use(stake_start_times, staker, 0u64);
    
    // Get current block height
    let current_block: u64 = block.height;
    
    // Calculate staking duration in blocks
    let duration: u64 = current_block - start_block;
    
    // Get reward rate (rewards per block per token)
    let rate: u64 = Mapping::get_or_use(reward_rates, TOKEN_SYMBOL, 1u64);
    
    // Calculate rewards: amount * duration * rate / 10000
    let rewards: u64 = amount * duration * rate / 10000u64;
    
    return rewards;
}
```

## Usage Examples

### Initialize Token

```leo
// Example deployment command
leo run initialize 1000000u64
```

### Minting Tokens

```leo
// Public minting
leo run mint_public aleo1abc... 1000u64

// Private minting
leo run mint_private aleo1abc... 1000u64
```

### Public Transfers

```leo
// Sender executes
leo run transfer_public aleo1xyz... 500u64
```

### Private Transfers

```leo
// Sender executes with their token record
leo run transfer_private "{owner: aleo1abc..., amount: 1000u64, metadata: 1field}" aleo1xyz... 500u64
```

### Staking

```leo
// Stake tokens
leo run stake_tokens 500u64

// Unstake tokens and claim rewards
leo run unstake_tokens 500u64
```

## Security Considerations

- Token amounts are checked to prevent underflow/overflow attacks
- Staking requires sufficient balance checks
- Reward calculation protects against timing attacks
- Public functions use appropriate access control

## Testing

The Token Protocol includes a comprehensive test suite that verifies all functionality:

```bash
cd packages/token-protocol
npm test
```

## Deployment

The Token Protocol can be deployed to the Aleo testnet or mainnet using the following steps:

1. Build the program: `leo build`
2. Deploy with Aleo CLI: `aleo deploy token.aleo --private-key <YOUR_PRIVATE_KEY> --fee 1000000`

## Integration Points

- **Proof Engine**: Generates proofs for token operations
- **Relayer**: Submits token transactions to the network
- **Wallet UI**: Provides interface for token management and staking
