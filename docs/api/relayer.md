# Relayer API Reference

The Relayer API enables client applications to submit transactions to the Aleo network without directly handling transaction fees.

## Base URL

```
https://relayer.ghostzk.com/api/v1
```

For local development:

```
http://localhost:3000/api/v1
```

## Authentication

Most endpoints do not require authentication. For rate-limited endpoints, API keys may be used:

```
Authorization: Bearer your-api-key
```

## Endpoints

### Submit Transaction

Submit a regular transaction to the Aleo network.

```
POST /transactions
```

#### Request Body

| Parameter | Type | Description |
|-----------|------|-------------|
| programId | string | The Aleo program ID |
| functionName | string | The function name to execute |
| inputs | array | Array of function inputs as strings |
| fee | number | Transaction fee in microcredits |
| senderAddress | string | The sender's Aleo address |

Example request:

```json
{
  "programId": "token.aleo",
  "functionName": "transfer_private",
  "inputs": ["10u64", "aleo1abc..."],
  "fee": 500000,
  "senderAddress": "aleo1xyz..."
}
```

#### Response

| Status Code | Description |
|-------------|-------------|
| 200 | Transaction submitted successfully |
| 400 | Invalid request parameters |
| 500 | Server error |

Example response:

```json
{
  "id": "tx_1234567890abcdef",
  "status": "pending",
  "timestamp": 1650000000000
}
```

### Submit Meta-Transaction

Submit a transaction that will be paid for by the relayer (gasless transaction).

```
POST /meta-transactions
```

#### Request Body

| Parameter | Type | Description |
|-----------|------|-------------|
| programId | string | The Aleo program ID |
| functionName | string | The function name to execute |
| inputs | array | Array of function inputs as strings |
| signature | string | Cryptographic signature of the transaction data |
| senderAddress | string | The sender's Aleo address |

Example request:

```json
{
  "programId": "token.aleo",
  "functionName": "transfer_private",
  "inputs": ["10u64", "aleo1abc..."],
  "signature": "sign1...",
  "senderAddress": "aleo1xyz..."
}
```

#### Response

| Status Code | Description |
|-------------|-------------|
| 200 | Transaction submitted successfully |
| 400 | Invalid request parameters or signature |
| 500 | Server error |

Example response:

```json
{
  "id": "tx_1234567890abcdef",
  "status": "pending",
  "timestamp": 1650000000000
}
```

### Get Transaction Status

Check the status of a previously submitted transaction.

```
GET /transactions/:txId
```

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| txId | string | The transaction ID |

#### Response

| Status Code | Description |
|-------------|-------------|
| 200 | Transaction found |
| 404 | Transaction not found |
| 500 | Server error |

Example response:

```json
{
  "id": "tx_1234567890abcdef",
  "status": "confirmed",
  "blockHeight": 1000000,
  "timestamp": 1650000000000
}
```

## Status Codes

The relayer API uses standard HTTP status codes:

| Status Code | Description |
|-------------|-------------|
| 200 | OK - The request succeeded |
| 400 | Bad Request - The request is invalid |
| 401 | Unauthorized - Authentication failed |
| 403 | Forbidden - You don't have permission |
| 404 | Not Found - The resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Something went wrong |

## Error Responses

Error responses follow a standard format:

```json
{
  "error": {
    "code": "error_code",
    "message": "Human-readable error message",
    "details": {
      "property1": "additional detail",
      "property2": "more information"
    }
  }
}
```

## Common Error Codes

| Code | Description |
|------|-------------|
| `invalid_input` | The provided input is invalid |
| `invalid_signature` | The cryptographic signature is invalid |
| `insufficient_balance` | The relayer has insufficient balance |
| `transaction_failed` | The transaction execution failed |
| `network_error` | Error communicating with the Aleo network |
| `rate_limit_exceeded` | API rate limit exceeded |

## Signature Generation

For meta-transactions, clients must sign the transaction data. Generate the signature as follows:

1. Concatenate the transaction data:
   ```
   programId.functionName(input1,input2,...)
   ```

2. Sign the data using the Aleo SDK:
   ```typescript
   import { Account } from '@aleohq/sdk';

   const account = Account.fromPrivateKey(privateKey);
   const messageToSign = `${programId}.${functionName}(${inputs.join(',')})`;
   const signature = account.sign(messageToSign);
   ```

3. Include the signature in the request.

## Rate Limits

| Tier | Rate Limit |
|------|------------|
| Standard | 100 requests/minute |
| Premium | 500 requests/minute |

When rate limits are exceeded, the API returns a 429 status code with a `Retry-After` header indicating when to retry.

## Webhook Notifications

For transaction status updates, you can register a webhook:

```
POST /webhooks
```

Request body:

```json
{
  "url": "https://your-server.com/webhook",
  "events": ["transaction.confirmed", "transaction.failed"],
  "secret": "your-webhook-secret"
}
```

The relayer will send POST requests to your URL when events occur:

```json
{
  "event": "transaction.confirmed",
  "data": {
    "id": "tx_1234567890abcdef",
    "status": "confirmed",
    "blockHeight": 1000000,
    "timestamp": 1650000000000
  },
  "timestamp": 1650000010000,
  "signature": "hmac-sha256-signature"
}
```

Verify the webhook signature to ensure it's from the relayer:

```typescript
const isValid = verifyHmacSignature(
  requestBody,
  signature,
  webhookSecret
);
```

## Example: Submit a Meta-Transaction

```typescript
// Client-side code
import { Account } from '@aleohq/sdk';

async function submitMetaTransaction() {
  // Transaction details
  const programId = 'token.aleo';
  const functionName = 'transfer_private';
  const inputs = ['10u64', 'aleo1abc...'];
  const privateKey = 'APrivateKey1...';
  
  // Create account from private key
  const account = Account.fromPrivateKey(privateKey);
  const senderAddress = account.address();
  
  // Generate message to sign
  const messageToSign = `${programId}.${functionName}(${inputs.join(',')})`;
  
  // Sign the message
  const signature = account.sign(messageToSign);
  
  // Prepare request data
  const requestData = {
    programId,
    functionName,
    inputs,
    signature,
    senderAddress
  };
  
  // Submit to relayer
  const response = await fetch('https://relayer.ghostzk.com/api/v1/meta-transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestData)
  });
  
  const result = await response.json();
  console.log('Transaction submitted:', result);
  
  // Check status later
  const statusResponse = await fetch(`https://relayer.ghostzk.com/api/v1/transactions/${result.id}`);
  const status = await statusResponse.json();
  console.log('Transaction status:', status);
}
```

## Client Libraries

For easier integration, use the GhostZK client libraries:

```typescript
import { GhostZKClient } from '@ghostzk/client';

// Initialize client
const client = new GhostZKClient({
  relayerUrl: 'https://relayer.ghostzk.com/api/v1'
});

// Submit meta-transaction
const result = await client.submitMetaTransaction({
  programId: 'token.aleo',
  functionName: 'transfer_private',
  inputs: ['10u64', 'aleo1abc...'],
  privateKey: 'APrivateKey1...'
});

// Check status
const status = await client.getTransactionStatus(result.id);
```
