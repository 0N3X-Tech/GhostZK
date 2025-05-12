# Relayer Service

The Relayer Service is a critical component of the GhostZK ecosystem, enabling gasless transactions by submitting transactions to the Aleo network on behalf of users.

## Overview

The Relayer Service acts as an intermediary between end users and the Aleo blockchain, allowing users to execute transactions without directly paying for gas fees. This improves user experience by removing the need for users to hold network tokens for transaction fees.

## Architecture

```
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│                  │      │                  │      │                  │
│    Client        │─────►│    Relayer       │─────►│    Aleo Network  │
│    Application   │      │    Service       │      │                  │
│                  │◄─────│                  │◄─────│                  │
└──────────────────┘      └──────────────────┘      └──────────────────┘
```

## Key Features

- **Meta-Transaction Support**: Process transactions signed by users but submitted by the relayer
- **Fee Subsidization**: Pay transaction fees on behalf of users
- **Transaction Monitoring**: Track transaction status and provide updates
- **Signature Verification**: Ensure only valid, authorized transactions are processed
- **Rate Limiting**: Prevent service abuse through configurable rate limits
- **Error Handling**: Robust error handling and reporting

## API Endpoints

### Submit Transaction

```
POST /api/v1/transactions
```

Request body:
```json
{
  "programId": "token.aleo",
  "functionName": "transfer_private",
  "inputs": ["10u64", "aleo1..."],
  "fee": 500000,
  "senderAddress": "aleo1..."
}
```

Response:
```json
{
  "id": "tx_1234567890",
  "status": "pending",
  "timestamp": 1650000000000
}
```

### Submit Meta-Transaction

```
POST /api/v1/meta-transactions
```

Request body:
```json
{
  "programId": "token.aleo",
  "functionName": "transfer_private",
  "inputs": ["10u64", "aleo1..."],
  "signature": "sign1...",
  "senderAddress": "aleo1..."
}
```

Response:
```json
{
  "id": "tx_1234567890",
  "status": "pending",
  "timestamp": 1650000000000
}
```

### Get Transaction Status

```
GET /api/v1/transactions/:txId
```

Response:
```json
{
  "id": "tx_1234567890",
  "status": "confirmed",
  "blockHeight": 1000000,
  "timestamp": 1650000000000
}
```

## Implementation Details

### Meta-Transaction Flow

1. **Client-Side Signing**: User signs transaction data with their private key
2. **Submission**: Signed transaction is sent to the relayer
3. **Verification**: Relayer verifies the signature
4. **Fee Calculation**: Relayer determines appropriate fee
5. **Submission**: Relayer submits transaction to Aleo network
6. **Monitoring**: Relayer monitors transaction status
7. **Status Update**: Client can query for transaction status

### Fee Management

The relayer uses a dynamic fee calculation system to determine appropriate fees based on:

- Transaction complexity
- Network congestion
- Subsidy policy

The maximum fee subsidy is configurable via the `MAX_GAS_SUBSIDY` environment variable.

### Signature Verification

To ensure security, the relayer verifies that transaction signatures match the claimed sender address:

```typescript
// Example signature verification (simplified)
const isValid = await Account.verifySignature(
  senderAddress,
  signature,
  messageToSign
);

if (!isValid) {
  throw new Error('Invalid signature');
}
```

### Transaction Monitoring

The relayer continuously monitors submitted transactions until they are confirmed:

```typescript
// Example monitoring code (simplified)
async monitorTransaction(txId: string): Promise<void> {
  const MAX_ATTEMPTS = 20;
  const POLLING_INTERVAL = 15000; // 15 seconds
  
  let attempts = 0;
  
  const checkTransaction = async () => {
    const txStatus = await this.network.getTransaction(txId);
    
    if (txStatus && txStatus.finalized) {
      // Transaction confirmed
      return;
    }
    
    // Schedule next check if not exceeded max attempts
    if (++attempts < MAX_ATTEMPTS) {
      setTimeout(checkTransaction, POLLING_INTERVAL);
    }
  };
  
  setTimeout(checkTransaction, POLLING_INTERVAL);
}
```

## Configuration

The relayer service can be configured using environment variables:

```
# Network configuration
ALEO_NETWORK=testnet3
ALEO_API_URL=https://api.explorer.aleo.org/v1

# Relayer account
RELAYER_PRIVATE_KEY=your_private_key_here
RELAYER_ADDRESS=your_address_here

# Fee settings
MAX_GAS_SUBSIDY=1000000

# Server settings
PORT=3000
NODE_ENV=production
```

## Security Considerations

- **Private Key Security**: Relayer private keys must be securely stored
- **Signature Verification**: Always verify signatures before submitting transactions
- **Rate Limiting**: Implement rate limits to prevent service abuse
- **Fee Caps**: Set maximum fee subsidies to prevent excessive costs
- **Error Handling**: Properly handle network errors and retries
- **Monitoring**: Monitor relayer balance to ensure sufficient funds

## Deployment

The relayer service can be deployed using Docker:

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

## Scaling Considerations

For high-volume applications, consider:

1. **Load Balancing**: Deploy multiple relayer instances behind a load balancer
2. **Database Persistence**: Store transaction status in a database for reliability
3. **Monitoring**: Implement detailed metrics and alerting
4. **Key Rotation**: Regularly rotate relayer keys for security
5. **Fund Management**: Automated systems to refill relayer accounts

## Testing

The relayer includes comprehensive tests:

```bash
cd packages/relayer
npm test
```

## Integration Points

- **Proof Engine**: Verifies proofs for transactions
- **Token Protocol**: Executes token operations
- **Wallet UI**: Submits transactions to the relayer
