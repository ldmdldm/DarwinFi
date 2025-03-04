import React, { useState, useContext, useEffect } from 'react';
import { WalletContext } from '../contexts/WalletContext';
import { WalletType } from '../services/WalletService';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

// Wallet icons/images
const walletIcons = {
keplr: '/icons/keplr.svg',
metamask: '/icons/metamask.svg',
leap: '/icons/leap.svg',
cosmostation: '/icons/cosmostation.svg',
walletconnect: '/icons/walletconnect.svg',
};

interface WalletModalProps {
isOpen: boolean;
onClose: () => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
const { connectWallet, isConnecting, error } = useContext(WalletContext);
const [connectingWallet, setConnectingWallet] = useState<string | null>(null);

// Clear connecting state when modal closes
useEffect(() => {
    if (!isOpen) {
    setConnectingWallet(null);
    }
}, [isOpen]);

const handleWalletConnect = async (walletType: WalletType) => {
    setConnectingWallet(walletType);
    try {
    await connectWallet(walletType);
    onClose();
    } catch (err) {
    console.error('Failed to connect wallet:', err);
    } finally {
    setConnectingWallet(null);
    }
};

const walletOptions = [
    { id: 'keplr', name: 'Keplr', type: WalletType.KEPLR, icon: walletIcons.keplr },
    { id: 'metamask', name: 'MetaMask', type: WalletType.METAMASK, icon: walletIcons.metamask },
    { id: 'leap', name: 'Leap', type: WalletType.LEAP, icon: walletIcons.leap },
    { id: 'cosmostation', name: 'Cosmostation', type: WalletType.COSMOSTATION, icon: walletIcons.cosmostation },
    { id: 'walletconnect', name: 'WalletConnect', type: WalletType.WALLETCONNECT, icon: walletIcons.walletconnect },
];

return (
    <Transition show={isOpen} as={React.Fragment}>
    <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
        as={React.Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        >
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>
        
        <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
            >
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white dark:bg-gray-800 p-6 shadow-xl transition-all">
                <div className="flex items-center justify-between mb-5">
                <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white">
                    Connect Wallet
                </Dialog.Title>
                <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={onClose}
                >
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
                </div>
                
                <div className="mt-4 space-y-2">
                {error && (
                    <div className="p-3 bg-red-100 text-red-700 rounded-lg mb-4">
                    {error}
                    </div>
                )}
                
                <div className="grid grid-cols-1 gap-3">
                    {walletOptions.map((wallet) => (
                    <button
                        key={wallet.id}
                        className={`flex items-center justify-between w-full p-4 rounded-lg border ${
                        connectingWallet === wallet.type
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                            : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-indigo-700 dark:hover:bg-gray-700/30'
                        } transition-all duration-200`}
                        onClick={() => handleWalletConnect(wallet.type)}
                        disabled={isConnecting}
                    >
                        <div className="flex items-center">
                        <div className="h-8 w-8 flex-shrink-0 mr-3">
                            <img src={wallet.icon} alt={wallet.name} className="h-8 w-8" onError={(e) => {
                            (e.target as HTMLImageElement).src = '/icons/wallet-default.svg';
                            }} />
                        </div>
                        <span className="text-left font-medium text-gray-900 dark:text-white">
                            {wallet.name}
                        </span>
                        </div>
                        {connectingWallet === wallet.type && (
                        <div className="ml-3 h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
                        )}
                    </button>
                    ))}
                </div>
                
                <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
                    By connecting your wallet, you agree to our Terms of Service and Privacy Policy
                </p>
                </div>
            </Dialog.Panel>
            </Transition.Child>
        </div>
        </div>
    </Dialog>
    </Transition>
);
};

export default WalletModal;

