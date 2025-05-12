require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require('dotenv').config();

// Import private key from .env file or use a default one for development
const PRIVATE_KEY = process.env.BRIDGE_OPERATOR_PRIVATE_KEY || "0000000000000000000000000000000000000000000000000000000000000000";

// RPC URLs
const MAINNET_RPC_URL = process.env.ETHEREUM_RPC_URL || "";
const GOERLI_RPC_URL = process.env.ETHEREUM_RPC_URL || "";
const SEPOLIA_RPC_URL = process.env.ETHEREUM_RPC_URL || "";

// Optional Etherscan API Key for contract verification
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      // For local testing
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    mainnet: {
      url: MAINNET_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 1,
      gas: 2100000,
      gasPrice: 8000000000  // 8 gwei
    },
    goerli: {
      url: GOERLI_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 5,
      gas: 2100000,
      gasPrice: 8000000000  // 8 gwei
    },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
      gas: 2100000,
      gasPrice: 8000000000  // 8 gwei
    }
  },
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 40000
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  }
};