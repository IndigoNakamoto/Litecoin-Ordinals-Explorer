import { useRouter } from 'next/navigation';

import {
    Dialog, DialogBody, DialogHeader, Typography, Button, Card,
    // CardHeader, 
    CardBody,
    Chip,
    // CardFooter,
    // Tooltip,
    IconButton,
    // Menu,
    // MenuHandler,
    // MenuList,
    // MenuItem,
} from "@material-tailwind/react";
// import type { DialogHeaderStylesType } from "@material-tailwind/react";
// import type { DialogBodyStylesType } from "@material-tailwind/react";
import { QRCode } from 'react-qrcode-logo';
import {
    EllipsisHorizontalIcon,
} from "@heroicons/react/24/solid";
// import Image from "next/image";
// import { PaymentSelectFileButton } from "./paymentModalFileButton";

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

interface Invoice {
    destination: string;
    due: string;
    paymentLink: string;
    metadata: {
        inscribeStatus: string;
        files: {
            fileName: string;
            fileSize: number;
            total: number;
            inscribeStatus: string;
        }[];
    };
}



const PaymentModal: React.FC<ModalProps> = ({ isOpen, onClose, id, paymentAddress, expirationTime, createdTime, due, paymentLink, metadata, currency, LTC_USD }) => {
    const router = useRouter();
    const [paymentStatus, setPaymentStatus] = useState(''); // New, Processing, Settled, Expired
    const [inscribeStatus, setInscribeStatus] = useState('Pending')
    const [thePaymentAddress, setPaymentAddress] = useState(paymentAddress);
    const [theExpirationTime, setExpirationTime] = useState(expirationTime);
    const [theCreatedTime, setCreatedTime] = useState(createdTime);
    const [theDue, setDue] = useState(due);
    const [thePaymentLink, setPaymentLink] = useState(paymentLink);
    const [theCurrency, setCurrency] = useState(currency);
    const [theLTC_USD, setLTC_USD] = useState(LTC_USD);
    const [theMetadata, setMetadata] = useState(metadata);





    // Then update your useState declaration for invoice
    const [invoice, setInvoice] = useState<Invoice>({ destination: '', due: '0', paymentLink: '', metadata: { inscribeStatus: '', files: [] } });


    const resetPaymentState = () => {
        setPaymentStatus('New');
        setInscribeStatus('Pending');
        setInvoice({ destination: '', due: '0', paymentLink: '', metadata: { inscribeStatus: '', files: [] } });
        setTimeLeft('');
        // Add any other state variables that need to be reset
    };

    useEffect(() => {
        if (!isOpen) {
            resetPaymentState();
        }
    }, [isOpen]);



    /* 
    TODO: Implement handleOpenCommit function to open the modal and display the selected transaction
    file.fileName
    file.fileSize
    file.inscription.inscriptions[0].id -> fetch api/inscriptions/:id
      200 -> response.inscription_number
            <Link to={`/${response.inscription_number}`}>View Inscription</Link>
      404 -> file.inscription.commit -> view transaction litecoinspace.com/tx/:commit
            <Alert color="amber">View your inscription in the [mempool](litecoinspace.com/tx/:commit)</Alert>

    if file.status is Error -> Alert -> "Error inscribing file. Please contact support in our discord channel."
            <Alert color="amber">Error inscribing file. Please contact support in our discord channel.</Alert>
            
    */
    const handleOpenCommit = async (file: any) => {
        // setSelectedTransaction(transaction);
        // setIsCommitModalOpen(true);

        console.log('File:', file)
        // console.log('Inscription commit: ', file.inscription.commit)
        // console.log('Inscription id: ', file.inscription.inscriptions[0].id)

        if (file.inscription) {
            try {
                const response = await fetch(`https://ordlite.io/api/inscriptions/${file.inscription.inscriptions[0].id}`);
                const data = await response.json();
                const status = await response.status;
                // console.log('Status: ', status)
                if (status === 200) {
                    // console.log('Status 200')
                    // console.log('Inscription Number:', data.inscription_number)
                    // Link to /:inscription_number
                    // router.push(`/${data.inscription_number}`);
                    window.open(`/${data.inscription_number}`, '_blank');


                }
                if (status === 404) {
                    // console.log('Status 404')
                    // console.log('Inscription Commit:', file.inscription.commit)
                    // Link to new tab litecoinspace.com/tx/:commit
                    window.open(`https://litecoinspace.org/tx/${file.inscription.commit}`, '_blank');
                }
            } catch (error) {
                throw error
            }
        }

    };



    // BUG: The issue might be here where ID is not being passed to the fetch function which means it wasn't passed to the component?
    useEffect(() => {
        let intervalId: any;

        const fetchPaymentStatus = async () => {
            try {
                // console.log('\n')
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/invoice/status/${id}`);
                const data = await response.json();

                const invoice = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/invoice/${id}`);
                const invoiceData = await invoice.json();
                // console.log('Invoice Data:', invoiceData)
                // console.log('InvoiceData status:   ', invoiceData.metadata.status)
                if (invoiceData) {
                    setInvoice(invoiceData);
                }

                // console.log('ID:', id, 'isOpen:', isOpen,)
                if (data.paymentStatus) {
                    // console.log('Payment Status:', data.paymentStatus)
                    setPaymentStatus(data.paymentStatus);
                }
                if (invoiceData.metadata.status) {
                    // console.log('Inscribe Status:', invoiceData.metadata.status)
                    setInscribeStatus(invoiceData.metadata.status)
                }
            } catch (error) {
                // console.error("Failed to fetch invoice status:", error);
                throw error;
            }
        };



        const shouldContinuePolling = isOpen && (inscribeStatus !== 'Committed' && inscribeStatus !== 'Error');
        // console.log('shouldContinuePolling: ', shouldContinuePolling)
        if (shouldContinuePolling) {
            // console.log('shouldContinuePolling: ', shouldContinuePolling)
            fetchPaymentStatus(); // Fetch immediately when modal opens and conditions are met
            // console.log('IsOpen: ', isOpen)
            // console.log('Inscribe Status: ', inscribeStatus)
            intervalId = setInterval(fetchPaymentStatus, 5000); // Then every 5 seconds
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId); // Cleanup on unmount or when conditions are not met anymore
            }
        };
    }, [isOpen, id, inscribeStatus]);








    const [timeLeft, setTimeLeft] = useState('');

    const [showCopiedDue, setDueShowCopied] = useState(false);
    const [showCopiedAddress, setShowCopiedAddress] = useState(false);
    const [copiedOpacity, setCopiedOpacity] = useState(0); // 0: invisible, 1: visible


    // const copyToClipboard = async () => {
    //     try {
    //         await navigator.clipboard.writeText(invoice.destination);
    //         setCopiedOpacity(1); // Make "Copied!" visible
    //         setTimeout(() => setCopiedOpacity(0), 2000); // Fade out after 2 seconds
    //     } catch (err) {
    //         console.error('Failed to copy: ', err);
    //     }
    // };
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                // console.log('Text copied to clipboard: ' + text);
                setShowCopiedAddress(true); // Show "Copied!" message
                setTimeout(() => setShowCopiedAddress(false), 2000); // Hide "Copied!" message after 2 seconds
            })
            .catch((error) => {
                console.error('Unable to copy text to clipboard: ', error);
            });
    };


    const copyDueToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                // console.log('Text copied to clipboard: ' + text);
                setDueShowCopied(true); // Show "Copied!" message
                setTimeout(() => setDueShowCopied(false), 2000); // Hide "Copied!" message after 2 seconds
            })
            .catch((error) => {
                console.error('Unable to copy text to clipboard: ', error);
            });
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



    return (
        <Dialog open={isOpen} handler={onClose} placeholder={undefined} style={{ maxHeight: '80vh', minWidth: '80vw', overflowY: 'auto' }}>
            <DialogHeader placeholder={undefined}>
                Invoice Details
            </DialogHeader>
            <DialogBody placeholder={undefined} className='text-gray-800 min-h-96'>

                {paymentStatus === '' && (
                    <div className="text-center py-4 h-full">
                        <Typography variant='h3' placeholder={undefined} className="text-black">Loading...</Typography>
                    </div>

                )}
                {paymentStatus !== '' && (
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
                        <div className='max-w-sm'>
                            <div className="flex justify-between">
                                <Typography variant='h6' placeholder={undefined}>Invoice ID: </Typography>
                                <Typography variant='lead' className='text-md' placeholder={undefined}>{id || "Loading..."}</Typography>
                            </div>
                            <div className="flex justify-between ">
                                <Typography variant='h6' placeholder={undefined}>LTC/USD Rate:</Typography>
                                <Typography variant='lead' className='text-md' placeholder={undefined}>${LTC_USD.toFixed(2) || "Loading..."}</Typography>
                            </div>
                        </div>

                        {paymentStatus === 'New' && (
                            <div className="">
                                <div style={{ display: 'flex', justifyContent: 'center' }} className="bg-white rounded-xl p-2"  >
                                    <div className="bg-white rounded-xl p-2">
                                        <QRCode value={invoice.paymentLink} logoImage={'/ordlite.svg'} size={275} eyeRadius={[
                                            100,  // top/left eye
                                            100, // top/right eye
                                            100,  // bottom/left eye
                                        ]} />
                                    </div>
                                </div>
                                <div className='my-4'>
                                    <Typography variant='h6' placeholder={undefined}>Payment Address: </Typography>
                                    <Button onClick={() => copyToClipboard(invoice.destination)} fullWidth className="bg-white rounded-xl px-4 flex justify-between" placeholder={undefined}>
                                        <Typography variant='lead' placeholder={undefined} className={`text-md fade-in-out md:text-lg ${showCopiedAddress ? 'text-blue-500' : 'text-gray-800'}`}>
                                            {showCopiedAddress ? "Copied!" : invoice.destination || "LTC1..."}
                                        </Typography>
                                    </Button>

                                    <Typography variant='h6' placeholder={undefined}>Amount Due: </Typography>
                                    <Button onClick={() => copyDueToClipboard(invoice.due)} fullWidth className="bg-white rounded-xl px-4 flex justify-between" placeholder={undefined}>
                                        <Typography variant='lead' placeholder={undefined} className={`text-md fade-in-out md:text-lg ${showCopiedDue ? 'text-blue-500' : 'text-gray-800'}`}>
                                            {showCopiedDue ? "Copied!" : `${formatLitsToLitecoin(Number(invoice.due))} LTC` || "0.000 000 00 LTC"}
                                        </Typography>
                                    </Button>
                                </div>
                            </div>
                        )}


                        {/* {(paymentStatus === 'Processing' || paymentStatus === 'Settled') && (
                        <div className="py-4">
                            <div style={{ display: 'flex', justifyContent: 'center' }} className="bg-white rounded-xl p-2"  >
                                <div className="bg-white rounded-xl p-2">
                                    <Image src={"/OrdinalsLiteLogo3.svg"} alt={""} width={275} height={275} />
                                </div>
                            </div>
                        </div>
                    )} */}

                        <Card className="mt-8" placeholder={undefined}>

                            <Typography variant="h5" color="blue-gray" className=" p-4" placeholder={undefined}>
                                Files
                            </Typography>

                            <CardBody placeholder={undefined}>
                                {invoice?.metadata?.files && (
                                    <table className="w-full mt-4 border-collapse text-gray-900 table-auto text-left">
                                        <thead>
                                            <tr>
                                                <th className="border-b-2">File Name</th>
                                                <th className="border-b-2">Size</th>
                                                {/* <th className="border-b-2">Content Fee</th>
                                        <th className="border-b-2">Postage Fee</th>
                                        <th className="border-b-2">Service Fee</th> */}
                                                <th className="border-b-2">Total</th>
                                                <th className="border-b-2">Inscribe Status</th>
                                                <th className="border-b-2"></th>
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
                                                    <td>
                                                        <Chip
                                                            size="sm"
                                                            variant="ghost"
                                                            value={file.inscribeStatus === "Committed" ? "Sent to mempool" : file.inscribeStatus}
                                                            color={
                                                                file.inscribeStatus === "Pending"
                                                                    ? "orange"
                                                                    : file.inscribeStatus === "Committing"
                                                                        ? "green"
                                                                        : file.inscribeStatus === "Committed"
                                                                            ? "blue"
                                                                            : file.inscribeStatus === "Queued"
                                                                                ? "yellow"
                                                                                : "red"
                                                            }
                                                        />
                                                    </td>
                                                    <td>
                                                        <IconButton variant="text" placeholder={undefined} onClick={() => handleOpenCommit(file)}>
                                                            <EllipsisHorizontalIcon className="w-8 h-8 text-gray-600" />
                                                        </IconButton>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </CardBody>
                        </Card>
                    </div>
                )}


            </DialogBody>
        </Dialog>
    );
};


export default PaymentModal;