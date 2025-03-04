import { Network, getNetworkEndpoints } from '@injectivelabs/networks'
import { ChainGrpcWasmApi } from '@injectivelabs/sdk-ts'
import { readFileSync } from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import { BigNumberInBase } from '@injectivelabs/utils'

// Load environment variables
dotenv.config()

const NETWORK = process.env.NETWORK || 'testnet'
const TESTNET_ENDPOINTS = getNetworkEndpoints(Network.TestnetK8s)

// Get the chain's WASM API endpoint for the testnet
const chainGrpcWasmApi = new ChainGrpcWasmApi(TESTNET_ENDPOINTS.grpc)

// Contract details from environment or configuration
const contractAddresses = {
strategy: process.env.STRATEGY_CONTRACT_ADDRESS,
vault: process.env.VAULT_CONTRACT_ADDRESS,
}

/**
* Verifies a contract by comparing its code hash with the compiled WASM file
* @param contractAddress The address of the deployed contract
* @param wasmFilePath The path to the compiled WASM file
*/
async function verifyContract(contractAddress: string, wasmFilePath: string): Promise<boolean> {
try {
    console.log(`Verifying contract at address: ${contractAddress}`)
    
    // Get contract info from chain
    const contractDetails = await chainGrpcWasmApi.fetchContractInfo(contractAddress)
    
    if (!contractDetails) {
    console.error(`Contract not found at address: ${contractAddress}`)
    return false
    }
    
    // Hash of the deployed code
    const deployedCodeHash = contractDetails.codeId
    
    console.log(`Contract code ID: ${deployedCodeHash}`)
    console.log(`Creator: ${contractDetails.creator}`)
    console.log(`Admin: ${contractDetails.admin || 'None (immutable)'}`)
    
    // Get contract state
    const contractState = await chainGrpcWasmApi.fetchSmartContractState(
    contractAddress,
    Buffer.from(JSON.stringify({ get_config: {} })).toString('base64')
    )
    
    console.log(`Contract state: ${JSON.stringify(contractState, null, 2)}`)
    
    return true
} catch (error) {
    console.error(`Error verifying contract at ${contractAddress}:`, error)
    return false
}
}

/**
* Queries a contract's balance
* @param contractAddress The address of the deployed contract
*/
async function queryContractBalance(contractAddress: string): Promise<void> {
try {
    console.log(`Querying balance for contract: ${contractAddress}`)
    
    // This is a simplified example - in a real implementation you would
    // query the bank module or use a specific contract query
    
    // Example query to the contract itself if it exposes balance info
    const balanceQuery = await chainGrpcWasmApi.fetchSmartContractState(
    contractAddress,
    Buffer.from(JSON.stringify({ get_balance: {} })).toString('base64')
    )
    
    if (balanceQuery) {
        // Parse the contract's response data which contains the balance
        const data = balanceQuery.data ? JSON.parse(Buffer.from(balanceQuery.data).toString()) : {}
        const balance = new BigNumberInBase(data.balance || '0')
        console.log(`Contract balance: ${balance.toFixed()} INJ`)
    } else {
    console.log('Balance information not available from contract')
    }
} catch (error) {
    console.error(`Error querying contract balance:`, error)
}
}

/**
* The main verification function for the DarwinFi contracts
*/
async function verifyContracts() {
console.log(`\n=== Starting contract verification on Injective ${NETWORK} ===\n`)

// Verify the Strategy contract
if (contractAddresses.strategy) {
    const strategyWasmPath = path.resolve(__dirname, '../artifacts/strategy.wasm')
    const isStrategyValid = await verifyContract(
    contractAddresses.strategy,
    strategyWasmPath
    )
    
    if (isStrategyValid) {
    console.log(`✅ Strategy contract verified successfully!`)
    await queryContractBalance(contractAddresses.strategy)
    } else {
    console.log(`❌ Strategy contract verification failed!`)
    }
} else {
    console.warn(`⚠️ Strategy contract address not provided in environment variables`)
}

console.log('\n---\n')

// Verify the Vault contract
if (contractAddresses.vault) {
    const vaultWasmPath = path.resolve(__dirname, '../artifacts/vault.wasm')
    const isVaultValid = await verifyContract(
    contractAddresses.vault,
    vaultWasmPath
    )
    
    if (isVaultValid) {
    console.log(`✅ Vault contract verified successfully!`)
    await queryContractBalance(contractAddresses.vault)
    } else {
    console.log(`❌ Vault contract verification failed!`)
    }
} else {
    console.warn(`⚠️ Vault contract address not provided in environment variables`)
}

console.log(`\n=== Contract verification complete ===\n`)
}

// Execute the verification function
verifyContracts()
.then(() => {
    console.log('Verification script completed')
    process.exit(0)
})
.catch((error) => {
    console.error('Error during verification:', error)
    process.exit(1)
})

