'use client'

//app/[inscription_number]/page.tsx
import React, { useEffect, useState } from 'react';
import { Inscription } from '@/types';
import { ContentRenderer } from '@/app/components/ContentRenderer';
import { formatTimestamp, formatAgoTimestamp, formatLits, formatContentSize } from '@/utils/formatHelpers';

import InscriptionLayout from './layout';

export default function Page({ params }: { params: { inscription_number: string } }) {
    const [data, setData] = useState<Inscription | null>(null);
    const [copySuccess, setCopySuccess] = useState<boolean>(false);
    const [copiedContent, setCopiedContent] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`https://ordlite.io/api/inscriptions/number/${params.inscription_number}`);
                if (!response.ok) throw new Error('Network response was not ok');
                const newData = await response.json();
                setData(newData);
            } catch (error) {
                console.error("Failed to fetch inscription data:", error);
            }
        };

        if (params.inscription_number) fetchData();
    }, [params.inscription_number]);

    const handleCopyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedContent(text);
        setCopySuccess(true);
        setTimeout(() => {
            setCopySuccess(false);
            setCopiedContent(null); // Reset copied content after showing message
        }, 2000); // 1000ms = 1 second
    };
    return (
        <>
            <InscriptionLayout>
                <header>
                    <h1 className="text-3xl font-medium">Inscription #{params.inscription_number.toLocaleString()}</h1>
                </header>
                <div className="relative w-full overflow-hidden rounded-xl" style={{ paddingBottom: '100%' }}>
                    <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-br from-gray-800 to-transparent flex items-center justify-center">
                        {data && <ContentRenderer
                            inscription_id={data?.inscription_id}
                            contentType={data?.content_type}
                            formattedInscriptionNumber={params.inscription_number.toLocaleString()}
                        />}
                    </div>
                </div>
                <section className='min-w-full bg-gradient-to-br from-gray-800 to-transparent text-white rounded-xl max-w-fit'>
                    {/* ID Section */}
                    <div className='pt-4 m-4 border-zinc-700'>
                        <h4 className='text-gray-400'>ID</h4>
                        <div>
                            {copySuccess && copiedContent === data?.inscription_id ? (
                                <span className="text-blue-500 animate-fadeInOut">Copied!</span>
                            ) : (
                                <p className="truncate" onClick={() => data?.inscription_id && handleCopyToClipboard(data.inscription_id)} style={{ cursor: 'pointer' }}>{data?.inscription_id}</p>
                            )}
                        </div>
                    </div>
                    {/* Address Section */}
                    <div className='pt-4 m-4 border-t border-zinc-700'>
                        <h4 className='text-gray-400'>ADDRESS</h4>
                        <div>
                            {copySuccess && copiedContent === data?.address ? (
                                <span className="text-blue-500 animate-fadeInOut">Copied!</span>
                            ) : (
                                <p className="truncate" onClick={() => data?.address && handleCopyToClipboard(data.address)} style={{ cursor: 'pointer' }}>{data?.address}</p>
                            )}
                        </div>
                    </div>
                    <div className='pt-4 m-4 border-t border-zinc-700'>
                        <h4 className='text-gray-400'>CREATED</h4>
                        <div>
                            {/* Return Month, Day year - (N hours ago | N Days N Hours ago) */}
                            <p>{data?.timestamp ? formatTimestamp(+data.timestamp * 1000) : ''} <span className='text-gray-400 text-xs'>{data?.timestamp ? formatAgoTimestamp(+data.timestamp * 1000) : ''}</span></p>
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
                        <h4 className='text-gray-400'>CREATION FEE</h4>
                        <div>
                            {/* Format to use ',' */}
                            <p>{`${formatLits(data?.genesis_fee)} lits`} </p>
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
                        <h4 className='text-gray-400'>MIME TYPE</h4>
                        <div>
                            <p>{data?.content_type.toUpperCase()}</p>
                        </div>
                    </div>
                    <div className='py-4 m-4 border-t border-zinc-700'>
                        <h4 className='text-gray-400'>Original Content</h4>
                        <div>
                            {/* Link to external site */}
                            <a href={`https://OrdinalsLite.com/inscription/${data?.inscription_id}`} className='text-blue-400 hover:underline' target="_blank" rel="noopener noreferrer">
                                View Original Content
                            </a>
                        </div>
                    </div>
                </section>


            </InscriptionLayout>
        </>

    );
}
