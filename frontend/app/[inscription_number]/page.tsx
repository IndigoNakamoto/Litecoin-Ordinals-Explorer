'use client'

//app/[inscription_number]/page.tsx
import React, { useEffect, useState } from 'react';
import { Inscription } from '@/types';
import { ContentRenderer } from '@/app/components/ContentRenderer';
import { formatTimestamp, formatAgoTimestamp, formatLits, formatContentSize } from '@/utils/formatHelpers'

import InscriptionLayout from './layout';



export default function Page({ params }: { params: { inscription_number: string } }) {
    const [data, setData] = useState<Inscription | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:3005/inscriptions/number/${params.inscription_number}`);
                if (!response.ok) throw new Error('Network response was not ok');
                const newData = await response.json();
                setData(newData);
            } catch (error) {
                console.error("Failed to fetch inscription data:", error);
            }
        };

        if (params.inscription_number) fetchData();
    }, [params.inscription_number]);



    return (
        <>
            <InscriptionLayout inscriptionNumber={params.inscription_number}>
            <header>
                <h1 className="text-3xl font-medium">Inscription #{params.inscription_number.toLocaleString()}</h1>
                {/* TODO: Menu for report like */}
            </header>
            <div className="relative w-full overflow-hidden rounded-xl" style={{ paddingBottom: '100%' }}> {/* This creates a box with a 1:1 aspect ratio and rounded corners */}
                <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-br from-gray-800 to-transparent flex items-center justify-center">
                    {/* Content that should maintain a 1:1 aspect ratio goes here */}
                    {data && <ContentRenderer
                        inscription_id={data?.inscription_id}
                        contentType={data?.content_type}
                        formattedInscriptionNumber={params.inscription_number.toLocaleString()}
                    />}
                </div>
            </div>
            <section className='min-w-full bg-gradient-to-br from-gray-800 to-transparent text-white rounded-xl max-w-fit'>
                <div className='pt-4 m-4 border-zinc-700'>
                    <h4 className='text-gray-400'>ID</h4>
                    <div>
                        <p className="truncate">{data?.inscription_id}</p>
                    </div>
                </div>
                <div className='pt-4 m-4 border-t border-zinc-700'>
                    <h4 className='text-gray-400'>ADDRESS</h4>
                    <div>
                        <p className="truncate">{data?.address}</p>
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