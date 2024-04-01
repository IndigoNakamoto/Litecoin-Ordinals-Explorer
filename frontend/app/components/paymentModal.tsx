import { Dialog, DialogBody, DialogHeader, Typography, Button } from "@material-tailwind/react";
import type { DialogHeaderStylesType } from "@material-tailwind/react";
import type { DialogBodyStylesType } from "@material-tailwind/react";
import { QRCode } from 'react-qrcode-logo';

import React, { useState, useEffect } from 'react';

function formatLitsToLitecoin(lits: number) {
    // const litsPerLitecoin = 100000000; // Number of lits in 1 Litecoin
    // const litecoins = lits / litsPerLitecoin;

    // Convert to a fixed number of digits after the decimal to prevent scientific notation for very small numbers
    let formattedLitecoins = lits.toFixed(8); // Ensures the result is a string with 8 decimal places

    // Split the result into whole and fraction parts
    let [whole, fraction] = formattedLitecoins.includes('.') ? formattedLitecoins.split('.') : [formattedLitecoins, '00000000'];

    // Format the fractional part with non-breaking spaces
    fraction = `${fraction.slice(0, 2)}\u00A0${fraction.slice(2, 5)}\u00A0${fraction.slice(5)}`;

    return `${whole}.${fraction}`;
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    // invoiceId: string;
    id: string;
    expirationTime: string;
    createdTime: string;
    due: string;
    metadata: Object;
    paymentLink: string;
    currency: string;
    LTC_USD: number;
    paymentAddress: string;
}

const PaymentModal: React.FC<ModalProps> = ({ isOpen, onClose, id, paymentAddress, expirationTime, createdTime, due, paymentLink, metadata, currency, LTC_USD }) => {
    const [paymentStatus, setPaymentStatus] = useState('New'); // New, Processing, Settled, Expired
    const [inscribeStatus, setInscribeStatus] = useState('Pending')
    const [invoice, setInvoice] = useState({});

    useEffect(() => {
        let intervalId: any;

        const fetchPaymentStatus = async () => {
            try {
                const response = await fetch(`http://localhost:3005/api/invoice/status/${id}`);
                const data = await response.json();

                const invoice = await fetch(`http://localhost:3005/api/invoice/${id}`);
                const invoiceData = await invoice.json();
                console.log('Invoice Data:', invoiceData)

                if (invoiceData) {
                    setInvoice(invoiceData);
                }

                console.log('Payment Status:', data.paymentStatus, 'ID:', id, 'isOpen:', isOpen)
                if (data.paymentStatus) {
                    setPaymentStatus(data.paymentStatus);
                }
                if (data.inscribeStatus) {
                    setInscribeStatus(data.inscribeStatus)
                }
            } catch (error) {
                console.error("Failed to fetch invoice status:", error);
            }
        };
        const shouldContinuePolling = isOpen && (inscribeStatus === 'Pending' || inscribeStatus === 'Processing');
        if (shouldContinuePolling) {
            fetchPaymentStatus(); // Fetch immediately when modal opens and conditions are met
            intervalId = setInterval(fetchPaymentStatus, 5000); // Then every 5 seconds
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId); // Cleanup on unmount or when conditions are not met anymore
            }
        };
    }, [isOpen, paymentStatus, id]);

    const [timeLeft, setTimeLeft] = useState('');

    const [showCopied, setShowCopied] = useState(false);
    const [copiedOpacity, setCopiedOpacity] = useState(0); // 0: invisible, 1: visible


    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(paymentAddress);
            setCopiedOpacity(1); // Make "Copied!" visible
            setTimeout(() => setCopiedOpacity(0), 2000); // Fade out after 2 seconds
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };


    useEffect(() => {
        const updateTimer = () => {
            const now = Math.floor(Date.now() / 1000); // Current time in Unix timestamp
            const timeDifference = Number(expirationTime) - now; // Difference in seconds
            if (timeDifference >= 0) {
                // Convert timeDifference to hours:minutes:seconds
                const hours = Math.floor(timeDifference / 3600);
                const minutes = Math.floor((timeDifference % 3600) / 60);
                const seconds = Math.floor(timeDifference % 60);
                // Update timeLeft state
                setTimeLeft(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            } else {
                // Stop the timer if the expiration time is passed
                setTimeLeft('Expired');
            }
        };

        updateTimer(); // Update immediately on mount
        const intervalId = setInterval(updateTimer, 1000); // Update every second

        return () => clearInterval(intervalId); // Cleanup on unmount
    }, [expirationTime]);


    // TODO: We want to poll the server every 5 seconds for the status of the invoice and update the UI accordingly while 
    // the invoice is still active. We can use the following endpoint to get the status of the invoice:
    // fetch localhost:3005/api/invoice/status/:invoiceId

    // if paymentStatus is Processing, show a spinner with a message "Processing Payment..."
    // if paymentStatus is Settled, show a success message "Payment Successful"
    // if paymentStatus is Expired, show "Payment Expired"


    return (
        <Dialog open={isOpen} handler={onClose} placeholder={undefined}>
            <DialogHeader placeholder={undefined}>
                Payment Details
            </DialogHeader>
            <DialogBody placeholder={undefined} className='text-gray-800'>
                <div className='bg-gray-200 rounded-xl p-4 m-4'>
                    {paymentStatus === 'New' && (
                        <div style={{ display: 'flex', justifyContent: 'center' }} className="py-4">
                            <Typography variant='h3' placeholder={undefined} > Time Left: {timeLeft || "Loading..."}</Typography>
                        </div>
                    )}
                    {paymentStatus === 'Processing' && (
                        <div className="text-center py-4">
                            {/* Placeholder for spinner */}
                            <Typography variant='h3' placeholder={undefined} className="text-blue-500">Processing Payment...</Typography>
                            <Typography variant='small' placeholder={undefined} className="text-gray-900">(Waiting for 1 confirmation)</Typography>
                        </div>
                    )}
                    {paymentStatus === 'Settled' && (
                        <div className="text-center py-4">
                            <Typography variant='h3' placeholder={undefined} className="text-green-500">Payment Successful</Typography>
                        </div>
                    )}
                    {paymentStatus === 'Expired' && (
                        <div className="text-center py-4">
                            <Typography variant='h3' placeholder={undefined} className="text-red-500">Payment Expired</Typography>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <Typography variant='h6' placeholder={undefined}>Invoice ID: </Typography>
                        <Typography variant='lead' className='text-md' placeholder={undefined}>{id || "Loading..."}</Typography>
                    </div>
                    <div className="flex justify-between">
                        <Typography variant='h6' placeholder={undefined}>LTC/USD Rate:</Typography>
                        <Typography variant='lead' className='text-md' placeholder={undefined}>${LTC_USD.toFixed(2) || "Loading..."}</Typography>
                    </div>
                    <div className="flex justify-between">
                        <Typography variant='h6' placeholder={undefined}>Order Total: </Typography>
                        <Typography variant='lead' className='text-md' placeholder={undefined}>{formatLitsToLitecoin(Number(due)) || "0.000 000 00"} LTC</Typography>
                    </div>

                    {paymentStatus === 'New' && (
                        <div className="py-4">
                            <div style={{ display: 'flex', justifyContent: 'center' }} className="bg-white rounded-xl p-2"  >
                                <div className="bg-white rounded-xl p-2">
                                    <QRCode value={paymentLink} logoImage={'/ordlite.svg'} size={275} eyeRadius={[
                                        100,  // top/left eye
                                        100, // top/right eye
                                        100,  // bottom/left eye
                                    ]} />
                                </div>
                            </div>
                            <div className='my-4'>
                                <Typography variant='h6' placeholder={undefined}>Payment Address: </Typography>
                                <Button onClick={copyToClipboard} fullWidth className="bg-white rounded-xl p-4 flex justify-between" placeholder={undefined}>
                                    <Typography variant='lead' placeholder={undefined} className='text-gray-800 text-md md:text-lg'>
                                        {paymentAddress || "LTC1..."}
                                    </Typography>
                                    {/* Copied? <Typography type='small' text-blue-500 >Copied! </> Show this for a brief period. Fade in out*/}
                                    <img src="/icon_copy.svg" alt="copy" className="h-6 w-6 inline-block ml-2" />
                                </Button>
                                <div style={{ display: 'flex', justifyContent: 'center' }} className="">
                                    <Typography type='small' className='text-blue-500 fade-in-out py-1' style={{ opacity: copiedOpacity }} placeholder={undefined}>Copied!</Typography>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="py-4">
                        {invoice?.metadata?.files && (
                            <table className="w-full mt-16 border-collapse text-gray-900 table-auto text-left">
                                <thead>
                                    <tr>
                                        <th className="border-b-2">File Name</th>
                                        <th className="border-b-2">Size</th>
                                        {/* <th className="border-b-2">Content Fee</th>
                                        <th className="border-b-2">Postage Fee</th>
                                        <th className="border-b-2">Service Fee</th> */}
                                        <th className="border-b-2">Total</th>
                                        <th className="border-b-2">Inscribe Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice?.metadata?.files.map((file: any, index: number) => (
                                        <tr key={index}>
                                            <td className="p-2">{file.fileName}</td>
                                            <td className="p-2">{file.fileSize} bytes</td>
                                            {/* <td className="p-2">{formatLitsToLitecoin(file.contentFee)} LTC</td>
                                            <td className="p-2">{formatLitsToLitecoin(file.postage) || '0.00 000 000'} LTC</td>
                                            <td className="p-2">{formatLitsToLitecoin(file.serviceFee)} LTC</td> */}
                                            <td className="p-2">{formatLitsToLitecoin(file.total)} LTC</td>
                                            <td className="p-2">{file.inscribeStatus}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </DialogBody>
        </Dialog>
    );
};


export default PaymentModal;