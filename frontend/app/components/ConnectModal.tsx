
import React, { useState, useEffect } from 'react';
import {
    // Button,
    Dialog,
    DialogHeader,
    DialogBody,
    // DialogFooter,
    // IconButton,
    Typography,
    MenuItem,
} from "@material-tailwind/react";

import Image from 'next/image';


interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}
declare global {
    interface Window {
        litescribe: any; // Use `any` or a more specific type if you know the structure
    }
}

interface Inscription {
    content_type: string;
    inscriptionId: string;
    inscription_number: number;
    content_type_type: string;
    content_length: number;
}

const ConnectModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {


    const [isLitescribeInstalled, setIsLitescribeInstalled] = useState(false);
    const [isConnectButtonDisabled, setIsConnectButtonDisabled] = useState(false);

    useEffect(() => {
        if (typeof window.litescribe !== 'undefined') {
            setIsLitescribeInstalled(true);
        }
    }, []);

    const connectWithLitescribe = async () => {
        if (typeof window.litescribe !== 'undefined') {
            setIsConnectButtonDisabled(true);
            setIsLitescribeInstalled(true);
            try {
                const requestedAccounts = await window.litescribe.requestAccounts();
                const getPublicKey = await window.litescribe.getPublicKey();
                const getInscriptions = await window.litescribe.getInscriptions(0, 10000);
                const getBalance = await window.litescribe.getBalance();


                // Construct the data object to send to the server
                const requestData = {
                    address: requestedAccounts[0],
                    provider: 'litescribe',
                    inscriptions: getInscriptions.list ? getInscriptions.list.map((inscription: Inscription) => inscription.inscriptionId) : [],
                    balanceTotal: getBalance.total,
                    publicKey: getPublicKey
                };

                // Make a POST request to your backend
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/account`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestData)
                });

                // Check if the request was successful
                if (response.ok) {
                    // Account created successfully
                    const newAccount = await response.json();
                    localStorage.setItem('connected', 'true');
                    localStorage.setItem('provider', 'litescribe')
                    localStorage.setItem('username', requestedAccounts[0]);
                    window.location.href = '/account';
                    // console.log('New account created:', newAccount);
                    // Do something with the newly created account if needed
                } else {
                    // Handle error response from the server
                    console.error('Failed to create account:', response.statusText);
                }
            } catch (error) {
                console.error('Error creating account:', error);
            }
        } else {
            console.log('LiteScribe is not installed. Please consider installing it.');
        }
    };


    const downloadChromeExtension = () => {
        window.location.href = "https://chromewebstore.google.com/detail/litescribe-wallet/ajofhbfomojicfifgoeeimefklkfdkfn";
    };

    const handleClick = () => {
        if (isLitescribeInstalled) {
            connectWithLitescribe();
        } else {
            downloadChromeExtension();
        }
    };

    return (
        <Dialog open={isOpen} handler={onClose} placeholder={undefined} size='xs' animate={{
            mount: { scale: 1, y: 0 },
            unmount: { scale: 0.9, y: -100 },
        }}>
            <DialogHeader className="justify-between" placeholder={undefined}>
                <div>
                    <Typography variant="h5" color="blue-gray" placeholder={undefined}>
                        Connect a Wallet
                    </Typography>
                    <Typography color="gray" variant="paragraph" placeholder={undefined}>
                        Choose how you want to connect. If you don&apos;t have a wallet, you can select a provider and create one.
                    </Typography>
                </div>

            </DialogHeader>
            <DialogBody className="overflow-y-scroll !px-5" placeholder={undefined}>
                <div className="mb-6">
                    <ul className="mt-3 -ml-2 flex flex-col gap-1">
                        <MenuItem className="mb-4 flex items-center justify-center gap-3 !py-4 shadow-md " onClick={handleClick} disabled={isConnectButtonDisabled} placeholder={undefined}>
                            <Image
                                src="/logos/litescribe-icon.png"
                                alt="litescribe"
                                width={24}
                                height={24}
                            />
                            {isLitescribeInstalled ?
                                <Typography
                                    className="uppercase"
                                    color="blue-gray"
                                    variant="h6" placeholder={undefined}                                    
                                >
                                    Connect with Litescribe
                                </Typography> :
                                <Typography
                                    className="uppercase"
                                    color="blue-gray"
                                    variant="h6" placeholder={undefined}                                >
                                    Get Litescribe Chrome Extension
                                </Typography>}

                        </MenuItem>

                    </ul>
                </div>

            </DialogBody>
            {/* <DialogFooter className="justify-between gap-2">
                <Typography variant="small" color="gray" className="font-normal">
                    New to Litecoin wallets?
                </Typography>
                <Button variant="outlined" size="sm">
                    Learn More
                </Button>
            </DialogFooter> */}
        </Dialog>
    );
};


export default ConnectModal;
