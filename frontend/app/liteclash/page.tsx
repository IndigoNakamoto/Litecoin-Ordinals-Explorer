import React from 'react';
import { Typography, Button, Input, Card } from "@material-tailwind/react";
import { Metadata } from 'next';


export default async function page() {
    return (
        <div>
            <div className="w-full bg-blue-600 h-20 flex items-center justify-center">
                <h1 className='text-3xl font-semibold'>
                    LiteClash
                </h1>
            </div>
            <div className="w-full bg-gray-200 h-max flex flex-col items-center justify-center">
                <p className="mb-6 font-2xl text-gray-900">
                    Were we inscribed because we are fungible? No. Will we be judged by our non-fungibility? Yes.
                </p>
                <p className="mb-6 font-2xl text-gray-900">
                    Who&apos;s non-fungibility reigns supreme? Click to choose.
                </p>
            </div>
        </div>
    )
}

