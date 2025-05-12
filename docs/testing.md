# Testing Guide for GhostZK

This document outlines the testing infrastructure and procedures for the GhostZK project.

## Overview

GhostZK incorporates several testing methodologies to ensure quality and reliability:

1. **Unit Tests**: Validates individual functions and components
2. **Integration Tests**: Tests interactions between components
3. **End-to-End Tests**: Tests complete user workflows
4. **Continuous Integration**: Automated testing on GitHub Actions

## Testing Stack

- **Jest**: JavaScript/TypeScript unit and integration testing
- **Mocha/Chai**: Additional testing frameworks for specific components
- **Supertest**: HTTP endpoint testing for the relayer service
- **GitHub Actions**: CI/CD pipeline automation

## Running Tests

### All Tests

To run all tests across all packages:

```bash
npm test
```

### Package-Specific Tests

To run tests for a specific package:

```bash
npm test --workspace=@ghostzk/proof-engine
npm test --workspace=@ghostzk/relayer
npm test --workspace=@ghostzk/token-protocol
```

### Single Test File

To run a specific test file:

```bash
cd packages/proof-engine
npx jest src/test/proof-generation.test.ts
```

## Test Structure

### Unit Tests

Unit tests are organized alongside the code they test with a `.test.ts` or `.spec.ts` suffix:

```
packages/
└── proof-engine/
    ├── src/
    │   ├── index.ts
    │   └── test/
    │       └── proof-generation.test.ts
```

Example unit test:

```typescript
describe('ProofEngine', () => {
  it('should initialize successfully', () => {
    const proofEngine = new ProofEngine();
    expect(proofEngine).toBeDefined();
  });
});
```

### Integration Tests

Integration tests focus on component interactions and are located in the `test` directory:

```
packages/
└── token-protocol/
    ├── src/
    └── test/
        └── token.test.js
```

Example integration test:

```javascript
describe('Token Protocol Integration', function() {
  it('should transfer tokens between accounts', async function() {
    // Test complete token transfer workflow
  });
});
```

## Testing the Proof Engine

The Proof Engine tests verify that:

1. WASM bindings load correctly
2. Proof generation works for sample inputs
3. Proof verification correctly validates proofs
4. Account generation and key derivation function properly

Key test files:
- `packages/proof-engine/src/test/proof-generation.test.ts`

## Testing the Token Protocol

Token Protocol tests ensure:

1. Token initialization works correctly
2. Public and private transfers execute as expected
3. Staking and reward mechanics function properly
4. Edge cases are handled gracefully

Key test files:
- `packages/token-protocol/test/token.test.js`

## Testing the Relayer

Relayer service tests verify:

1. API endpoints respond correctly
2. Transaction submission works properly
3. Signature verification functions as expected
4. Error handling works for various cases

Key test files:
- `packages/relayer/src/routes/transactions.test.ts`
- `packages/relayer/src/services/aleoService.test.ts`

## Test Environment Setup

### Environment Variables

Create a `.env.test` file with test-specific configurations:

```
# Test settings
ALEO_NETWORK=testnet3
ALEO_API_URL=https://api.explorer.aleo.org/v1
RELAYER_PRIVATE_KEY=APrivateKey1...
RELAYER_ADDRESS=aleo1...
MAX_GAS_SUBSIDY=500000
```

### Mocking Dependencies

For tests that require external dependencies, use Jest's mocking capabilities:

```typescript
// Mock Aleo SDK
jest.mock('@aleohq/sdk', () => ({
  Account: {
    verifySignature: jest.fn().mockResolvedValue(true)
  },
  // Other mocked components
}));
```

## Continuous Integration

GhostZK uses GitHub Actions for continuous integration:

```yaml
# .github/workflows/ci.yml
name: GhostZK CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [16.x, 18.x]
    
    steps:
    - uses: actions/checkout@v3
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
    - name: Install dependencies
      run: npm ci
    - name: Run linting
      run: npm run lint
    - name: Run tests
      run: npm test
```

## Testing Best Practices

1. **Write tests first**: Consider a test-driven development approach
2. **Mock external dependencies**: Avoid network calls in unit tests
3. **Test edge cases**: Include tests for error conditions
4. **Keep tests independent**: Tests should not depend on each other
5. **Test performance**: Include benchmarks for critical operations
6. **Update tests**: Keep tests current when code changes

## Testing Aleo Programs

Leo provides a testing framework for Aleo programs:

```bash
cd packages/token-protocol
leo test
```

Example Leo test:

```leo
// test_token.leo
import token.aleo;

// Test token transfer
function test_transfer_public() {
    let sender: address = aleo1...;
    let receiver: address = aleo1...;
    let amount: u64 = 100u64;
    
    // Call the function
    token.aleo.transfer_public(receiver, amount);
    
    // Check the result
    let sender_balance = token.aleo.get_public_balance(sender);
    let receiver_balance = token.aleo.get_public_balance(receiver);
    
    assert_eq(sender_balance, 900u64);
    assert_eq(receiver_balance, 100u64);
}
```

## Common Testing Issues

### WASM Tests Failing

If WASM tests fail with memory errors:
1. Check that wasm-pack is up to date
2. Ensure `--debug` flag is used for wasm-pack build
3. Verify memory limits are properly set

### Timeout Issues

For long-running tests:
1. Increase timeout in test configuration
2. Consider breaking into smaller tests
3. Use Mock implementations for complex operations

### Network-Dependent Tests

For tests dependent on the Aleo network:
1. Use recorded responses for deterministic testing
2. Implement robust retry logic
3. Consider using a local test network
