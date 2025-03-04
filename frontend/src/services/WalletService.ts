import { 
ChainId, 
EthereumChainId,
getNetworkEndpoints,
getNetworkInfo,
Network
} from '@injectivelabs/networks'
import { 
WalletStrategy, 
Wallet, 
ConcreteWalletStrategy, 
WALLET_CONNECTORS 
} from '@injectivelabs/wallet-ts'
import { 
AccountAddress, 
ChainId as ChainIdEnum 
} from '@injectivelabs/sdk-ts'
import { ethers } from 'ethers'
import { BehaviorSubject, Observable } from 'rxjs'

export interface WalletInfo {
address: string
chainId: string
isConnected: boolean
walletType: string
}

export class WalletService {
private walletStrategy: WalletStrategy
private network: Network
private chainId: ChainId
private ethereumChainId: EthereumChainId

private _walletInfo = new BehaviorSubject<WalletInfo>({
    address: '',
    chainId: '',
    isConnected: false,
    walletType: ''
})

constructor(network: Network = Network.TestnetK8s) {
    this.network = network
    this.chainId = getNetworkInfo(network).chainId as ChainId
    this.ethereumChainId = getNetworkInfo(network).ethereumChainId as EthereumChainId
    
    // Initialize wallet strategy
    this.walletStrategy = new ConcreteWalletStrategy({
    chainId: this.chainId,
    ethereumChainId: this.ethereumChainId,
    endpoints: getNetworkEndpoints(network)
    })
}

get walletInfo(): WalletInfo {
    return this._walletInfo.getValue()
}

get walletInfo$(): Observable<WalletInfo> {
    return this._walletInfo.asObservable()
}

/**
* Get the current wallet information
* @returns The current wallet information
*/
getCurrentWallet(): WalletInfo {
    return this.walletInfo
}

/**
* Connect to a wallet using the specified connector type
* @param walletType The type of wallet to connect to (keplr, metamask, etc.)
* @returns The address of the connected wallet
*/
async connectWallet(walletType: Wallet): Promise<string> {
    try {
    // Get the wallet connector for the specified wallet type
    const connector = this.walletStrategy.getWalletConnector(walletType)
    
    // Connect to the wallet
    await connector.connect()
    
    // Get the account address
    const address = await connector.getAddresses()
    const injectiveAddress = address[0]
    
    // Update wallet info
    this._walletInfo.next({
        address: injectiveAddress,
        chainId: this.chainId,
        isConnected: true,
        walletType: walletType.toString()
    })
    
    console.log(`Connected to ${walletType} wallet: ${injectiveAddress}`)
    return injectiveAddress
    } catch (error) {
    console.error(`Error connecting to ${walletType} wallet:`, error)
    throw new Error(`Failed to connect to ${walletType} wallet: ${error.message}`)
    }
}

/**
* Connect to Keplr wallet
* @returns The address of the connected wallet
*/
async connectKeplr(): Promise<string> {
    return this.connectWallet(Wallet.Keplr)
}

/**
* Connect to Metamask wallet
* @returns The address of the connected wallet
*/
async connectMetamask(): Promise<string> {
    return this.connectWallet(Wallet.Metamask)
}

/**
* Connect to Leap wallet
* @returns The address of the connected wallet
*/
async connectLeap(): Promise<string> {
    return this.connectWallet(Wallet.Leap)
}

/**
* Connect to Cosmostation wallet
* @returns The address of the connected wallet
*/
async connectCosmostation(): Promise<string> {
    return this.connectWallet(Wallet.Cosmostation)
}

/**
* Disconnect the current wallet
*/
async disconnectWallet(): Promise<void> {
    try {
    // If no wallet is connected, just return
    if (!this.walletInfo.isConnected) {
        return
    }
    
    // Get the wallet connector for the current wallet type
    const walletType = this.walletInfo.walletType as Wallet
    const connector = this.walletStrategy.getWalletConnector(walletType)
    
    // Disconnect from the wallet
    await connector.disconnect()
    
    // Update wallet info
    this._walletInfo.next({
        address: '',
        chainId: '',
        isConnected: false,
        walletType: ''
    })
    
    console.log('Disconnected from wallet')
    } catch (error) {
    console.error('Error disconnecting wallet:', error)
    throw new Error(`Failed to disconnect wallet: ${error.message}`)
    }
}

/**
/**
* Get the current account address
* @returns The current account address
*/
getAddress(): string {
    return this.walletInfo.address
}

/**
* Subscribe to account changes
* @param callback The callback function to execute when the account changes
* @returns A subscription object that can be used to unsubscribe
*/
subscribeToAccountChange(callback: (address: string) => void): { unsubscribe: () => void } {
    const subscription = this.walletInfo$.subscribe(walletInfo => {
        callback(walletInfo.address)
    })
    
    return {
        unsubscribe: () => subscription.unsubscribe()
    }
}

/**
* Unsubscribe from account changes
* @param subscription The subscription object to unsubscribe
*/
unsubscribeFromAccountChange(subscription: { unsubscribe: () => void }): void {
    if (subscription) {
        subscription.unsubscribe()
    }
}
/**
* Check if a wallet is connected
* @returns True if a wallet is connected, false otherwise
*/
isConnected(): boolean {
    return this.walletInfo.isConnected
}

/**
/**
* Get the current chain ID
* @returns The current chain ID
*/
getChainId(): string {
    return this.walletInfo.chainId
}

/**
* Subscribe to chain changes
* @param callback The callback function to execute when the chain changes
* @returns A subscription object that can be used to unsubscribe
*/
subscribeToChainChange(callback: (chainId: string) => void): { unsubscribe: () => void } {
    const subscription = this.walletInfo$.subscribe(walletInfo => {
        callback(walletInfo.chainId)
    })
    
    return {
        unsubscribe: () => subscription.unsubscribe()
    }
}

/**
* Unsubscribe from chain changes
* @param subscription The subscription object to unsubscribe
*/
unsubscribeFromChainChange(subscription: { unsubscribe: () => void }): void {
    if (subscription) {
        subscription.unsubscribe()
    }
}
/**
* Get the current wallet type
* @returns The current wallet type
*/
getWalletType(): string {
    return this.walletInfo.walletType
}

/**
* Get the balance of the current wallet
* @returns The balance of the current wallet
*/
async getBalance(): Promise<{ denom: string, amount: string }[]> {
    try {
    if (!this.walletInfo.isConnected) {
        throw new Error('No wallet connected')
    }
    
    const walletType = this.walletInfo.walletType as Wallet
    const connector = this.walletStrategy.getWalletConnector(walletType)
    
    // Get the balance
    const address = AccountAddress.fromBech32(this.walletInfo.address)
    const balances = await connector.fetchBalance(address)
    
    return balances.map(balance => ({
        denom: balance.denom,
        amount: balance.amount
    }))
    } catch (error) {
    console.error('Error getting wallet balance:', error)
    throw new Error(`Failed to get wallet balance: ${error.message}`)
    }
}

/**
* Get the list of available wallet types
* @returns Array of available wallet types
*/
getAvailableWallets(): Wallet[] {
    return Object.values(Wallet).filter(wallet => 
    WALLET_CONNECTORS[wallet] && 
    this.walletStrategy.getWalletConnector(wallet).isWalletInstalled()
    )
}

/**
* Check if a specific wallet type is installed
* @param walletType The type of wallet to check
* @returns True if the wallet is installed, false otherwise
*/
isWalletInstalled(walletType: Wallet): boolean {
    const connector = this.walletStrategy.getWalletConnector(walletType)
    return connector.isWalletInstalled()
}

/**
* Sign a message with the connected wallet
* @param message The message to sign
* @returns The signature
*/
async signMessage(message: string): Promise<string> {
    try {
    if (!this.walletInfo.isConnected) {
        throw new Error('No wallet connected')
    }
    
    const walletType = this.walletInfo.walletType as Wallet
    const connector = this.walletStrategy.getWalletConnector(walletType)
    
    // Sign the message
    const signature = await connector.signMessage(message)
    return signature
    } catch (error) {
    console.error('Error signing message:', error)
    throw new Error(`Failed to sign message: ${error.message}`)
    }
}
}

// Export a singleton instance
export const walletService = new WalletService()

