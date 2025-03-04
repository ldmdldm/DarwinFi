import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import "hardhat-deploy";
import "hardhat-gas-reporter";
import "solidity-coverage";
import * as dotenv from "dotenv";
import { HDNodeWallet, Mnemonic } from "ethers";

// Load environment variables from .env file
dotenv.config({ path: "../.env" });

// Default mnemonic for development - DO NOT USE IN PRODUCTION
const DEFAULT_MNEMONIC = "test test test test test test test test test test test junk";

// Get mnemonic from environment variables or use the default one
const MNEMONIC = process.env.WALLET_MNEMONIC || DEFAULT_MNEMONIC;

// Function to derive accounts from mnemonic
function getAccountsFromMnemonic(mnemonic: string, count = 10): string[] {
const mnemonicObj = Mnemonic.fromPhrase(mnemonic);
return Array.from({ length: count }, (_, i) => {
    const path = `m/44'/60'/0'/0/${i}`;
    const wallet = HDNodeWallet.fromMnemonic(mnemonicObj, path);
    return wallet.privateKey;
});
}

const config: HardhatUserConfig = {
solidity: {
    version: "0.8.20",
    settings: {
    optimizer: {
        enabled: true,
        runs: 200
    },
    viaIR: true,
    },
},
networks: {
    // Local development network
    hardhat: {
    chainId: 1337,
    },
    // Injective EVM Testnet
    injectiveEvmTestnet: {
    url: process.env.INJECTIVE_EVM_TESTNET_RPC || "https://k8s.testnet.evmix.json-rpc.injective.network",
    chainId: 999,
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : getAccountsFromMnemonic(MNEMONIC),
    gas: 'auto',
    gasPrice: 500000000, // 0.5 INJ Gwei
    gasMultiplier: 1.3,
    },
    // Injective Testnet (K)
    injectiveTestnet: {
    url: process.env.TESTNET_RPC_ENDPOINT || "https://testnet.sentry.tm.injective.network:443",
    chainId: 888,
    accounts: getAccountsFromMnemonic(MNEMONIC),
    gas: 'auto',
    gasPrice: 500000000, // 0.5 INJ Gwei
    gasMultiplier: 1.3,
    },
    // Injective Mainnet
    injectiveMainnet: {
    url: process.env.MAINNET_RPC_ENDPOINT || "https://sentry.tm.injective.network:443",
    chainId: 1,
    accounts: getAccountsFromMnemonic(MNEMONIC),
    gas: 'auto',
    gasPrice: 500000000, // 0.5 INJ Gwei
    gasMultiplier: 1.3,
    },
},
paths: {
    sources: "./src",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
    deploy: ["./deploy"],   // Path for deploy scripts used by hardhat-deploy
},
// Configuration for hardhat-deploy
namedAccounts: {
    deployer: 0,
},
gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
},
mocha: {
    timeout: 60000, // 60 seconds
},
etherscan: {
    apiKey: {
    // API key for Injective Explorer, if needed for verification
    injectiveTestnet: process.env.INJECTIVE_EXPLORER_API_KEY || "",
    injectiveMainnet: process.env.INJECTIVE_EXPLORER_API_KEY || "",
    },
    customChains: [
    {
        network: "injectiveTestnet",
        chainId: 888,
        urls: {
        apiURL: "https://testnet.explorer.injective.network/api",
        browserURL: "https://testnet.explorer.injective.network",
        },
    },
    {
        network: "injectiveMainnet",
        chainId: 1,
        urls: {
        apiURL: "https://explorer.injective.network/api",
        browserURL: "https://explorer.injective.network",
        },
    },
    ],
},
};

export default config;
