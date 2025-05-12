import { describe, it, expect, beforeAll } from 'jest';
import ProofEngine from '../index';

describe('ProofEngine WASM Integration', () => {
  let proofEngine: ProofEngine;

  beforeAll(async () => {
    proofEngine = new ProofEngine();
    await proofEngine.initialize();
  });

  it('should initialize successfully', () => {
    expect(proofEngine.isInitialized()).toBe(true);
  });

  it('should generate a proof', async () => {
    const input = {
      programId: 'token.aleo',
      functionName: 'transfer_private',
      inputs: ['10u64', 'aleo1abc...']
    };

    const result = await proofEngine.generateProof(input);
    expect(result).toHaveProperty('proof');
    expect(result).toHaveProperty('publicInputs');
    expect(typeof result.proof).toBe('string');
    expect(Array.isArray(result.publicInputs)).toBe(true);
  });

  it('should verify a proof', async () => {
    const input = {
      programId: 'token.aleo',
      functionName: 'transfer_private',
      inputs: ['10u64', 'aleo1abc...']
    };

    // Generate a proof first
    const { proof, publicInputs } = await proofEngine.generateProof(input);
    
    // Then verify it
    const isValid = await proofEngine.verifyProof(input.programId, proof, publicInputs);
    expect(isValid).toBe(true);
  });

  it('should execute a function with proof', async () => {
    const result = await proofEngine.executeWithProof(
      'token.aleo',
      'transfer_private',
      ['10u64', 'aleo1abc...'],
      'APrivateKey1...'
    );

    expect(result).toHaveProperty('outputs');
    expect(result).toHaveProperty('proof');
    expect(Array.isArray(result.outputs)).toBe(true);
    expect(typeof result.proof).toBe('string');
  });

  it('should generate an Aleo account', async () => {
    const account = await proofEngine.generateAccount();
    
    expect(account).toHaveProperty('privateKey');
    expect(account).toHaveProperty('viewKey');
    expect(account).toHaveProperty('address');
    expect(account.privateKey.startsWith('APrivateKey1')).toBe(true);
    expect(account.viewKey.startsWith('AViewKey1')).toBe(true);
    expect(account.address.startsWith('aleo1')).toBe(true);
  });

  it('should derive a view key from a private key', async () => {
    const privateKey = 'APrivateKey1zkp123456789';
    const viewKey = await proofEngine.deriveViewKey(privateKey);
    
    expect(viewKey.startsWith('AViewKey1')).toBe(true);
  });

  it('should derive an address from a private key', async () => {
    const privateKey = 'APrivateKey1zkp123456789';
    const address = await proofEngine.deriveAddress(privateKey);
    
    expect(address.startsWith('aleo1')).toBe(true);
  });
});
