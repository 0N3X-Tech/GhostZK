# GhostZK API Reference

This API reference provides detailed documentation for integrating with the GhostZK platform components.

## Contents

- [Proof Engine API](./proof-engine.md)
- [Relayer API](./relayer.md)
- [Token Protocol API](./token-protocol.md)

## Overview

GhostZK provides several APIs for developers to interact with:

1. **JavaScript/TypeScript Libraries**: Client-side libraries for proof generation and verification
2. **REST APIs**: HTTP endpoints for transaction submission and status checking
3. **Leo Program Interface**: Methods for interacting with the token protocol on the Aleo network

## Getting Started

To integrate with GhostZK, follow these general steps:

1. **Install Dependencies**:
   ```bash
   npm install @ghostzk/proof-engine @ghostzk/client
   ```

2. **Initialize Components**:
   ```typescript
   import { ProofEngine } from '@ghostzk/proof-engine';
   import { GhostZKClient } from '@ghostzk/client';

   // Initialize the proof engine
   const proofEngine = new ProofEngine();
   await proofEngine.initialize();

   // Initialize the client with a relayer endpoint
   const client = new GhostZKClient({
     relayerUrl: 'https://relayer.ghostzk.com/api/v1'
   });
   ```

3. **Perform Operations**:
   ```typescript
   // Generate a proof
   const proof = await proofEngine.generateProof({
     programId: 'token.aleo',
     functionName: 'transfer_private',
     inputs: ['10u64', 'aleo1abc...']
   });

   // Submit a transaction via the relayer
   const txResult = await client.submitTransaction({
     programId: 'token.aleo',
     functionName: 'transfer_private',
     inputs: ['10u64', 'aleo1abc...'],
     proof: proof
   });
   ```

## API Versioning

All APIs use semantic versioning:

- **REST APIs**: Version is included in the URL path (e.g., `/api/v1/transactions`)
- **JavaScript Libraries**: Version is managed through npm package versioning

Breaking changes will only be introduced in major version updates.

## Authentication

Different components have different authentication requirements:

- **Proof Engine**: No authentication required (client-side library)
- **Relayer API**: May require API keys for rate-limited endpoints
- **Aleo Network**: Requires cryptographic signatures for transactions

## Rate Limiting

The relayer service implements rate limiting to prevent abuse:

- Standard tier: 100 requests per minute
- Premium tier: 500 requests per minute

When rate limits are exceeded, the API will return a 429 (Too Many Requests) status code.

## Error Handling

All APIs follow consistent error handling patterns:

### REST API Errors

```json
{
  "error": {
    "code": "invalid_signature",
    "message": "The provided signature is invalid",
    "details": {
      "address": "aleo1abc..."
    }
  }
}
```

### Library Errors

```typescript
try {
  await proofEngine.generateProof(input);
} catch (error) {
  if (error instanceof ProofError) {
    console.error(`Code: ${error.code}, Message: ${error.message}`);
  }
}
```

## Common Error Codes

| Code | Description |
|------|-------------|
| `invalid_input` | The provided input is invalid |
| `invalid_signature` | The cryptographic signature is invalid |
| `insufficient_balance` | The account has insufficient balance |
| `transaction_failed` | The transaction execution failed |
| `proof_generation_failed` | Proof generation failed |
| `network_error` | Error communicating with the Aleo network |

## Cross-Origin Resource Sharing (CORS)

The relayer API supports CORS for browser-based applications. The following headers are included in API responses:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## Documentation Conventions

Throughout the API documentation, we use the following conventions:

- `{parameter}`: Required parameter
- `[parameter]`: Optional parameter
- `Type`: Data type (e.g., `string`, `number`, `boolean`)

## API Status

Check the current API status and any known issues at:
https://status.ghostzk.com
