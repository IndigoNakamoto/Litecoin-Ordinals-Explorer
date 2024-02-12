// // Ensure to import useContext and InscribeOrderContext from your context file or parent component file
import React from "react";
import { Button } from "@material-tailwind/react";
import { Card } from "@material-tailwind/react"


const FileUploadAlert = async () => {
    const error = await localStorage.getItem('fileError')
    return (
        <div className="w-full h-full">
            {/* icon={<Icon />} */}
            <Card placeholder={undefined} onClick={() => localStorage.setItem('fileError', '')}>
                <div className="flex flex-col items-center justify-center w-full min-h-64 h-full max-h-96 border-1 border-gray-300 rounded-xl cursor-pointer bg-red-100 font-medium text-red-600   hover:bg-red-50">
                    <h2 className="text-xl m-4 justify-center align-middle text-center">
                        {error}
                    </h2>
                </div>
                <Button
                    variant="text"
                    color="white"
                    size="sm"
                    className="!absolute top-3 right-3 text-gray-700 bg-red-50"
                    onClick={() => localStorage.setItem('fileError', '')}
                    placeholder={undefined}                >
                    Close
                </Button>
            </Card >
        </div >
    );
}

export default FileUploadAlert;