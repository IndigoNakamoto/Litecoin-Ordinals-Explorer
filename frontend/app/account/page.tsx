'use client'

import { useEffect, useState } from "react";
import { Avatar, Button } from "@material-tailwind/react";

import { InscriptionCard } from '../components/inscriptionCard';
import ConnectModal from '../components/ConnectModal';
import {
    WALLET_SESSION_EVENT,
    getStoredWalletSession,
} from '../lib/walletSession';

interface WalletInscription {
    inscription_id: string;
    inscription_number: number;
    content_type: string;
    content_type_type: string;
    content_length: number;
}

declare global {
    interface Window {
        litescribe: any;
    }
}

const normalizeInscriptions = (rawValue: string | null): WalletInscription[] => {
    if (!rawValue) {
        return [];
    }

    try {
        const parsed: unknown = JSON.parse(rawValue);
        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed
            .map((item: any) => {
                if (item?.inscription_id && item?.content_type) {
                    return item as WalletInscription;
                }

                if (item?.inscriptionId && item?.contentType) {
                    return {
                        inscription_id: item.inscriptionId,
                        inscription_number: item.inscriptionNumber,
                        content_type: item.contentType,
                        content_type_type: item.contentType.split('/')[0],
                        content_length: item.contentLength ?? 0,
                    } satisfies WalletInscription;
                }

                return null;
            })
            .filter((item): item is WalletInscription => Boolean(item));
    } catch (error) {
        console.error('Failed to parse stored inscriptions:', error);
        return [];
    }
};

export default function Page() {
    const [balance, setBalance] = useState<string>('0');
    const [inscriptions, setInscriptions] = useState<WalletInscription[]>([]);
    const [total, setTotal] = useState<string>('0');
    const [username, setUsername] = useState<string>('');
    const [copySuccess, setCopySuccess] = useState<boolean>(false);
    const [isConnected, setIsConnected] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const syncFromStorage = () => {
            const session = getStoredWalletSession();
            setIsConnected(session.connected);
            setBalance(session.balance);
            setTotal(session.total);
            setUsername(session.username);
            setInscriptions(normalizeInscriptions(localStorage.getItem('inscriptions')));
        };

        syncFromStorage();
        window.addEventListener('storage', syncFromStorage);
        window.addEventListener(WALLET_SESSION_EVENT, syncFromStorage);

        return () => {
            window.removeEventListener('storage', syncFromStorage);
            window.removeEventListener(WALLET_SESSION_EVENT, syncFromStorage);
        };
    }, []);

    const sumContentLength = (objects: WalletInscription[]) => {
        return objects.reduce((currentTotal, obj) => currentTotal + obj.content_length, 0);
    };

    const handleUsernameClick = async () => {
        await navigator.clipboard.writeText(username);
        setCopySuccess(true);
        setTimeout(() => {
            setCopySuccess(false);
        }, 2000);
    };

    if (!isConnected) {
        return (
            <>
                <div className="mx-auto max-w-screen-md p-8 pb-16 text-center">
                    <h1 className="text-3xl font-medium">Your Account</h1>
                    <p className="mt-4 text-gray-400">
                        Connect your wallet to view inscriptions, balances, and account activity.
                    </p>
                    <Button
                        className="mt-6"
                        color="blue"
                        onClick={() => setIsModalOpen(true)}
                        placeholder={undefined}
                    >
                        Connect Wallet
                    </Button>
                </div>
                <ConnectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            </>
        );
    }

    return (
        <div className="mx-auto max-w-screen-2xl p-4 pb-16">
            <div className="flex w-full items-center justify-center pt-4">
                <div className="flex gap-8 px-8">
                    <div className="flex-shrink-0">
                        <Avatar alt="avatar" variant="circular" src='/avatar-bgwhite.png' placeholder={undefined} size="xxl" />
                    </div>

                    <div className="flex-grow">
                        <div className="mb-2 flex w-[400px] items-center justify-between">
                            <div className="flex w-full flex-grow items-center">
                                {copySuccess ? (
                                    <span className="text-blue-500 animate-fadeInOut">Copied!</span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleUsernameClick}
                                        className="overflow-hidden text-ellipsis whitespace-nowrap text-left hover:underline"
                                    >
                                        {username}
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <h2 className="text-sm text-stone-200">{total} Inscriptions</h2>
                            </div>
                            <div>
                                <h2 className="text-sm text-stone-200">{Math.round(sumContentLength(inscriptions) / 1000)} KB</h2>
                            </div>
                            <div>
                                <h2 className="text-sm text-stone-200">{balance} LTC</h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="my-8 w-full border-t border-stone-800"></div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 normal:grid-cols-5">
                {inscriptions.map((inscription) => (
                    <div key={inscription.inscription_id}>
                        <InscriptionCard {...inscription} shouldLoadPreview />
                    </div>
                ))}
            </div>
        </div>
    );
}
