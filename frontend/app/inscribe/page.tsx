'use client'
// app/inscribe/page.tsx
import {
    Typography,
} from "@material-tailwind/react";
import FileUpload from "../components/FileUpload";
import FileUploadAlert from "../components/FileUploadAlert";
import InscribeOrder from '../components/inscribe-order'
import OrderSummary from "../components/InscribeOrderSummary";
import InvoiceHistory from '../components/inscribe-history'
import { createContext, useContext, useState } from 'react';
import { code } from "three/examples/jsm/nodes/Nodes.js";


// Define the context shape
interface InscribeOrderContextType {
    fileName: string;
    setFileName: React.Dispatch<React.SetStateAction<string>>;
    files: File[];
    setFiles: React.Dispatch<React.SetStateAction<File[]>>;
    fileSize: number;
    setFileSize: React.Dispatch<React.SetStateAction<number>>;
    error: string | null; // Add this line
    setError: React.Dispatch<React.SetStateAction<string | null>>; // Add this line
    code: string | null;
    setCode: React.Dispatch<React.SetStateAction<string | null>>;
    credit: number | null;
    setCredit: React.Dispatch<React.SetStateAction<number | null>>;
    receivingAddress: string | null;
    setReceivingAddress: React.Dispatch<React.SetStateAction<string | null>>;
}


// Initialize context
export const InscribeOrderContext = createContext<InscribeOrderContextType | null>(null);


export default function Page() {
    const [fileName, setFileName] = useState<string>(''); // State to store file name
    const [fileSize, setFileSize] = useState<number>(0); // State to store file size
    const [files, setFiles] = useState<File[]>([]); // State to store files
    const [error, setError] = useState<string | null>(null);
    const [code, setCode] = useState<string | null>(null);
    const [credit, setCredit] = useState<number | null>(null);
    const [receivingAddress, setReceivingAddress] = useState<string | null>(null);

    const handleFileSelect = (file: File) => {
        setFileName(file.name); // Update file name state
        setFiles(prevFiles => [...prevFiles, file]); // Append file to files state
        const fileSize = file.size; // Retrieve file size
        setFileSize(fileSize); // Update file size state

        // If you add more states related to the context, you can log them here as well
    };

    // TODO: Get user credit from user table
    // TODO: Validate code and get credit from code table
    // TODO: Get user credit from user table

    // const handleSubmit = () => {
    //     console.log('HANDLE SUBMIT')
    //     // Send files to server to store one by one using /upload endpoint
    //     // Remove files from files context
    //     // create btcpay invoice
    //     // create inscribe record
    //     // update user credit
    //     // update code status
    // };

    // const handleSubmit = async () => {
    //     console.log('HANDLE SUBMIT');

    //     // Assuming you have a state or context variable for `receivingAddress` and others
    //     // const { receivingAddress, files, code, credit } = useContext(InscribeOrderContext);

    //     // Placeholder values for demonstration. Replace these with actual data as necessary.
    //     const username = "user123"; // Example username
    //     const order_id = "order456"; // Example order ID
    //     const inscription_fee = "10"; // Example fee
    //     const service_fee = "2"; // Example service fee
    //     const payment_address = "ltc_address"; // Example Litecoin payment address

    //     // Iterate over each file in the context's files array
    //     for (let file of files) {
    //         const formData = new FormData();
    //         formData.append("file", file); // Append file
    //         formData.append("username", username);
    //         formData.append("order_id", order_id);
    //         formData.append("inscription_fee", inscription_fee);
    //         formData.append("service_fee", service_fee);
    //         formData.append("payment_address", payment_address);
    //         formData.append("receiving_address", receivingAddress);

    //         try {
    //             const response = await fetch('http://localhost:3005/upload', {
    //                 method: 'POST',
    //                 body: formData, // No headers for FormData; 'Content-Type' will be set automatically
    //             });

    //             if (!response.ok) {
    //                 throw new Error(`Error: ${response.statusText}`);
    //             }

    //             const result = await response.text(); // or response.json() if server responds with JSON
    //             console.log('Result: ', result);
    //         } catch (error) {
    //             if (error instanceof Error) {
    //                 console.error('Upload failed:', error.message);
    //                 setError(error.message);
    //             }
    //         }
    //     }

    //     // After all files are processed, you might want to clear the files array or navigate to another page
    //     setFiles([]); // Example of clearing the files after upload
    // };

    const handleSubmit = async () => {
        console.log('HANDLE SUBMIT');
        // Placeholder values for demonstration. Replace these with actual data as necessary.
        const user_id = "user123"; // Example username

        const formData = new FormData();
        files.forEach(file => {
            formData.append("files", file); // Use "files" for multiple files
        });
        formData.append("user_id", user_id);

        try {
            const response = await fetch('http://localhost:3005/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const result = await response.text();
            console.log('Result: ', result);
        } catch (error) {
            console.error('Upload failed:', error.message);
            setError(error.message);
        }

        setFiles([]);
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
                setReceivingAddress
            }}
        >
            <section className="mx-auto max-w-full bg-gray-200 lg:py-36">
                <div className="mx-auto p-4 max-w-screen-lg">
                    <Typography variant="h1" className="mb-6 font-2xl text-gray-900" placeholder={undefined}>
                        Inscribe
                    </Typography>
                    <div className="grid grid-cols-1 pt-8 gap-4">
                        {error ? <FileUploadAlert /> : <FileUpload onFileSelect={handleFileSelect} />}
                        <div className="w-full text-black">
                            <InscribeOrder />
                            <OrderSummary onSubmit={handleSubmit} />
                        </div>
                    </div>
                    <div className="my-6">
                        <InvoiceHistory />
                    </div>
                </div>
            </section>
        </InscribeOrderContext.Provider>
    );
}