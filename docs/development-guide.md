# GhostZK Development Guide

This guide provides information for developers who want to contribute to or extend the GhostZK project.

## Development Environment Setup

### Prerequisites

- Node.js (v16.0.0 or higher)
- npm (v7.0.0 or higher)
- Rust (stable channel)
- wasm-pack
- Git

### Environment Setup

1. Install Rust and cargo:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

2. Install wasm-pack:
```bash
cargo install wasm-pack
```

3. Add the WebAssembly target:
```bash
rustup target add wasm32-unknown-unknown
```

4. Install Node.js dependencies:
```bash
npm install
```

## Development Workflow

### Building Packages

```bash
# Build all packages
npm run build

# Build a specific package
npm run build --workspace=@ghostzk/proof-engine
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests for a specific package
npm test --workspace=@ghostzk/token-protocol
```

### Code Linting

```bash
# Lint all packages
npm run lint

# Lint a specific package
npm run lint --workspace=@ghostzk/relayer
```

## Project Structure

The project follows a monorepo structure with packages organized by functionality:

```
ghostzk/
├── packages/
│   ├── proof-engine/       # Zero-knowledge proof generation
│   ├── token-protocol/     # Aleo token implementation
│   ├── relayer/            # Transaction relayer service
│   ├── bridge/             # Cross-chain bridge
│   ├── wallet-extension/   # Browser extension wallet
│   └── wallet-mobile/      # Mobile wallet app
├── docs/                   # Documentation
├── scripts/                # Development scripts
└── ...
```

## Coding Standards

### TypeScript/JavaScript

- Follow the ESLint configuration provided in the project
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Write unit tests for new functionality

### Rust/WASM

- Follow Rust's official style guidelines
- Document public APIs with rustdoc comments
- Write unit tests for all modules
- Optimize WASM for size when appropriate

### Leo Smart Contracts

- Follow the official Leo programming language best practices
- Document all transitions and functions
- Implement comprehensive test cases
- Always validate inputs and handle edge cases

## Git Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Implement changes with appropriate tests
4. Commit changes with meaningful commit messages
5. Push to your fork and submit a pull request

### Commit Message Format

We use conventional commits for consistent commit messages:

```
<type>(<scope>): <short summary>

<body>

<footer>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example:
```
feat(token): implement staking functionality

Add ability for users to stake tokens and earn rewards.
Implement reward calculation based on staking duration.

Closes #123
```

## Continuous Integration

The project uses GitHub Actions for continuous integration:

- Automatic linting and testing on pull requests
- WASM builds for proof-engine
- Deployment to staging environments for review

## Debugging Tips

### WASM Debugging

1. Use `console.log` for basic debugging
2. For detailed memory inspection, use the `getMemoryInfo()` function in the proof engine
3. Test WASM modules in isolation before integration

### Relayer Debugging

1. Set the log level to 'debug' in the logger configuration
2. Use Postman or similar tools to test API endpoints
3. Monitor transaction status using the Aleo Explorer

## Common Issues and Solutions

### WASM Compilation Errors

**Problem**: Error when compiling WASM modules.
**Solution**: Ensure you have the latest wasm-pack version and try running with `--verbose` flag.

### Aleo SDK Version Issues

**Problem**: Compatibility issues with Aleo SDK versions.
**Solution**: Check package.json for the correct version and update as needed.

### Transaction Submission Failures

**Problem**: Transactions fail to submit to the network.
**Solution**: Check network connection, ensure proper fee calculation, and verify account has sufficient balance.

## Further Resources

- [Aleo Developer Documentation](https://developer.aleo.org/overview/)
- [Leo Programming Language](https://developer.aleo.org/leo/)
- [WebAssembly Documentation](https://webassembly.org/)
