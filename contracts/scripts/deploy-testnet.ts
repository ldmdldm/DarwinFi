const { Network, getNetworkInfo } = require("@injectivelabs/networks");
const { 
ChainGrpcWasmApi, 
MsgStoreCode, 
MsgInstantiateContract,
createTransaction,
MsgBroadcasterWithPk,
PrivateKey
} = require("@injectivelabs/sdk-ts");
const { readFileSync, writeFileSync } = require("fs");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config();

// Configuration
const network = Network.TestnetK8s;
const networkInfo = getNetworkInfo(network);
const endpoint = process.env.TESTNET_RPC_ENDPOINT || networkInfo.rpc;

// Wallet setup
async function getWallet() {
// Check for private key or mnemonic in environment variables
const privateKey = process.env.WALLET_PRIVATE_KEY;
const mnemonic = process.env.WALLET_MNEMONIC;

if (!privateKey && !mnemonic) {
    throw new Error("Either WALLET_PRIVATE_KEY or WALLET_MNEMONIC must be set in environment variables");
}

let privateKeyObj: typeof PrivateKey;

if (privateKey) {
    // Create private key from hex
    privateKeyObj = PrivateKey.fromHex(privateKey);
} else {
    // Create private key from mnemonic
    privateKeyObj = PrivateKey.fromMnemonic(mnemonic as string);
}

return privateKeyObj;
}

async function deployContract(wasmFilePath: string, initMsg: object, label: string) {
try {
    // Initialize clients
    const wallet = await getWallet();
    const chainGrpcWasmApi = new ChainGrpcWasmApi(networkInfo.grpc);
    const broadcaster = new MsgBroadcasterWithPk({
    network,
    privateKey: wallet
    });

    console.log(`Deploying contract from ${wasmFilePath}`);
    console.log(`Using wallet address: ${wallet.toBech32()}`)

    // 1. Upload contract code
    console.log("Uploading contract code...");
    const wasmFile = readFileSync(wasmFilePath);
    const storeCodeMsg = MsgStoreCode.fromJSON({
    sender: wallet.toBech32(),
    wasmBytes: Buffer.from(wasmFile).toString("base64"),
    });

    // Create and sign transaction
    // Note: No longer need to manually create and sign transaction
    // MsgBroadcasterWithPk handles this internally
    // Broadcast the transaction
    const storeCodeTxResponse = await broadcaster.broadcast({
    msgs: [storeCodeMsg],
    memo: "Upload contract",
    });

    // Parse code ID from response
    const logs = storeCodeTxResponse.rawLog;
    const codeIdRegex = /\"code_id\":\"(\d+)\"/;
    const match = logs.match(codeIdRegex);
    
    if (!match) {
    throw new Error(`Failed to parse code ID from response: ${logs}`);
    }
    
    const codeId = match[1];
    console.log(`Contract code uploaded with code ID: ${codeId}`);

    // 2. Instantiate contract
    console.log("Instantiating contract...");
    const instantiateMsg = MsgInstantiateContract.fromJSON({
    sender: wallet.toBech32(),
    admin: wallet.toBech32(),
    codeId: parseInt(codeId),
    label,
    msg: initMsg,
    });

    // Create and sign transaction
    // Note: No longer need to manually create and sign transaction
    // MsgBroadcasterWithPk handles this internally
    // Broadcast the transaction
    const instantiateTxResponse = await broadcaster.broadcast({
    msgs: [instantiateMsg],
    memo: "Instantiate contract",
    });

    // Parse contract address
    const instantiateLogs = instantiateTxResponse.rawLog;
    const contractAddressRegex = /\"contract_address\":\"([^\"]+)\"/;
    const contractMatch = instantiateLogs.match(contractAddressRegex);
    
    if (!contractMatch) {
    throw new Error(`Failed to parse contract address from response: ${instantiateLogs}`);
    }
    
    const contractAddress = contractMatch[1];
    console.log(`Contract instantiated at address: ${contractAddress}`);

    return {
    codeId,
    contractAddress,
    };
} catch (error) {
    console.error("Error deploying contract:", error);
    throw error;
}
}

async function main() {
try {
    console.log("Starting contract deployment to Injective testnet...");
    
    // Deploy Vault contract
    const vaultContract = await deployContract(
    path.resolve(__dirname, "../artifacts/vault.wasm"),
    { 
        name: "DarwinFi Vault",
        symbol: "DARV",
        decimals: 18,
        admin: process.env.WALLET_ADDRESS
    },
    "DarwinFi Vault Contract"
    );
    
    // Deploy Strategy Factory contract
    const strategyFactoryContract = await deployContract(
    path.resolve(__dirname, "../artifacts/strategy_factory.wasm"),
    { 
        admin: process.env.WALLET_ADDRESS,
        vault_address: vaultContract.contractAddress
    },
    "DarwinFi Strategy Factory"
    );
    
    // Save contract addresses to a file
    const deploymentInfo = {
    network: "testnet",
    vaultContract: {
        address: vaultContract.contractAddress,
        codeId: vaultContract.codeId
    },
    strategyFactoryContract: {
        address: strategyFactoryContract.contractAddress,
        codeId: strategyFactoryContract.codeId
    },
    timestamp: new Date().toISOString()
    };
    
    const deploymentPath = path.resolve(__dirname, "../deployed_addresses.json");
    writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    
    console.log(`Deployment successful! Contract addresses saved to ${deploymentPath}`);
    console.log(`Vault Contract: ${vaultContract.contractAddress}`);
    console.log(`Strategy Factory Contract: ${strategyFactoryContract.contractAddress}`);
    
    // Also save to frontend directory for easy access
    const frontendDeploymentPath = path.resolve(__dirname, "../frontend/src/config/addresses.json");
    writeFileSync(frontendDeploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`Contract addresses also saved to frontend at ${frontendDeploymentPath}`);
    
    return deploymentInfo;
} catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
}
}

// Execute the deployment if this script is run directly
if (require.main === module) {
main()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);
    });
}

// Export the main function for use in other scripts
module.exports = { 
deployContracts: main,
main: main 
};
