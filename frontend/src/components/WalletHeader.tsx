import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { formatEther } from 'ethers/lib/utils';
import WalletModal from './WalletModal';

const WalletHeader: React.FC = () => {
const { 
    isConnected, 
    address, 
    balance, 
    connect, 
    disconnect 
} = useWallet();

const [isModalOpen, setIsModalOpen] = useState(false);

// Format wallet address for display (truncate middle)
const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

return (
    <div className="flex items-center gap-4">
    {isConnected ? (
        <>
        <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-gray-300">
            {formatAddress(address)}
            </span>
            <span className="text-xs text-gray-400">
            {balance ? `${parseFloat(formatEther(balance)).toFixed(4)} INJ` : '0 INJ'}
            </span>
        </div>
        <button
            onClick={() => disconnect()}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
        >
            Disconnect
        </button>
        </>
    ) : (
        <button
        onClick={() => setIsModalOpen(true)}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
        Connect Wallet
        </button>
    )}
    
    {/* Wallet Connection Modal */}
    {isModalOpen && (
        <WalletModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        />
    )}
    </div>
);
};

export default WalletHeader;

