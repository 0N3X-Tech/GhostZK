# Proof Engine API Reference

The Proof Engine provides a JavaScript/TypeScript API for generating and verifying zero-knowledge proofs for Aleo programs.

## Installation

```bash
npm install @ghostzk/proof-engine
```

## Basic Usage

```typescript
import ProofEngine from '@ghostzk/proof-engine';

// Initialize the engine
const proofEngine = new ProofEngine();
await proofEngine.initialize();

// Generate a proof
const proofInput = {
  programId: 'token.aleo',
  functionName: 'transfer_private',
  inputs: ['10u64', 'aleo1abc...']
};

const proofOutput = await proofEngine.generateProof(proofInput);
// { proof, publicInputs }
```

## API Reference

### Initialization

#### `ProofEngine()`
Constructor for creating a new ProofEngine instance.

Returns: `ProofEngine`

#### `async initialize()`
Initializes the ProofEngine by loading the WASM module.

Returns: `Promise<void>`

#### `isInitialized()`
Checks if the ProofEngine has been initialized.

Returns: `boolean`

### Account Management

#### `async generateAccount()`
Generates a new Aleo account (keypair).

Returns: `Promise<{ privateKey: string, viewKey: string, address: string }>`

Example:
```typescript
const account = await proofEngine.generateAccount();
console.log(account.privateKey); // APrivateKey1...
console.log(account.viewKey);    // AViewKey1...
console.log(account.address);    // aleo1...
```

#### `async deriveViewKey(privateKey: string)`
Derives the view key from a private key.

Parameters:
- `privateKey` (string): The private key to derive from

Returns: `Promise<string>` - The view key

Example:
```typescript
const viewKey = await proofEngine.deriveViewKey('APrivateKey1...');
console.log(viewKey); // AViewKey1...
```

#### `async deriveAddress(privateKey: string)`
Derives the address from a private key.

Parameters:
- `privateKey` (string): The private key to derive from

Returns: `Promise<string>` - The address

Example:
```typescript
const address = await proofEngine.deriveAddress('APrivateKey1...');
console.log(address); // aleo1...
```

### Proof Generation and Verification

#### `async generateProof(input: ProofInput)`
Generates a zero-knowledge proof for a program execution.

Parameters:
- `input` (ProofInput): The proof input containing program ID, function name, and inputs

Returns: `Promise<ProofOutput>` - The generated proof and public inputs

Example:
```typescript
const proofInput = {
  programId: 'token.aleo',
  functionName: 'transfer_private',
  inputs: ['10u64', 'aleo1abc...']
};

const proofOutput = await proofEngine.generateProof(proofInput);
console.log(proofOutput.proof);        // Proof string
console.log(proofOutput.publicInputs); // Array of public inputs
```

#### `async verifyProof(programId: string, proof: string, publicInputs: string[])`
Verifies a zero-knowledge proof.

Parameters:
- `programId` (string): The ID of the Aleo program
- `proof` (string): The proof string to verify
- `publicInputs` (string[]): The public inputs associated with the proof

Returns: `Promise<boolean>` - Indicates whether the proof is valid

Example:
```typescript
const isValid = await proofEngine.verifyProof(
  'token.aleo',
  proofOutput.proof,
  proofOutput.publicInputs
);

console.log(isValid); // true or false
```

### Program Execution

#### `async executeWithProof(programId: string, functionName: string, inputs: string[], privateKey?: string)`
Executes a program function and generates a proof.

Parameters:
- `programId` (string): The ID of the Aleo program
- `functionName` (string): The name of the function to execute
- `inputs` (string[]): The function inputs as strings
- `privateKey` (string, optional): Private key for signing the execution

Returns: `Promise<ExecutionResult>` - The execution result with outputs and proof

Example:
```typescript
const result = await proofEngine.executeWithProof(
  'token.aleo',
  'transfer_private',
  ['10u64', 'aleo1abc...'],
  'APrivateKey1...'
);

console.log(result.outputs); // Array of outputs
console.log(result.proof);   // Proof string
```

## Types

### `ProofInput`
```typescript
interface ProofInput {
  programId: string;    // The Aleo program ID
  functionName: string; // The function name to execute
  inputs: string[];     // Array of function inputs as strings
}
```

### `ProofOutput`
```typescript
interface ProofOutput {
  proof: string;        // The proof string
  publicInputs: string[]; // Array of public inputs
}
```

### `ExecutionResult`
```typescript
interface ExecutionResult {
  outputs: string[];    // Array of function outputs
  proof: string;        // The proof string
}
```

### `ProofError`
```typescript
class ProofError extends Error {
  constructor(message: string);
}
```

## Error Handling

The ProofEngine throws `ProofError` instances for error conditions:

```typescript
try {
  await proofEngine.generateProof(input);
} catch (error) {
  if (error instanceof ProofError) {
    console.error(`Proof generation failed: ${error.message}`);
  }
}
```

Common error scenarios:
- WASM module initialization failure
- Invalid input parameters
- Insufficient memory
- Network connectivity issues
- Invalid program format

## Advanced Usage

### Memory Management

```typescript
// Get memory information
const memoryInfo = await proofEngine.wasmModule.getMemoryInfo();
console.log(`Total: ${memoryInfo.totalMemory}, Used: ${memoryInfo.usedMemory}`);

// Free memory when done
await proofEngine.wasmModule.free();
```

### Loading Programs

```typescript
// Load a program from a file path
await proofEngine.wasmModule.loadProgram('path/to/program.aleo');

// Load a program from a string
const programCode = `program token.aleo { ... }`;
await proofEngine.wasmModule.loadProgramString(programCode);

// Get loaded programs
const programs = proofEngine.wasmModule.getLoadedPrograms();
console.log(programs); // ['token.aleo', 'other.aleo', ...]
```

## Performance Considerations

- Proof generation is computationally intensive
- Consider using WebWorkers for non-blocking operations
- For mobile devices, implement timeout handling
- Implement progress indicators for users

## Browser Compatibility

The Proof Engine works in modern browsers that support WebAssembly, including:
- Chrome 57+
- Firefox 53+
- Safari 11+
- Edge 16+

## Node.js Usage

When using in Node.js environments, ensure you have the proper WASM support:

```typescript
import { readFileSync } from 'fs';
import { join } from 'path';
import ProofEngine from '@ghostzk/proof-engine';

// Load WASM module
const wasmPath = join(__dirname, 'node_modules/@ghostzk/proof-engine/dist/wasm/snarkvm_wasm_bg.wasm');
const wasmModule = readFileSync(wasmPath);

// Initialize with custom module
const proofEngine = new ProofEngine();
await proofEngine.initialize(wasmModule);
```

## Complete Example

```typescript
import ProofEngine from '@ghostzk/proof-engine';

async function transferTokens() {
  try {
    // Initialize the engine
    const proofEngine = new ProofEngine();
    await proofEngine.initialize();
    
    // Generate or import account
    const account = await proofEngine.generateAccount();
    console.log(`Generated address: ${account.address}`);
    
    // Prepare transaction inputs
    const amount = '10u64';
    const recipient = 'aleo1abc...';
    
    // Generate proof for the transaction
    const proofInput = {
      programId: 'token.aleo',
      functionName: 'transfer_private',
      inputs: [amount, recipient]
    };
    
    console.log('Generating proof...');
    const proofOutput = await proofEngine.generateProof(proofInput);
    
    console.log('Proof generated successfully!');
    console.log(proofOutput);
    
    // Verify the proof
    const isValid = await proofEngine.verifyProof(
      proofInput.programId,
      proofOutput.proof,
      proofOutput.publicInputs
    );
    
    console.log(`Proof verification: ${isValid ? 'Valid' : 'Invalid'}`);
    
    // Clean up
    await proofEngine.wasmModule.free();
    
    return proofOutput;
  } catch (error) {
    console.error('Error in transfer process:', error);
    throw error;
  }
}

// Execute the function
transferTokens().then(result => {
  console.log('Transfer completed with proof:', result);
}).catch(error => {
  console.error('Transfer failed:', error);
});
```
