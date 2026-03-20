// backend/util/ord-litecoin.ts — HTTP client for ord-litecoin + optional Litecoin Core RPC for block height.

import fetch from 'isomorphic-fetch';
import mempoolJS from '@mempool/mempool.js';

const ORD_LITECOIN_URL = (process.env.ORD_LITECOIN_URL || 'http://127.0.0.1:8080').replace(/\/$/, '');

function litecoinRpcUrl(): string {
    const protocol = process.env.LITECOIN_RPC_PROTOCOL || 'http';
    const user = process.env.LITECOIN_RPC_USER || 'litecoin';
    const pass = process.env.LITECOIN_RPC_PASS || 'litecoin';
    const host = process.env.LITECOIN_RPC_HOST || '127.0.0.1';
    const port = process.env.LITECOIN_RPC_PORT || '19443';
    return `${protocol}://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}:${port}`;
}

async function litecoinRpcGetBlockCount(): Promise<number> {
    const res = await fetch(litecoinRpcUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getblockcount',
            params: [],
        }),
    });
    if (!res.ok) {
        throw new Error(`Litecoin RPC HTTP ${res.status}`);
    }
    const data = (await res.json()) as { result?: number; error?: { message?: string } };
    if (data.error?.message) {
        throw new Error(data.error.message);
    }
    if (typeof data.result !== 'number') {
        throw new Error('Invalid getblockcount RPC response');
    }
    return data.result;
}

/** Normalized ord response for `/inscriptions/block/:height/:page` (ord versions differ). */
export type BlockInscriptionsPage = { inscriptions: string[]; more: boolean };

async function getBlockInscriptionsPage(
    blockNumber: number,
    pageNumber: number,
): Promise<BlockInscriptionsPage> {
    const url = `${ORD_LITECOIN_URL}/inscriptions/block/${blockNumber}/${pageNumber}`;
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const raw: unknown = await response.json();
    if (Array.isArray(raw)) {
        const ids = raw.map((x) => String(x));
        return { inscriptions: ids, more: ids.length >= 100 };
    }
    if (raw && typeof raw === 'object') {
        const o = raw as Record<string, unknown>;
        const idsRaw = o.inscriptions ?? o.ids;
        const list = Array.isArray(idsRaw) ? idsRaw.map((x) => String(x)) : [];
        const more = Boolean(o.more ?? o.more_pages ?? list.length >= 100);
        return { inscriptions: list, more };
    }
    return { inscriptions: [], more: false };
}

async function getInscriptionData(inscriptionId: string) {
    const url = `${ORD_LITECOIN_URL}/inscription/${inscriptionId}`;
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
}

async function getInscriptionContent(inscriptionId: string, contentType: string) {
    const url = `${ORD_LITECOIN_URL}/content/${inscriptionId}`;
    const headers = { Accept: contentType };
    const response = await fetch(url, { headers });
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    if (contentType.includes('application/json')) {
        return response.json();
    }
    if (contentType.includes('text')) {
        return response.text();
    }
    if (contentType.includes('image') || contentType.includes('application/octet-stream')) {
        return response.blob();
    }
    console.error('Unhandled content type:', contentType);
    throw new Error('Unhandled content type');
}

async function getBlockHeight(): Promise<number> {
    const rpcEnabled = (process.env.LITECOIN_RPC_ENABLED ?? 'true').toLowerCase() !== 'false';

    if (rpcEnabled) {
        try {
            return await litecoinRpcGetBlockCount();
        } catch (rpcError) {
            console.error('Error fetching block height via RPC:', rpcError);
        }
    }

    try {
        const { bitcoin } = mempoolJS({
            hostname: 'litecoinspace.org',
            network: 'mainnet',
        });
        const mempoolBlockHeight = await bitcoin.blocks.getBlockHeight({ height: 0 });
        return Number(mempoolBlockHeight);
    } catch (mempoolError) {
        console.error('Error fetching block height via mempoolJS:', mempoolError);
        throw new Error('Failed to fetch block height from RPC (if enabled) and mempool fallback');
    }
}

export { getBlockInscriptionsPage, getInscriptionData, getBlockHeight, getInscriptionContent, ORD_LITECOIN_URL };
