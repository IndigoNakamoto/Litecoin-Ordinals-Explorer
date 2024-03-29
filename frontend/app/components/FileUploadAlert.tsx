// // Ensure to import useContext and InscribeOrderContext from your context file or parent component file
import React, { useContext } from "react";
import { Button } from "@material-tailwind/react";
import { Card } from "@material-tailwind/react"
import { InscribeOrderContext } from "./contexts/InscribeOrderContext";

const FileUploadAlert = () => {
    const context = useContext(InscribeOrderContext);
    return (
        <div className="w-full h-full">
            {/* icon={<Icon />} */}
            <Card placeholder={undefined} onClick={() => context?.setError(null)}>
                <div className="flex flex-col items-center justify-center w-full min-h-64 h-full max-h-96 border-1 border-gray-300 rounded-xl cursor-pointer bg-red-100 font-medium text-red-600   hover:bg-red-50">
                    <h2 className="text-xl m-4 justify-center align-middle text-center">
                        {context?.error}
                    </h2>
                </div>
                <Button
                    variant="text"
                    color="white"
                    size="sm"
                    className="!absolute top-3 right-3 text-gray-700 bg-red-50"

                    onClick={() => context?.setError(null)}
                    placeholder={undefined}                >
                    Close
                </Button>
            </Card >
        </div >
    );
}

export default FileUploadAlert;