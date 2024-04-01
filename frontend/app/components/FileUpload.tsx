import React, { ChangeEvent, useContext } from "react";
import { Card } from "@material-tailwind/react"
import { InscribeOrderContext } from "./contexts/InscribeOrderContext";

const supportedMimeTypes = new Set([
    'image/apng', 'text/plain', 'application/octet-stream',
    'application/binpb', 'application/cbor', 'text/css', 'audio/flac', 'image/gif',
    'model/gltf-binary', 'model/gltf+json', 'text/html', 'image/jpeg', 'text/javascript',
    'application/json', 'text/markdown', 'audio/mpeg', 'video/mp4', 'font/otf',
    'application/pdf', 'image/png', 'application/x-python-code', 'model/stl',
    'image/svg+xml', 'font/ttf', 'text/plain', 'audio/wav', 'video/webm',
    'image/webp', 'font/woff', 'font/woff2', 'text/yaml'
]);

interface FileUploadProps {
    onFileSelect: (file: File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
    const context = useContext(InscribeOrderContext);
    if (!context) {
        throw new Error("FileUpload must be used within a InscribeOrderContext.Provider");
    }
    const { setError } = context;

    const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
        console.log('handleFileSelect')
        const file = event.target.files?.[0];

        if (file) {
            const fileExtension = file?.name.split('.').pop()?.toLowerCase(); // Add null check for fileExtension
            // console.log('filetype: ', file.type); // Add this line to log the MIME type
            if ((!supportedMimeTypes.has(file.type) && !['gltf', 'glb'].includes(fileExtension || ''))) { // Add null check for fileExtension
                setError("Invalid file type. Please upload a file with a supported MIME type.");
            } else if (file.size > 400 * 1000) { // Adjusted to 400 KB to match requirement
                setError("File size exceeds the maximum limit of 400 KB.");
            } else {
                onFileSelect(file);
                setError(null); // Clear any existing errors
            }
        }
    };

    return (
        <div className="w-full h-full">
            <Card placeholder={undefined}>
                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full min-h-64 h-full max-h-96 border-1 border-gray-300 rounded-xl cursor-pointer bg-gray-50  hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-4 text-blue-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                        </svg>
                        <p className="mb-2 text-sm text-blue-500 dark:text-blue-400"><span className="font-semibold">Click to select file to upload</span></p>
                        <p className="text-sm p-2 text-blue-500 dark:text-blue-400 text-center ">To upload, your file should be less than 400KB in size</p>
                        <p className="text-sm p-2 text-blue-500 dark:text-blue-400 text-center">Supported Extensions:</p>
                        <p className="text-xs px-20 text-blue-500 dark:text-blue-400 text-center">apng asc bin binpb cbor css flac gif glb gltf html jpg js json md mp3 mp4 otf pdf png py stl svg ttf txt wav webm webp woff woff2 yaml</p>
                    </div>
                    <input id="dropzone-file" type="file" className="hidden" onChange={handleFileSelect} />
                </label>
            </Card>
        </div>
    );
};

export default FileUpload;