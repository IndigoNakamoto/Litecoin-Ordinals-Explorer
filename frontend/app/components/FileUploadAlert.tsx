'use client'

import React from "react";
import { Button, Card } from "@material-tailwind/react";

interface FileUploadAlertProps {
    error: string;
    onClose: () => void;
}

const FileUploadAlert: React.FC<FileUploadAlertProps> = ({ error, onClose }) => {
    return (
        <div className="h-full w-full">
            <Card placeholder={undefined}>
                <div className="flex h-full min-h-64 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-1 border-gray-300 bg-red-100 font-medium text-red-600 hover:bg-red-50">
                    <h2 className="m-4 text-center text-xl">{error}</h2>
                </div>
                <Button
                    variant="text"
                    color="white"
                    size="sm"
                    className="!absolute right-3 top-3 bg-red-50 text-gray-700"
                    onClick={onClose}
                    placeholder={undefined}
                >
                    Close
                </Button>
            </Card>
        </div>
    );
}

export default FileUploadAlert;
