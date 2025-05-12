/**
 * TypeScript declaration file for snarkVM WebAssembly bindings
 * This file defines the interface for the compiled Rust/WASM module that interacts with Aleo's snarkVM
 */

/**
 * Interface for account information returned by generateAccount
 */
export interface AleoAccount {
  privateKey: string;
  viewKey: string;
  address: string;
}

/**
 * Interface for proof generation results
 */
export interface ProofResult {
  proof: string;
  publicInputs: string[];
}

/**
 * Interface for program execution results
 */
export interface ExecutionResult {
  outputs: string[];
  proof: string;
}

/**
 * Memory information
 */
export interface MemoryInfo {
  totalMemory: number;
  usedMemory: number;
}

/**
 * WASM module initialization output
 */
export interface InitOutput {
  /** Initialize memory */
  memory: WebAssembly.Memory;

  /** Generate a proof for program execution */
  generateProof(programId: string, functionName: string, inputs: string[]): Promise<ProofResult>;

  /** Verify a proof */
  verifyProof(programId: string, proof: string, publicInputs: string[]): Promise<boolean>;

  /** Execute program function and generate proof */
  executeWithProof(
    programId: string, 
    functionName: string, 
    inputs: string[], 
    privateKey?: string
  ): Promise<ExecutionResult>;

  /** Generate a new Aleo account */
  generateAccount(): Promise<AleoAccount>;

  /** Derive a view key from a private key */
  deriveViewKey(privateKey: string): Promise<string>;

  /** Derive an address from a private key */
  deriveAddress(privateKey: string): Promise<string>;

  /** Get memory usage information */
  getMemoryInfo(): MemoryInfo;

  /** Load a program at the given path */
  loadProgram(path: string): Promise<void>;

  /** Load a program from a string */
  loadProgramString(program: string): Promise<void>;

  /** Get the currently loaded programs */
  getLoadedPrograms(): string[];

  /** Free memory and resources */
  free(): void;
}

/**
 * Default export is a function that initializes the WASM module
 */
export default function init(moduleOrPath?: WebAssembly.Module | string): Promise<InitOutput>;