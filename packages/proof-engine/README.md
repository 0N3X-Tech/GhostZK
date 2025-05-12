# GhostZK Proof Engine

A WebAssembly-based module that provides bindings to Aleo's zero-knowledge proof system for browser and Node.js environments.

## Overview

The GhostZK Proof Engine enables applications to generate and verify zero-knowledge proofs for Aleo programs directly in the browser or Node.js, without requiring a connection to an Aleo node. This is essential for privacy-preserving applications where computations need to be proven without revealing the underlying data.

Key features:
- **Generate proofs** for Aleo program executions
- **Verify proofs** to ensure validity
- **Execute programs** with proof generation
- **Account management** for Aleo keypairs
- **Worker thread support** for non-blocking UI performance
- **Cross-platform compatibility** (browser, Node.js, mobile via wrappers)

## Installation

```bash
npm install @ghostzk/proof-engine
```

## Usage

### Basic Example

```typescript
import ProofEngine from '@ghostzk/proof-engine';

async function main() {
  // Initialize the engine
  const engine = new ProofEngine();
  await engine.initialize();
  
  // Generate a proof
  const proofResult = await engine.generateProof({
    programId: 'token.aleo',
    functionName: 'transfer_private', 
    inputs: [
      '{owner: aleo1abc...record_data}',
      'aleo1xyz...',
      '1000u64'
    ]
  });
  
  console.log('Proof generated:', proofResult.proof);
  
  // Verify a proof
  const isValid = await engine.verifyProof(
    'token.aleo',
    proofResult.proof,
    proofResult.publicInputs
  );
  
  console.log('Proof valid:', isValid);
}

main().catch(console.error);
```

### Account Operations

```typescript
import ProofEngine from '@ghostzk/proof-engine';

async function createAccount() {
  const engine = new ProofEngine();
  await engine.initialize();
  
  // Generate a new Aleo account
  const account = await engine.generateAccount();
  
  console.log('Private Key:', account.privateKey);
  console.log('View Key:', account.viewKey);
  console.log('Address:', account.address);
  
  // Derive keys from private key
  const derivedViewKey = await engine.deriveViewKey(account.privateKey);
  const derivedAddress = await engine.deriveAddress(account.privateKey);
  
  console.log('Derived View Key:', derivedViewKey); // Should match account.viewKey
  console.log('Derived Address:', derivedAddress);  // Should match account.address
}

createAccount().catch(console.error);
```

### Using Web Workers

For better performance in browser environments, you can run proof generation in a web worker:

```typescript
import ProofEngine from '@ghostzk/proof-engine';
import * as Comlink from 'comlink';

// In worker.ts
const worker = {
  async generateProof(input) {
    const engine = new ProofEngine();
    await engine.initialize();
    return engine.generateProof(input);
  }
};

Comlink.expose(worker);

// In main.ts
const ProofWorker = Comlink.wrap(new Worker('./worker.ts', { type: 'module' }));
const result = await ProofWorker.generateProof({
  programId: 'token.aleo',
  functionName: 'transfer_private',
  inputs: ['...', '...', '...']
});
```

## API Reference

### `ProofEngine`

The main class that provides access to the proof system.

#### Methods

- `initialize(): Promise<void>` - Initialize the engine by loading the WASM module
- `isInitialized(): boolean` - Check if the engine has been initialized
- `generateProof(input: ProofInput): Promise<ProofOutput>` - Generate a proof
- `verifyProof(programId: string, proof: string, publicInputs: string[]): Promise<boolean>` - Verify a proof
- `executeWithProof(programId: string, functionName: string, inputs: string[], privateKey?: string): Promise<ExecutionResult>` - Execute a function and generate a proof
- `generateAccount(): Promise<{privateKey: string, viewKey: string, address: string}>` - Generate a new Aleo account
- `deriveViewKey(privateKey: string): Promise<string>` - Derive a view key from a private key
- `deriveAddress(privateKey: string): Promise<string>` - Derive an address from a private key

## Development Setup

### Prerequisites

- Node.js 16+
- Rust toolchain (for rebuilding the WASM bindings)
- wasm-pack

### Building the WASM Bindings

The WASM bindings are built from Rust code using wasm-pack:

```bash
cd rust
wasm-pack build --target web --out-dir ../src/wasm
```

### Building the Package

```bash
npm run build
```

### Running Tests

```bash
npm test
```

## Performance Considerations

- Proof generation is computationally intensive and can take several seconds
- For browser applications, always run proof generation in a web worker
- The initial load of the WASM module may be slow; consider loading it at app startup
- Memory usage can be high during proof generation (100MB+)

## License

MIT