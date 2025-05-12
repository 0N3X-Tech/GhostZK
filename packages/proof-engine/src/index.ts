import type { InitOutput } from './wasm/snarkvm_bindings';

// Types for inputs and outputs
export interface ProofInput {
  programId: string;
  functionName: string;
  inputs: string[];
}

export interface ProofOutput {
  proof: string;
  publicInputs: string[];
}

export interface ExecutionResult {
  outputs: string[];
  proof: string;
}

export class ProofError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProofError';
  }
}

/**
 * ProofEngine provides an interface to Aleo's zero-knowledge proof system
 * via WebAssembly bindings to snarkVM.
 */
export class ProofEngine {
  private wasmModule: any = null;
  private initialized: boolean = false;

  /**
   * Initialize the ProofEngine by loading the WASM module
   */
  public async initialize(): Promise<void> {
    try {
      // Dynamically import the WASM module to support different environments
      const wasm = await import('./wasm/snarkvm_bindings');
      this.wasmModule = await wasm.default();
      this.initialized = true;
    } catch (error) {
      throw new ProofError(`Failed to initialize WASM module: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Check if the ProofEngine has been initialized
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Generate a zero-knowledge proof for a program execution
   * @param input - The proof input containing program ID, function name, and inputs
   * @returns A promise that resolves to the proof output
   */
  public async generateProof(input: ProofInput): Promise<ProofOutput> {
    this.ensureInitialized();
    
    try {
      const result = await this.wasmModule.generateProof(
        input.programId,
        input.functionName,
        input.inputs
      );
      
      return {
        proof: result.proof,
        publicInputs: result.publicInputs
      };
    } catch (error) {
      throw new ProofError(`Proof generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Verify a zero-knowledge proof
   * @param programId - The ID of the Aleo program
   * @param proof - The proof string to verify
   * @param publicInputs - The public inputs associated with the proof
   * @returns A promise that resolves to a boolean indicating whether the proof is valid
   */
  public async verifyProof(
    programId: string,
    proof: string,
    publicInputs: string[]
  ): Promise<boolean> {
    this.ensureInitialized();
    
    try {
      return await this.wasmModule.verifyProof(programId, proof, publicInputs);
    } catch (error) {
      throw new ProofError(`Proof verification failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Execute a program function and generate a proof
   * @param programId - The ID of the Aleo program
   * @param functionName - The name of the function to execute
   * @param inputs - The function inputs as strings
   * @param privateKey - Optional private key for signing the execution
   * @returns A promise that resolves to the execution result with outputs and proof
   */
  public async executeWithProof(
    programId: string,
    functionName: string,
    inputs: string[],
    privateKey?: string
  ): Promise<ExecutionResult> {
    this.ensureInitialized();
    
    try {
      const result = await this.wasmModule.executeWithProof(
        programId,
        functionName,
        inputs,
        privateKey || ''
      );
      
      return {
        outputs: result.outputs,
        proof: result.proof
      };
    } catch (error) {
      throw new ProofError(`Execution failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generate an Aleo account (keypair)
   * @returns A promise that resolves to an object containing private key, view key, and address
   */
  public async generateAccount(): Promise<{
    privateKey: string;
    viewKey: string;
    address: string;
  }> {
    this.ensureInitialized();
    
    try {
      return await this.wasmModule.generateAccount();
    } catch (error) {
      throw new ProofError(`Account generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Derive the view key from a private key
   * @param privateKey - The private key to derive from
   * @returns A promise that resolves to the view key
   */
  public async deriveViewKey(privateKey: string): Promise<string> {
    this.ensureInitialized();
    
    try {
      return await this.wasmModule.deriveViewKey(privateKey);
    } catch (error) {
      throw new ProofError(`View key derivation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Derive the address from a private key
   * @param privateKey - The private key to derive from
   * @returns A promise that resolves to the address
   */
  public async deriveAddress(privateKey: string): Promise<string> {
    this.ensureInitialized();
    
    try {
      return await this.wasmModule.deriveAddress(privateKey);
    } catch (error) {
      throw new ProofError(`Address derivation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Ensure that the ProofEngine has been initialized
   * @throws {ProofError} If the ProofEngine has not been initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new ProofError('ProofEngine is not initialized. Call initialize() first.');
    }
  }
}

// Export types and main class
export default ProofEngine;