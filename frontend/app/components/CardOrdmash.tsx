import React, { memo } from 'react';
import Link from 'next/link';
import { ContentRenderer } from './ContentRendererOrdmash';

interface InscriptionCardProps {
    inscription_id: string;
    inscription_number: number;
    content_type: string;
    content_type_type: string;
    content_length: number;
    maxHeight?: string;
}

const CardOrdmash = memo<InscriptionCardProps>(({ inscription_id, inscription_number, content_type }) => {
    const formattedInscriptionNumber = inscription_number.toLocaleString(); // This will format the number with commas
    // console.log("Rendering InscriptionCard", { inscription_id, content_type, formattedInscriptionNumber });

    return (
        <div className="rounded-3xl bg-gradient-to-br from-gray-800 to-transparent p-2 overflow-hidden shadow-lg cursor-pointer transition-transform duration-200 ease-in-out hover:scale-105">

            <div
                className={`overflow-hidden rounded-3xl bg-gradient-to-br from-gray-800 to-transparent flex items-center justify-center relative `}
            >
                <div className='h-96 w-full flex items-center justify-center bg-blue-500'>
                    <div className='h-96 w-full'>
                        <div className='w-full'>
                            <ContentRenderer
                                inscription_id={inscription_id}
                                contentType={content_type}
                                formattedInscriptionNumber={formattedInscriptionNumber}
                            />
                        </div>

                    </div>
                </div>
            </div>

        </div>
    );
});

CardOrdmash.displayName = 'InscriptionCard'; // Add display name to the component


export { CardOrdmash };



