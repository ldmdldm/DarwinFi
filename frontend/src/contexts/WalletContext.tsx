import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';

// Define the supported wallet types
export enum WalletType {
KEPLR = 'keplr',
METAMASK = 'metamask',
LEAP = 'leap',
COSMOSTATION = 'cosmostation',
WALLETCONNECT = 'walletconnect',
NONE = 'none'
}

// Wallet connection states
export enum ConnectionStatus {
DISCONNECTED = 'disconnected',
CONNECTING = 'connecting',
CONNECTED = 'connected',
ERROR = 'error'
}

// Interface for wallet context
interface WalletContextType {
// State
currentWallet: WalletType;
address: string;
balance: string;
chainId: string;
connectionStatus: ConnectionStatus;
error: string | null;

// Functions
connectWallet: (walletType: WalletType) => Promise<boolean>;
disconnectWallet: () => Promise<void>;
getBalance: () => Promise<string>;
refreshBalance: () => Promise<void>;
signMessage: (message: string) => Promise<string>;
executeTransaction: (transactionData: any) => Promise<any>;
isWalletInstalled: (walletType: WalletType) => boolean;
getSupportedWallets: () => WalletType[];
getWalletDisplayName: (walletType: WalletType) => string;
getWalletIcon: (walletType: WalletType) => string;
}

// Default context values
const defaultWalletContext: WalletContextType = {
currentWallet: WalletType.NONE,
address: '',
balance: '0',
chainId: '',
connectionStatus: ConnectionStatus.DISCONNECTED,
error: null,

connectWallet: async () => false,
disconnectWallet: async () => {},
getBalance: async () => '0',
refreshBalance: async () => {},
signMessage: async () => '',
executeTransaction: async () => ({}),
isWalletInstalled: () => false,
getSupportedWallets: () => [],
getWalletDisplayName: () => '',
getWalletIcon: () => ''
};

// Create context
const WalletContext = createContext<WalletContextType>(defaultWalletContext);

// Wallet provider props interface
interface WalletProviderProps {
children: ReactNode;
}

// Local storage keys
const WALLET_TYPE_KEY = 'darwinfi-wallet-type';

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
// State
const [currentWallet, setCurrentWallet] = useState<WalletType>(WalletType.NONE);
const [address, setAddress] = useState<string>('');
const [balance, setBalance] = useState<string>('0');
const [chainId, setChainId] = useState<string>('');
const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
const [error, setError] = useState<string | null>(null);
const [provider, setProvider] = useState<any>(null);

// Initialize wallet from local storage
useEffect(() => {
    const savedWalletType = localStorage.getItem(WALLET_TYPE_KEY) as WalletType;
    if (savedWalletType && savedWalletType !== WalletType.NONE) {
    connectWallet(savedWalletType).catch(err => {
        console.error('Failed to reconnect wallet:', err);
    });
    }
}, []);

// Helper function to check if a wallet is installed
const isWalletInstalled = (walletType: WalletType): boolean => {
    switch (walletType) {
    case WalletType.KEPLR:
        return typeof window.keplr !== 'undefined';
    case WalletType.METAMASK:
        return typeof window.ethereum !== 'undefined';
    case WalletType.LEAP:
        return typeof window.leap !== 'undefined';
    case WalletType.COSMOSTATION:
        return typeof window.cosmostation !== 'undefined';
    default:
        return false;
    }
};

// Get supported wallets based on browser environment
const getSupportedWallets = (): WalletType[] => {
    const wallets: WalletType[] = [];
    
    if (isWalletInstalled(WalletType.KEPLR)) {
    wallets.push(WalletType.KEPLR);
    }
    
    if (isWalletInstalled(WalletType.METAMASK)) {
    wallets.push(WalletType.METAMASK);
    }
    
    if (isWalletInstalled(WalletType.LEAP)) {
    wallets.push(WalletType.LEAP);
    }
    
    if (isWalletInstalled(WalletType.COSMOSTATION)) {
    wallets.push(WalletType.COSMOSTATION);
    }
    
    // WalletConnect doesn't require browser extension
    wallets.push(WalletType.WALLETCONNECT);
    
    return wallets;
};

// Get wallet display name
const getWalletDisplayName = (walletType: WalletType): string => {
    switch (walletType) {
    case WalletType.KEPLR:
        return 'Keplr Wallet';
    case WalletType.METAMASK:
        return 'MetaMask';
    case WalletType.LEAP:
        return 'Leap Wallet';
    case WalletType.COSMOSTATION:
        return 'Cosmostation';
    case WalletType.WALLETCONNECT:
        return 'WalletConnect';
    default:
        return 'Unknown Wallet';
    }
};

// Get wallet icon path
const getWalletIcon = (walletType: WalletType): string => {
    switch (walletType) {
    case WalletType.KEPLR:
        return '/icons/keplr.svg';
    case WalletType.METAMASK:
        return '/icons/metamask.svg';
    case WalletType.LEAP:
        return '/icons/leap.svg';
    case WalletType.COSMOSTATION:
        return '/icons/cosmostation.svg';
    case WalletType.WALLETCONNECT:
        return '/icons/walletconnect.svg';
    default:
        return '/icons/wallet-default.svg';
    }
};

// Connect wallet function
const connectWallet = async (walletType: WalletType): Promise<boolean> => {
    try {
    setConnectionStatus(ConnectionStatus.CONNECTING);
    setError(null);
    
    // Handle different wallet types
    switch (walletType) {
        case WalletType.KEPLR:
        await connectKeplr();
        break;
        case WalletType.METAMASK:
        await connectMetamask();
        break;
        case WalletType.LEAP:
        await connectLeap();
        break;
        case WalletType.COSMOSTATION:
        await connectCosmostation();
        break;
        case WalletType.WALLETCONNECT:
        await connectWalletConnect();
        break;
        default:
        throw new Error('Unsupported wallet type');
    }
    
    // Save wallet type to local storage
    localStorage.setItem(WALLET_TYPE_KEY, walletType);
    setCurrentWallet(walletType);
    
    // Get wallet balance
    await refreshBalance();
    
    setConnectionStatus(ConnectionStatus.CONNECTED);
    return true;
    } catch (err: any) {
    console.error('Wallet connection error:', err);
    setConnectionStatus(ConnectionStatus.ERROR);
    setError(err.message || 'Failed to connect wallet');
    return false;
    }
};

// Connect to Keplr wallet
const connectKeplr = async (): Promise<void> => {
    if (!window.keplr) {
    throw new Error('Keplr wallet not found. Please install the Keplr browser extension.');
    }
    
    // Enable Keplr for Injective chain
    await window.keplr.enable('injective-1');
    
    // Get wallet address
    const accounts = await window.keplr.getOfflineSigner('injective-1').getAccounts();
    const userAddress = accounts[0].address;
    setAddress(userAddress);
    
    // Set chain ID
    setChainId('injective-1');
    
    // Subscribe to account changes
    window.addEventListener('keplr_keystorechange', handleKeplrChange);
};

// Handle Keplr account changes
const handleKeplrChange = async () => {
    try {
    const accounts = await window.keplr.getOfflineSigner('injective-1').getAccounts();
    setAddress(accounts[0].address);
    await refreshBalance();
    } catch (err) {
    console.error('Failed to update Keplr account:', err);
    }
};

// Connect to MetaMask wallet
const connectMetamask = async (): Promise<void> => {
    if (!window.ethereum) {
    throw new Error('MetaMask not found. Please install the MetaMask browser extension.');
    }
    
    // Create provider
    const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(ethProvider);
    
    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const userAddress = accounts[0];
    setAddress(userAddress);
    
    // Get network
    const network = await ethProvider.getNetwork();
    setChainId(network.chainId.toString());
    
    // Subscribe to account changes
    window.ethereum.on('accountsChanged', handleMetamaskAccountsChanged);
    window.ethereum.on('chainChanged', handleMetamaskChainChanged);
};

// Handle MetaMask account changes
const handleMetamaskAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
    // User disconnected their wallet
    disconnectWallet();
    } else {
    setAddress(accounts[0]);
    refreshBalance();
    }
};

// Handle MetaMask chain changes
const handleMetamaskChainChanged = (chainId: string) => {
    setChainId(parseInt(chainId, 16).toString());
    refreshBalance();
};

// Connect to Leap wallet
const connectLeap = async (): Promise<void> => {
    if (!window.leap) {
    throw new Error('Leap wallet not found. Please install the Leap browser extension.');
    }
    
    // Enable Leap for Injective chain
    await window.leap.enable('injective-1');
    
    // Get wallet address
    const accounts = await window.leap.getOfflineSigner('injective-1').getAccounts();
    const userAddress = accounts[0].address;
    setAddress(userAddress);
    
    // Set chain ID
    setChainId('injective-1');
    
    // Subscribe to account changes
    window.addEventListener('leap_keystorechange', handleLeapChange);
};

// Handle Leap account changes
const handleLeapChange = async () => {
    try {
    const accounts = await window.leap.getOfflineSigner('injective-1').getAccounts();
    setAddress(accounts[0].address);
    await refreshBalance();
    } catch (err) {
    console.error('Failed to update Leap account:', err);
    }
};

// Connect to Cosmostation wallet
const connectCosmostation = async (): Promise<void> => {
    if (!window.cosmostation) {
    throw new Error('Cosmostation wallet not found. Please install the Cosmostation browser extension.');
    }
    
    // Request connection
    await window.cosmostation.cosmos.request({
    method: 'cos_requestAccount',
    params: { chainName: 'injective' }
    });
    
    // Get wallet address
    const account = await window.cosmostation.cosmos.request({
    method: 'cos_getAccount',
    params: { chainName: 'injective' }
    });
    
    setAddress(account.address);
    setChainId('injective-1');
};

// Connect to WalletConnect
const connectWalletConnect = async (): Promise<void> => {
    // This would typically use the WalletConnect client
    // For now, we'll just throw an error saying it's not implemented
    throw new Error('WalletConnect integration not implemented yet');
};

// Disconnect wallet
const disconnectWallet = async (): Promise<void> => {
    // Remove event listeners based on wallet type
    if (currentWallet === WalletType.KEPLR) {
    window.removeEventListener('keplr_keystorechange', handleKeplrChange);
    } else if (currentWallet === WalletType.METAMASK) {
    window.ethereum.removeListener('accountsChanged', handleMetamaskAccountsChanged);
    window.ethereum.removeListener('chainChanged', handleMetamaskChainChanged);
    } else if (currentWallet === WalletType.LEAP) {
    window.removeEventListener('leap_keystorechange', handleLeapChange);
    }
    
    // Reset state
    setCurrentWallet(WalletType.NONE);
    setAddress('');
    setBalance('0');
    setChainId('');
    setConnectionStatus(ConnectionStatus.DISCONNECTED);
    setError(null);
    setProvider(null);
    
    // Clear local storage
    localStorage.removeItem(WALLET_TYPE_KEY);
};

// Get wallet balance
const getBalance = async (): Promise<string> => {
    try {
    if (!address) {
        return '0';
    }
    
    if (currentWallet === WalletType.METAMASK && provider) {
        const balance = await provider.getBalance(address);
        return ethers.utils.formatEther(balance);
    } else if (currentWallet === WalletType.KEPLR && window.keplr) {
        // For Keplr, we would typically use the chain's query client
        // This is a simplified implementation
        const balance = await window.keplr.getBalances('injective-1', address);
        return balance[0]?.amount || '0';
    } else if (currentWallet === WalletType.LEAP && window.leap) {
        // Similar to Keplr
        const balance = await window.leap.getBalances('injective-1', address);
        return balance[0]?.amount || '0';
    } else if (currentWallet === WalletType.COSMOSTATION && window.cosmostation) {
        // For Cosmostation, we'd use their API
        // Simplified implementation
        return '0';
    }
    
    return '0';
    } catch (err) {
    console.error('Failed to get balance:', err);
    return '0';
    }


/**
* Function to execute a transaction
* @param {any} transactionData - Information about the transaction to execute
* @returns {Promise<any>} - Returns transaction result
*/
const executeTransaction = async (transactionData: any): Promise<any> => {
    try {
    switch (currentWallet) {
        case WalletType.KEPLR:
        // Implement Keplr transaction
        break;
        case WalletType.METAMASK:
        if (!provider) throw new Error('Provider not initialized');
        // Use ethers.js to send transaction
        break;
        default:
        throw new Error('Unsupported wallet type for transactions');
    }
    return {}; // Replace with actual transaction result
    } catch (error) {
    console.error('Transaction execution failed:', error);
    throw error;
    }
};

// Return the context values
return (
    <WalletContext.Provider value={{
    currentWallet,
    address,
    balance,
    chainId,
    connectionStatus,
    error,
    connectWallet,
    disconnectWallet,
    getBalance,
    refreshBalance,
    signMessage,
    executeTransaction,
    isWalletInstalled,
    getSupportedWallets,
    getWalletDisplayName,
    getWalletIcon
    }}>
    {children}
    </WalletContext.Provider>
);
}

export default WalletProvider;
