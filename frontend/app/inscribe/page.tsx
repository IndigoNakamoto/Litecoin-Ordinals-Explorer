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
    setCredt: React.Dispatch<React.SetStateAction<number | null>>;
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
    const [credit, setCredt] = useState<number | null>(null);
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

    const handleSubmit = () => {
        // Perform file upload logic here using the 'files' state
        // You can access the files array and upload each file individually or as a batch
        // You can also include any other form data or metadata along with the files
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
                setCredt,
                receivingAddress,
                setReceivingAddress
            }}
        >
            <section className="mx-auto max-w-full bg-gray-200 lg:py-36">
                <div className="mx-auto p-4 max-w-screen-lg">
                    <Typography variant="h1" className="mb-6 font-2xl text-gray-900">
                        Inscribe
                    </Typography>
                    <div className="grid grid-cols-1 pt-8 gap-4">
                        {error ? <FileUploadAlert /> : <FileUpload onFileSelect={handleFileSelect} />}
                        <div className="w-full text-black">
                            <InscribeOrder />
                            <OrderSummary />
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