'use client'
// app/inscribe/page.tsx
import {
    Typography,
} from "@material-tailwind/react";
import FileUpload from "../components/FileUpload";
import FileUploadAlert from "../components/FileUploadAlert";
import InscribeOrder from '../components/YourInscriptionOrder'
import OrderSummary from "../components/OrderSummary";
// import InvoiceHistory from '../components/inscribe-history'
import { useState, useEffect } from 'react';
import { InscribeOrderContext } from "../components/contexts/InscribeOrderContext";
import PaymentModal from "../components/PaymentModal";
import { set } from "lodash";
import InvoiceHistory from "../components/RecentTransactions";
import ConnectModal from '@/app/components/ConnectModal'


export default function Page() {
    const [fileName, setFileName] = useState<string>(''); // State to store file name
    const [fileSize, setFileSize] = useState<number>(0); // State to store file size
    const [files, setFiles] = useState<File[]>([]); // State to store files
    const [error, setError] = useState<string | null>(null);
    const [inProgress, setInProgress] = useState<boolean>(false);
    const [code, setCode] = useState<string | null>(null);
    const [credit, setCredit] = useState<number | null>(null);
    const [receivingAddress, setReceivingAddress] = useState<string | null>(null);
    const [serviceFee, setServiceFee] = useState<number | null>(null);
    const [ltcUSD, setLtcUSD] = useState<number>(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

    const [invoiceId, setInvoiceId] = useState<string | null>(null);
    const [invoiceExpirationTime, setInvoiceExpirationTime] = useState<string | null>(null);
    const [invoiceAmount, setInvoiceAmount] = useState<number | null>(null);
    const [invoiceStatus, setInvoiceStatus] = useState<string | null>(null);
    const [invoiceCreatedTime, setInvoiceCreatedTime] = useState<string | null>(null);
    const [invoicePaymentLink, setInvoicePaymentLink] = useState<string | null>(null);
    const [destinationAddress, setDestinationAddress] = useState<string | null>(null);
    const [user, setUser] = useState<string | null>(null);
    // const user_id = localStorage.getItem('username');

    const [connected, setConnected] = useState('false');
    useEffect(() => {
        const connected = localStorage.getItem('connected');
        const username = localStorage.getItem('username')
        if (connected === 'true') {
            setConnected('true')
        }
        setUser(String(username))
    }, []);


    const handleButtonClick = () => {
        setIsModalOpen(true);
    };

    const handleFilesSelect = async (files: File[]) => {

        if (connected === 'false') {
            setIsConnectModalOpen(true)
        } else {
            // console.log('HANDLE FILES SELECT');
            const user_id = localStorage.getItem('username')
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/invoice/new/account/${user_id}`); // If you add more states related to the context, you can log them here as well
                const doesNewInvoiceExist = await response.json();
                if (doesNewInvoiceExist.hasNewInvoice) {
                    // console.log('User has an invoice in progress');
                    setInProgress(true);
                    // Delete the uploaded files
                    setError("You have an invoice in progress. Please settle it before uploading new files or cancel the invoice.");
                } else {
                    const updatedFiles = [...files];
                    updatedFiles.forEach(file => {
                        setFileName(file.name); // Update file name state
                        setFiles(prevFiles => [...prevFiles, file]); // Append file to files state
                        const fileSize = file.size; // Retrieve file size
                        setFileSize(fileSize); // Update file size state
                    });
                    const ltcusd = await fetch('https://payment.ordlite.com/api/rates?storeId=AN4wugzAGGN56gHFjL1sjKazs89zfLouiLoeTw9R7Maf');
                    const ltcUSD = await ltcusd.json();
                    setLtcUSD(ltcUSD[0].rate);
                }
            } catch (error) {
                // console.error('Error checking for existing invoice:', error);
                setError(String(error)); // Display the error message in the client component
            }
        }

    };


    const handleSubmit = async () => {
        // console.log('HANDLE SUBMIT');
        // Placeholder values for demonstration. Replace these with actual data as necessary.
        const requestedAccounts = await window.litescribe.requestAccounts();
        const user_id = requestedAccounts[0];

        const formData = new FormData();
        files.forEach(file => {
            formData.append("files", file); // Use "files" for multiple files
        });
        formData.append("account_id", user_id || "");
        formData.append("receivingAddress", receivingAddress || "");

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/upload/`, {
                method: 'POST',
                body: formData,
            });
            setInProgress(false);
            // TODO: result should be invoice and payment method
            const result = await response.json()
            console.log('Invoice Id needed for payment modal: ', result.id);
            // console.log('Result: ', result);
            setInvoiceId(result.id);
            setInvoiceExpirationTime(result.expirationTime);
            setInvoiceAmount(result.due);
            setInvoiceStatus(result.status);
            setInvoiceCreatedTime(result.createdTime);
            setInvoicePaymentLink(result.paymentLink);
            setDestinationAddress(result.destination);
            // TODO: set invoice and payment method in state and pass to payment modal
        } catch (error) {
            // console.error('Upload failed:', error);
            setError(String(error)); // Display the error message in the client component
        }
        setFiles([]);


        // loading while waiting for response from server's invoice creation
        // if successful, open payment dialog and pass in invoice and payment method
        if (!inProgress || code === null) setIsModalOpen(true);
    };

    return (
        <InscribeOrderContext.Provider
            value={{
                fileName,
                setFileName,
                files,
                setFiles,
                fileSize,
                setFileSize,
                error,
                setError,
                code,
                setCode,
                credit,
                setCredit,
                receivingAddress,
                setReceivingAddress,
                serviceFee,
                setServiceFee,
                ltcUSD,
                setLtcUSD,
                destinationAddress,
                setDestinationAddress,
                invoicePaymentLink,
                setInvoicePaymentLink,
                user: null,
                setUser
            }}
        >
            <section className="mx-auto max-w-full bg-gray-200 lg:py-10">
                <div className="mx-auto p-4 max-w-screen-2xl min-h-screen">
                    <Typography variant="h1" className="font-2xl text-gray-900" placeholder={undefined}>
                        Inscribe
                    </Typography>
                    <Typography variant='lead' className='mb-6 text-gray-600' placeholder={undefined}>
                        Secure your files with Ordinals Lite - The longest running public blockchain with 100% uptime.
                    </Typography>
                    <div className="grid grid-cols-1 pt-8 gap-4">
                        {error ? <FileUploadAlert /> : <FileUpload onFilesSelect={handleFilesSelect} />}
                        <div className="w-full text-black">
                            <InscribeOrder />
                            <OrderSummary onSubmit={handleSubmit} />
                        </div>
                    </div>
                    <div className="my-6">
                        <InvoiceHistory />
                    </div>
                </div>
                <PaymentModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false)
                        // if now < expirationTime, then 
                    }}
                    id={String(invoiceId)}
                    expirationTime={String(invoiceExpirationTime)}
                    createdTime={String(invoiceCreatedTime)}
                    due={String(invoiceAmount)}
                    LTC_USD={ltcUSD}
                    currency="LTC"
                    paymentLink={String(invoicePaymentLink)}
                    metadata={{}}
                    paymentAddress={String(destinationAddress)}
                />
                <ConnectModal isOpen={isConnectModalOpen} onClose={() => setIsConnectModalOpen(false)} />
            </section>
        </InscribeOrderContext.Provider>
    );
}