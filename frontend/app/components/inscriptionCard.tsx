// app/components/inscriptionCard.tsx
// import { useEffect, useState } from 'react';
import Link from 'next/link';
// import Image from "next/legacy/image";
// import ModelViewer from './model-viewer';
import { ContentRenderer } from './ContentRenderer';

interface InscriptionCardProps {
    inscription_id: string;
    inscription_number: number;
    content_type: string;
    content_type_type: string;
    content_length: number;
    maxHeight?: string;
}

const getContentTypeDescription = (contentType: string): string => {
    // Split the content type by '/'
    const [type, fullSubtype] = contentType.split('/');
    // Extract the part of the subtype before any semicolon
    const subtype = fullSubtype.split(';')[0].trim();

    switch (type) {
        case 'text':
            if(subtype === 'plain') return type.toUpperCase()
            else return subtype.toUpperCase(); // Text, HTML, CSS, JavaScript
        case 'image':
            return subtype.toUpperCase(); // JPEG, GIF, PNG, SVG
        case 'application':
            return subtype.toUpperCase(); // PDF, JSON, GZip
        case 'video':
            return subtype.toUpperCase(); // OGG, AVI, MP4, MPEG
        case 'audio':
            return subtype.toUpperCase(); // WAV, WebM, AAC
        case 'font':
            return subtype.toUpperCase();
        case 'model':
            if(subtype.startsWith('gltf')) return 'GLTF'; // GLTF+JSON, GLTF-BINARY
            else return subtype.toUpperCase()
        default:
            return 'Unknown Content Type';
    }
};

export const InscriptionCard: React.FC<InscriptionCardProps> = ({
    inscription_id,
    inscription_number,
    content_type,
    maxHeight = "175px",
}) => {

    const formattedInscriptionNumber = inscription_number.toLocaleString(); // This will format the number with commas

    return (
        <div className="rounded-3xl bg-gradient-to-br from-gray-800 to-transparent` p-2 overflow-hidden shadow-lg cursor-pointer transition-transform duration-200 ease-in-out hover:scale-105">
            <Link href={`/${inscription_number}`} target="_blank" rel="noopener">
                <div 
                    className={`aspect-w-1 aspect-h-1 w-full min-h-[180px] overflow-hidden rounded-3xl flex items-center justify-center relative bg-gradient-to-br from-gray-800 to-transparent`}
                    style={{ maxHeight }} // Apply the maxHeight value here
                >
                    <ContentRenderer
                        inscription_id={inscription_id}
                        contentType={content_type}
                        formattedInscriptionNumber={formattedInscriptionNumber}
                    />
                </div>

                <div className="pt-2 p-4">
                    <p>#{formattedInscriptionNumber}</p>
                    <p className="text-gray-500 text-sm">{getContentTypeDescription(content_type)}</p>
                </div>
            </Link>
        </div>
    );
};

