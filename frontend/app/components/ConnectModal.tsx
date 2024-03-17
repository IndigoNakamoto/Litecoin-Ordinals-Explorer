
import React, { useState, useEffect } from 'react';
import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    IconButton,
    Typography,
    MenuItem,
} from "@material-tailwind/react";

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
    inscription_id: string;
    inscription_number: number;
    content_type_type: string;
    content_length: number;
}

const ConnectModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {

    useEffect(() => {
        const connectWallet = async () => {
            if (typeof window.litescribe !== 'undefined') {
                console.log('LiteScribe is installed!');
                const fetchedInscriptions = await window.litescribe.getInscriptions();
                console.log('inscriptions: ', fetchedInscriptions)
                // const InscriptionTranslated: Inscription[] = fetchedInscriptions.list.map((inscription: { inscriptionId: string; inscriptionNumber: number; contentType: string, content_type_type: string, contentLength: number }) => ({
                //     inscription_id: inscription.inscriptionId,
                //     inscription_number: inscription.inscriptionNumber,
                //     content_type: inscription.contentType,
                //     content_type_type: inscription.contentType.split('/')[0],
                //     content_length: inscription.contentLength
                // }));

            } else {
                console.log('LiteScribe is not installed. Please consider installing it.');
            }
        }
        connectWallet();
    }, []);

    return (
        <Dialog open={isOpen} handler={onClose} placeholder={undefined} size='xs' animate={{
            mount: { scale: 1, y: 0 },
            unmount: { scale: 0.9, y: -100 },
        }}>
            <DialogHeader className="justify-between">
                <div>
                    <Typography variant="h5" color="blue-gray">
                        Connect a Wallet
                    </Typography>
                    <Typography color="gray" variant="paragraph">
                        Choose how you want to connect. If you don't have a wallet, you can select a provider and create one.
                    </Typography>
                </div>

            </DialogHeader>
            <DialogBody className="overflow-y-scroll !px-5">
                <div className="mb-6">
                    <ul className="mt-3 -ml-2 flex flex-col gap-1">
                        <MenuItem className="mb-4 flex items-center justify-center gap-3 !py-4 shadow-md">
                            <img
                                src="/logos/litescribe-icon.png"
                                alt="litescribe"
                                className="h-6 w-6"
                            />
                            <Typography
                                className="uppercase"
                                color="blue-gray"
                                variant="h6"
                            >
                                Connect with Litescribe
                            </Typography>
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