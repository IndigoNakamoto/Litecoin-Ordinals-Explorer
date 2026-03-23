'use client'

import React, { useState } from 'react';

import type { Inscription } from '@/types';
import { ContentRenderer } from '@/app/components/ContentRenderer';
import {
    formatAgoTimestamp,
    formatContentSize,
    formatLits,
    formatTimestamp,
} from '@/utils/formatHelpers';

interface InscriptionDetailClientProps {
    inscription: Inscription;
    inscriptionNumber: string;
}

/** Prefer a positive height; ord API uses `height` (reveal block); `genesis_height` is often 0 in JSON. */
function resolveCreationBlockHeight(inscription: Inscription & Record<string, unknown>): number | null {
    const raw = [
        inscription.height,
        inscription.genesis_height,
        inscription.block_height,
        inscription.blockheight,
    ];
    const nums: number[] = [];
    for (const c of raw) {
        if (c == null || c === '') continue;
        const n = typeof c === 'number' ? c : Number(c);
        if (Number.isFinite(n) && n >= 0) nums.push(Math.floor(n));
    }
    const positive = nums.find((n) => n > 0);
    if (positive != null) return positive;
    return nums.length > 0 ? nums[0]! : null;
}

/** Ord JSON uses `fee`; Prisma uses `genesis_fee`. */
function resolveGenesisFee(inscription: Inscription & Record<string, unknown>): number {
    const raw = [inscription.fee, inscription.genesis_fee];
    const nums: number[] = [];
    for (const c of raw) {
        if (c == null || c === '') continue;
        const n = typeof c === 'number' ? c : Number(c);
        if (Number.isFinite(n) && n >= 0) nums.push(Math.floor(n));
    }
    const positive = nums.find((n) => n > 0);
    if (positive != null) return positive;
    return nums.length > 0 ? nums[0]! : 0;
}

const formatDateValue = (timestamp: string) => {
    const timestampMs = Number(timestamp) * 1000;
    if (!Number.isFinite(timestampMs) || timestampMs <= 0) {
        return { full: 'Unknown', relative: '' };
    }

    return {
        full: formatTimestamp(timestampMs),
        relative: formatAgoTimestamp(timestampMs),
    };
};

export default function InscriptionDetailClient({
    inscription,
    inscriptionNumber,
}: InscriptionDetailClientProps) {
    const [copiedContent, setCopiedContent] = useState<string | null>(null);
    const [copySuccess, setCopySuccess] = useState(false);

    const handleCopyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedContent(text);
            setCopySuccess(true);

            window.setTimeout(() => {
                setCopySuccess(false);
                setCopiedContent(null);
            }, 2000);
        } catch (error) {
            console.error('Failed to copy text:', error);
        }
    };

    const inscriptionRecord = inscription as Inscription & Record<string, unknown>;
    const creationBlock = resolveCreationBlockHeight(inscriptionRecord);

    const formattedNumber = Number(inscriptionNumber).toLocaleString();
    const createdAt = formatDateValue(inscription.timestamp);
    const genesisHeight =
        creationBlock != null ? creationBlock.toLocaleString() : 'Unknown';
    const mimeType = inscription.content_type ? inscription.content_type.toUpperCase() : 'Unknown';
    const displayFee = resolveGenesisFee(inscriptionRecord);

    const renderCopyValue = (label: string, value: string | null | undefined) => (
        <div className='pt-4 m-4 border-zinc-700 border-t first:border-t-0 first:pt-0'>
            <h4 className='text-gray-400'>{label}</h4>
            <div>
                {value ? (
                    <button
                        type="button"
                        onClick={() => handleCopyToClipboard(value)}
                        className="w-full truncate text-left underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {copySuccess && copiedContent === value ? 'Copied!' : value}
                    </button>
                ) : (
                    <p className="text-gray-300">Unavailable</p>
                )}
            </div>
        </div>
    );

    return (
        <>
            <header>
                <h1 className="text-3xl font-medium">Inscription #{formattedNumber}</h1>
            </header>
            {/*
              next/image `fill` needs a sized parent; without min-height the preview collapses to 0px (blank).
            */}
            <div className="relative isolate min-h-[min(70vh,640px)] w-full overflow-hidden rounded-xl bg-gradient-to-br from-gray-800 to-transparent">
                <ContentRenderer
                    inscription_id={inscription.inscription_id}
                    contentType={inscription.content_type}
                    formattedInscriptionNumber={formattedNumber}
                    mode="detail"
                />
            </div>
            <section className='min-w-full rounded-xl bg-gradient-to-br from-gray-800 to-transparent text-white'>
                {renderCopyValue('ID', inscription.inscription_id)}
                {renderCopyValue('ADDRESS', inscription.address)}
                <div className='m-4 border-t border-zinc-700 pt-4'>
                    <h4 className='text-gray-400'>CREATED</h4>
                    <p>
                        {createdAt.full}{' '}
                        {createdAt.relative && (
                            <span className='text-xs text-gray-400'>{createdAt.relative}</span>
                        )}
                    </p>
                </div>
                <div className='m-4 border-t border-zinc-700 pt-4'>
                    <h4 className='text-gray-400'>CREATION BLOCK</h4>
                    {creationBlock != null ? (
                        <a
                            href={`https://litecoinspace.org/block/${creationBlock}`}
                            className='text-blue-400 hover:underline'
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {genesisHeight}
                        </a>
                    ) : (
                        <p className="text-gray-300">Unavailable</p>
                    )}
                </div>
                <div className='m-4 border-t border-zinc-700 pt-4'>
                    <h4 className='text-gray-400'>CREATION FEE</h4>
                    <p>{`${formatLits(displayFee)} lits`}</p>
                </div>
                <div className='m-4 border-t border-zinc-700 pt-4'>
                    <h4 className='text-gray-400'>FILE SIZE</h4>
                    <p>{formatContentSize(inscription.content_length)}</p>
                </div>
                <div className='m-4 border-t border-zinc-700 pt-4'>
                    <h4 className='text-gray-400'>MIME TYPE</h4>
                    <p>{mimeType}</p>
                </div>
                <div className='m-4 border-t border-zinc-700 py-4'>
                    <h4 className='text-gray-400'>Original Content</h4>
                    <a
                        href={`https://OrdinalsLite.com/inscription/${inscription.inscription_id}`}
                        className='text-blue-400 hover:underline'
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        View Original Content
                    </a>
                </div>
            </section>
        </>
    );
}
