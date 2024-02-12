'use client'
// app/inscribe/page.tsx
import {
    Typography,
} from "@material-tailwind/react";
import FileUpload from "../components/FileUpload";
import FileUploadAlert from "../components/FileUploadAlert";
// import InscribeOrder from '../components/inscribe-order'
// import OrderSummary from "../components/InscribeOrderSummary";
import InvoiceHistory from '../components/inscribe-history'
import { createContext, useContext, useState } from 'react';
import { code } from "three/examples/jsm/nodes/Nodes.js";

export interface InscribeOrderContextType {
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

    const handleSubmit = async () => {
        console.log('HANDLE SUBMIT');
        const formData = new FormData();
        files.forEach(file => {
            formData.append("files", file); // Use "files" for multiple files
        });

        // Get address from local storage
        formData.append("user_id", 'user_123');

        try {
            const response = await fetch('http://localhost:3005/upload/', {
                method: 'POST',
                body: formData,
            });
            const response_invoice = await fetch('http://localhost:3005/invoice/', {
                method: 'POST',
                body: formData,
            })
            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const result = await response.text();
            console.log('Result: ', result);
        } catch (error: any) {
            console.error('Upload failed:', error.message);
            setError(error.message);
        }

        setFiles([]);
    };


    return (

        <section className="mx-auto max-w-full bg-gray-200 lg:py-36">
            <div className="mx-auto p-4 max-w-screen-lg">
                <Typography variant="h1" className="mb-6 font-2xl text-gray-900" placeholder={undefined}>
                    Inscribe
                </Typography>
                <div className="grid grid-cols-1 pt-8 gap-4">
                    {error ? <FileUploadAlert /> : <FileUpload onFileSelect={handleFileSelect}/>}
                    <div className="w-full text-black">
                        {/* <InscribeOrder /> */}
                        {/* <OrderSummary onSubmit={handleSubmit} /> */}
                    </div>
                </div>
                <div className="my-6">
                    <InvoiceHistory />
                </div>
            </div>
        </section>
    );
}