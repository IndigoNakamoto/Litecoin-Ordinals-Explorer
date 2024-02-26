'use client'
import React, { useEffect, useState, useRef } from 'react';
import { Inscription } from '@/types';
import Head from 'next/head';

// Same imports from inscription preview
import Link from 'next/link';
import Image from 'next/image';
import { isUndefined } from 'lodash';

// Same props from inscription preview
interface InscriptionPreviewProps {
    inscription_id: string;
    inscription_number: number;
    content_type: string;
    content_type_type: string;
}

const formatTimestamp = (timestamp: string | number | Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    // TypeScript should understand these are dates and their subtraction results in a number, 
    // but if you encounter issues, you might need type assertions (not shown here because it should work as is).
    const diff = now.getTime() - date.getTime(); // Using .getTime() to ensure clarity for TypeScript
    const diffHours = Math.floor(diff / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    const formattedDate = date.toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

    return `${formattedDate}`;
};

const formatAgoTimestamp = (timestamp: string | number | Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime(); // Again, ensuring both dates are converted to number milliseconds.
    const diffHours = Math.floor(diff / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    let agoText = '';
    if (diffDays > 0) {
        agoText = `${diffDays} Days ${diffHours % 24} Hours ago`;
    } else {
        agoText = `${diffHours} Hours ago`;
    }

    return `${agoText}`;
};

const useFetchContent = (inscription_id: string | undefined, content_type: string | undefined) => {
    const [content, setContent] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!inscription_id || !content_type) {
            setLoading(false); // Prevent loading state if ids or types are not provided
            return; // Early return to prevent executing the fetch logic
        }

        async function fetchData() {
            try {
                const url = `http://0.0.0.0:80/content/${inscription_id}`;
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                if (content_type?.startsWith('image/') || content_type === 'application/pdf' || content_type?.startsWith('video/') || content_type?.startsWith('audio/')) {
                    const blob = await response.blob();
                    setContent(URL.createObjectURL(blob));
                } else if (content_type?.startsWith('text/') || content_type === 'application/json') {
                    const text = await response.text();
                    setContent(text);
                }
                else {
                    setContent('Unsupported content type');
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : 'An unknown error occurred';
                setError('Failed to load content. ' + message);
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        fetchData().catch(error => {
            console.error(error);
            setError('Failed to load content. An error occurred.');
            setLoading(false);
        });
    }, [inscription_id, content_type]);

    return { content, loading, error };
};


// const useFetchContent = (inscription_id: string, content_type: string) => {
//     const [content, setContent] = useState<string | null>(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');

//     useEffect(() => {
//         async function fetchData() {
//             try {
//                 const url = `http://0.0.0.0:80/content/${inscription_id}`;
//                 const response = await fetch(url);

//                 if (!response.ok) {
//                     throw new Error(`HTTP error! Status: ${response.status}`);
//                 }

//                 if (content_type.startsWith('image/') || content_type === 'application/pdf' || content_type.startsWith('video/') || content_type.startsWith('audio/')) {
//                     const blob = await response.blob();
//                     setContent(URL.createObjectURL(blob));
//                 } else if (content_type.startsWith('text/') || content_type === 'application/json') {
//                     const text = await response.text();
//                     setContent(text);
//                 }
//                 else {
//                     setContent('Unsupported content type');
//                 }
//             } catch (error) {
//                 const message = error instanceof Error ? error.message : 'An unknown error occurred';
//                 setError('Failed to load content. ' + message);
//                 console.error(error);
//             } finally {
//                 setLoading(false);
//             }
//         }

//         fetchData();
//     }, [inscription_id, content_type]);

//     return { content, loading, error };
// };

// Same function from inscription preview
const getContentTypeDescription = (contentType: string): string => {
    // Split the content type by '/'
    const [type, fullSubtype] = contentType.split('/');
    // Extract the part of the subtype before any semicolon
    const subtype = fullSubtype.split(';')[0].trim();

    switch (type) {
        case 'text':
            return subtype.toUpperCase(); // Text, HTML, CSS, JavaScript
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
        default:
            return 'Unknown Content Type';
    }
};

function formatLits(value: number | undefined) {
    const num = Number(value)
    console.log('lits: ', num)

    if (value === null || isUndefined(value) || isNaN(value) ) {
      return '0'
    }

    // Check if the value is zero
    if (num === 0) {
      return '0'
    }

    // Split the number into whole and fractional parts
    let [whole, fraction] = num.toFixed(8).split('.')
    whole += ''
    // Check if the fractional part is all zeros
    if (fraction && /^0+$/.test(fraction)) {
      return whole
    }

    // Format the fractional part with spaces
    if (fraction) {
      fraction =
        fraction.slice(0, 2) +
        ' ' +
        fraction.slice(2, 5) +
        ' ' +
        fraction.slice(5)
    }

    // Combine the whole and fractional parts
    return fraction ? `${whole}.${fraction}` : whole
  }

function formatContentSize(content_length: any) {
    if (content_length < 1000) {
        return `${content_length} bytes`;
    } else {
        return `${Math.round(content_length / 1000)} KB`;
    }
}


export default function Page({ params }: { params: { inscription_id: string } }) {
    const [data, setData] = useState<Inscription | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined" && params.inscription_id) {
            const fetchData = async () => {
                const response = await fetch(`http://localhost:3005/inscription/${params.inscription_id}`);
                const data: Inscription = await response.json();
                setData(data);
                console.log(data)
            };

            fetchData().catch(console.error);
        }
    }, [params.inscription_id]);

    if (!data) {
        return <div>Loading inscription data...</div>;
    }

    const { content, loading, error } = useFetchContent(data!.inscription_id, data!.content_type);

    const formattedInscriptionNumber = data!.inscription_number.toLocaleString(); // This will format the number with commas

    const renderContent = () => {
        if (loading) return <p className="text-white">Loading...</p>;
        if (error) return <p className="text-white">{error}</p>;
        if (!content) return null;

        if (data!.content_type.startsWith('image/')) {
            return <Image src={content} alt={`Inscription ${formattedInscriptionNumber}`} layout="fill" objectFit="cover" />;
        } else if (data!.content_type.startsWith('text/') || data!.content_type === 'application/json') {
            return <pre className="text-white">{content}</pre>;
        } else if (data!.content_type === 'application/pdf') {
            return <iframe src={content} width="100%" height="500px"></iframe>;
        } else if (data!.content_type.startsWith('video/')) {
            return <video src={content} controls width="100%"></video>;
        } else if (data!.content_type.startsWith('audio/')) {
            return <audio src={content} controls></audio>;
        }

        return <p className="text-white">Unsupported content type</p>;
    };

    return (
        <div>
            <Head>
                {/* Format to use ',' */}
                <title>Inscription #{data?.inscription_number.toLocaleString()}</title>
            </Head>
            <div className="mx-auto p-4 max-w-screen-xl">
                <h1 className="text-2xl font-bold">Inscription #{data?.inscription_number.toLocaleString()}</h1>
                <div className="aspect-w-1 aspect-h-1 min-w-full min-h-[200px] max-h-[200px] overflow-hidden rounded-3xl bg-gradient-to-br from-gray-800 to-transparent flex items-center justify-center relative">
                    {renderContent()}
                </div>
                <section className='bg-gradient-to-br from-gray-800 to-transparent text-white rounded-xl max-w-fit'>
                    <div className='pt-4 m-4 border-zinc-700'>
                        <h4 className='text-gray-400'>ID</h4>
                        <div>
                            <p>{data?.inscription_id}</p>
                        </div>
                    </div>
                    <div className='pt-4 m-4 border-t border-zinc-700'>
                        <h4 className='text-gray-400'>OWNED BY</h4>
                        <div>
                            <p>{data?.address}</p>
                        </div>
                    </div>
                    <div className='pt-4 m-4 border-t border-zinc-700'>
                        <h4 className='text-gray-400'>FILE SIZE</h4>
                        <div>
                            {/* Round to whole number */}
                            <p>{formatContentSize(data?.content_length)}</p>
                        </div>
                    </div>
                    <div className='pt-4 m-4 border-t border-zinc-700'>
                        <h4 className='text-gray-400'>CREATED</h4>
                        <div>
                            {/* Return Month, Day year - (N hours ago | N Days N Hours ago) */}
                            <p>{data?.timestamp ? formatTimestamp(data.timestamp) : ''} <span className='text-gray-400 text-xs'>{data?.timestamp ? formatAgoTimestamp(data.timestamp) : ''}</span></p>
                        </div>
                    </div>
                    <div className='pt-4 m-4 border-t border-zinc-700'>
                        <h4 className='text-gray-400'>CREATION BLOCK</h4>
                        <div>
                            {/* Link to external site. Format to use ',' */}
                            <a href={`https://litecoinspace.org/block/${data?.genesis_height}`} className='text-blue-400 hover:underline' target="_blank" rel="noopener noreferrer">
                                {data?.genesis_height.toLocaleString()} 
                            </a>
                        </div>
                    </div>
                    <div className='pt-4 m-4 border-t border-zinc-700'>
                        <h4 className='text-gray-400'>Original Content</h4>
                        <div>
                            {/* Link to external site */}
                            <a href={`https://OrdinalsLite.com/inscription/${data?.inscription_id}`} className='text-blue-400 hover:underline' target="_blank" rel="noopener noreferrer">
                                View Original Content
                            </a>
                        </div>
                    </div>
                    <div className='py-4 m-4 border-t border-zinc-700'>
                        <h4 className='text-gray-400'>CREATION FEE</h4>
                        <div>
                            {/* Format to use ',' */}
                            <p>{`${formatLits(data?.genesis_fee)} lits`} </p>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}