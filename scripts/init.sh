#!/usr/bin/env bash
set -e

# GhostZK Project Initialization Script
# This script sets up the development environment for the GhostZK project.

# Text formatting
BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print a styled section header
section() {
  echo -e "\n${BOLD}${GREEN}=== $1 ===${NC}\n"
}

# Print an info message
info() {
  echo -e "${YELLOW}$1${NC}"
}

# Print an error message
error() {
  echo -e "${RED}$1${NC}"
}

# Check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Project root directory (parent of this script)
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

section "GhostZK Project Initialization"
info "Initializing project at: $PROJECT_ROOT"

# Check required dependencies
section "Checking Dependencies"

if ! command_exists node; then
  error "Node.js is not installed. Please install Node.js 16+ (https://nodejs.org)"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d 'v' -f2)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d '.' -f1)
if [[ $NODE_MAJOR -lt 16 ]]; then
  error "Node.js version must be 16 or higher (current: $NODE_VERSION)"
  exit 1
fi

if ! command_exists npm; then
  error "npm is not installed. Please install npm."
  exit 1
fi

# Check for Rust (needed for WASM compilation)
if ! command_exists rustc; then
  info "Rust is not installed. It's required for WASM compilation."
  info "Install Rust? (y/n)"
  read -r install_rust
  if [[ "$install_rust" == "y" ]]; then
    info "Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
    source "$HOME/.cargo/env"
  else
    info "Skipping Rust installation. Some features may not work properly."
  fi
else
  info "Rust is installed: $(rustc --version)"
fi

# Check for Leo (needed for token protocol)
if ! command_exists leo; then
  info "Leo language is not installed. It's required for Aleo smart contracts."
  info "Install Leo? (y/n)"
  read -r install_leo
  if [[ "$install_leo" == "y" ]]; then
    info "Installing Leo..."
    curl -L https://get.leo-lang.org | sh
    source "$HOME/.leo/env"
  else
    info "Skipping Leo installation. Token protocol development will be limited."
  fi
else
  info "Leo is installed: $(leo --version)"
fi

# Check for wasm-pack (needed for proof engine)
if ! command_exists wasm-pack; then
  info "wasm-pack is not installed. It's required for the proof engine."
  info "Install wasm-pack? (y/n)"
  read -r install_wasm_pack
  if [[ "$install_wasm_pack" == "y" ]]; then
    info "Installing wasm-pack..."
    curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
  else
    info "Skipping wasm-pack installation. Proof engine development will be limited."
  fi
else
  info "wasm-pack is installed: $(wasm-pack --version)"
fi

# Install project dependencies
section "Installing Dependencies"
npm install

# Initialize Token Protocol
section "Initializing Token Protocol"
if command_exists leo; then
  cd "$PROJECT_ROOT/packages/token-protocol"
  if [ ! -f "Snarkfile.toml" ]; then
    leo new token-protocol 
    # Update program.json with our token implementation
    if [ -f "program.json" ]; then
      # Copy our main.leo over the generated one
      mv src/main.leo src/main.leo.bak 2>/dev/null || true
      cp "$PROJECT_ROOT/packages/token-protocol/src/main.leo" src/main.leo
    fi
  fi
  cd "$PROJECT_ROOT"
else
  info "Skipping Leo token protocol initialization (Leo not installed)"
fi

# Setup package folders that might not have been created
section "Setting Up Package Directories"
mkdir -p "$PROJECT_ROOT/packages/proof-engine/src/wasm"
mkdir -p "$PROJECT_ROOT/packages/wallet-extension/public/icons"
mkdir -p "$PROJECT_ROOT/packages/wallet-mobile/src"
mkdir -p "$PROJECT_ROOT/packages/relayer/src"
mkdir -p "$PROJECT_ROOT/packages/bridge/src"
mkdir -p "$PROJECT_ROOT/docs/images"

# Create placeholder icons for the wallet extension
section "Creating Placeholder Icons"
# This creates simple text-based placeholder icons
# In a real project, you would use actual icon files
for size in 16 48 128; do
  if [ ! -f "$PROJECT_ROOT/packages/wallet-extension/public/icons/icon${size}.png" ]; then
    info "Creating placeholder icon${size}.png"
    # Use a simple command to create a basic icon - replace with real icons later
    echo "Creating placeholder icon: icon${size}.png"
    # Uncomment to use ImageMagick if available
    # if command_exists convert; then
    #   convert -size ${size}x${size} -background transparent -fill gray -gravity center label:GZ "$PROJECT_ROOT/packages/wallet-extension/public/icons/icon${size}.png"
    # fi
  fi
done

# Create documentation directory and placeholder
if [ ! -f "$PROJECT_ROOT/docs/getting-started.md" ]; then
  section "Creating Documentation"
  cat > "$PROJECT_ROOT/docs/getting-started.md" << 'EOF'
# GhostZK: Getting Started

This guide will help you get started with the GhostZK wallet and token protocol.

## Installation

1. **Browser Extension**
   - Build from source or download the extension package
   - Install in Chrome/Firefox as an unpacked extension

2. **Creating a Wallet**
   - Click on the GhostZK extension icon
   - Select "Create New Wallet"
   - Write down your recovery phrase
   - Set a strong password

3. **Importing an Existing Wallet**
   - Click on the GhostZK extension icon
   - Select "Import Wallet"
   - Enter your recovery phrase or private key
   - Set a password for this device

## Using the Wallet

- **Viewing Balances**: The main screen shows your public and private token balances
- **Sending Tokens**: Use the "Send" button to initiate a transfer
- **Privacy Settings**: Choose between public, private, or mixed transactions
- **Account Management**: Create and manage multiple accounts

## Development

See the [Developer Guide](./developer-guide.md) for information on building and contributing to GhostZK.
EOF
fi

section "Creating TypeScript Configuration"
# Create TypeScript configuration if it doesn't exist
if [ ! -f "$PROJECT_ROOT/tsconfig.json" ]; then
  cat > "$PROJECT_ROOT/tsconfig.json" << 'EOF'
{
  "compilerOptions": {
    "target": "es2020",
    "module": "esnext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "lib": ["dom", "dom.iterable", "esnext", "webworker"],
    "allowJs": true,
    "baseUrl": ".",
    "paths": {
      "@ghostzk/*": ["packages/*/src"]
    }
  },
  "exclude": ["node_modules", "dist", "build", "coverage"]
}
EOF
fi

section "Initialization Complete"
info "The GhostZK project has been initialized successfully!"
info ""
info "Next steps:"
info "1. Review the code in the packages directory"
info "2. Run 'npm run build' to build all packages"
info "3. Start development on a specific package:"
info "   - cd packages/wallet-extension && npm start"
info "   - cd packages/proof-engine && npm run build"
info ""
info "For more information, see the documentation in the docs directory."