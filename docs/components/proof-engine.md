# Proof Engine

The Proof Engine is a core component of the GhostZK ecosystem, responsible for generating and verifying zero-knowledge proofs for Aleo transactions.

## Overview

The Proof Engine provides WebAssembly (WASM) bindings to Aleo's snarkVM, enabling clients to generate proofs directly in the browser or mobile applications. This eliminates the need for a trusted server to handle sensitive transaction data.

## Architecture

```
┌────────────────────────────────────────────┐
│                Proof Engine                 │
│                                            │
│  ┌──────────────┐        ┌──────────────┐  │
│  │    TypeScript│        │    WASM      │  │
│  │    Interface │◄──────►│    Module    │  │
│  └──────────────┘        └──────────────┘  │
│          ▲                      ▲          │
└──────────┼──────────────────────┼──────────┘
           │                      │
           ▼                      ▼
┌──────────────────┐    ┌──────────────────┐
│  Client           │    │   Aleo Network   │
│  Applications     │    │                  │
└──────────────────┘    └──────────────────┘
```

## Key Features

- **Zero-Knowledge Proof Generation**: Create proofs for private transactions
- **Proof Verification**: Verify transaction proofs
- **Account Management**: Generate and manage Aleo accounts
- **Program Execution**: Execute Aleo programs with proof generation
- **Memory Optimization**: Efficient memory usage for constrained environments

## API Reference

### Initialization

```typescript
import ProofEngine from '@ghostzk/proof-engine';

// Initialize the engine
const proofEngine = new ProofEngine();
await proofEngine.initialize();
```

### Account Management

```typescript
// Generate a new Aleo account
const account = await proofEngine.generateAccount();
// { privateKey, viewKey, address }

// Derive view key from private key
const viewKey = await proofEngine.deriveViewKey(privateKey);

// Derive address from private key
const address = await proofEngine.deriveAddress(privateKey);
```

### Proof Generation

```typescript
// Generate a proof for a program execution
const proofInput = {
  programId: 'token.aleo',
  functionName: 'transfer_private',
  inputs: ['10u64', 'aleo1abc...']
};

const proofOutput = await proofEngine.generateProof(proofInput);
// { proof, publicInputs }
```

### Proof Verification

```typescript
// Verify a proof
const isValid = await proofEngine.verifyProof(
  'token.aleo',
  proof,
  publicInputs
);
```

### Program Execution with Proof

```typescript
// Execute a program and generate a proof
const result = await proofEngine.executeWithProof(
  'token.aleo',
  'transfer_private',
  ['10u64', 'aleo1abc...'],
  privateKey
);
// { outputs, proof }
```

## Implementation Details

### WASM Bindings

The Proof Engine uses WebAssembly to provide a bridge between JavaScript/TypeScript and the Rust-based snarkVM. The WASM module exposes key functionality from snarkVM while maintaining performance.

Key files:
- `src/index.ts`: TypeScript interface
- `src/wasm/snarkvm_bindings.js`: JavaScript bindings to WASM
- `src/wasm/snarkvm_wasm_bg.wasm`: Compiled WebAssembly module

### Memory Management

WebAssembly has limited memory, so the Proof Engine includes functions to manage memory usage:

```typescript
// Get memory usage information
const memoryInfo = await proofEngine.wasmModule.getMemoryInfo();
// { totalMemory, usedMemory }

// Free resources when done
await proofEngine.wasmModule.free();
```

## Performance Considerations

- Proof generation is computationally intensive and may take several seconds
- Memory usage can be high during complex operations
- Consider showing loading indicators during proof generation
- Mobile devices may have longer generation times

## Error Handling

The ProofEngine throws `ProofError` instances for various error conditions:

```typescript
try {
  await proofEngine.generateProof(input);
} catch (error) {
  if (error instanceof ProofError) {
    console.error(`Proof generation failed: ${error.message}`);
  }
}
```

## Testing

The Proof Engine includes comprehensive tests to verify functionality:

```bash
cd packages/proof-engine
npm test
```

## Future Improvements

- Asynchronous proof generation with progress updates
- WebWorker support for non-blocking operations
- Proof batching for improved throughput
- Support for more complex program structures
