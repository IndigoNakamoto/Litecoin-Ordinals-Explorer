// backend/util/ord-litecoin.ts — HTTP client for ord-litecoin + optional Litecoin Core RPC for block height.

import fetch from 'isomorphic-fetch';
import BitcoinJsonRpc from 'bitcoin-json-rpc';
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

async function getBlockInscriptionsPage(blockNumber: number, pageNumber: number) {
    const url = `${ORD_LITECOIN_URL}/inscriptions/block/${blockNumber}/${pageNumber}`;
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
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
            const rpc = new BitcoinJsonRpc(litecoinRpcUrl());
            const blockHeight = await rpc.getBlockCount();
            return Number(blockHeight);
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
