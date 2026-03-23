// backend/util/ord-litecoin.ts — HTTP client for ord-litecoin + optional Litecoin Core RPC for block height.
// (Do not import @mempool/mempool.js here: it pulls bitcoin-json-rpc, which breaks ts-node under Node ESM rules.)

import fetch from 'isomorphic-fetch';

// Default matches mainnet docker profile (ord on host 8081). Regtest profile uses 8080 — set ORD_LITECOIN_URL in .env.
const ORD_LITECOIN_URL = (process.env.ORD_LITECOIN_URL || 'http://127.0.0.1:8081').replace(/\/$/, '');

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

/** Block height ord has indexed (from GET /status, JSON). Safer than chain tip for inscription paging while ord syncs. */
function parseOrdStatusHeight(raw: unknown): number | null {
    if (!raw || typeof raw !== 'object') return null;
    const o = raw as Record<string, unknown>;
    for (const key of ['height', 'block_height', 'latest_height', 'max_height'] as const) {
        const v = o[key];
        if (typeof v === 'number' && Number.isFinite(v)) return Math.floor(v);
        if (typeof v === 'string' && /^\d+$/.test(v)) return parseInt(v, 10);
    }
    return null;
}

async function getBlockHeightFromOrdStatus(): Promise<number> {
    const url = `${ORD_LITECOIN_URL}/status`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) {
        throw new Error(`ord /status HTTP ${res.status}`);
    }
    const raw: unknown = await res.json();
    const h = parseOrdStatusHeight(raw);
    if (h == null) {
        throw new Error('ord /status JSON missing numeric height');
    }
    return h;
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

    try {
        return await getBlockHeightFromOrdStatus();
    } catch (ordError) {
        console.error('Error fetching block height via ord /status:', ordError);
    }

    if (rpcEnabled) {
        try {
            return await litecoinRpcGetBlockCount();
        } catch (rpcError) {
            console.error('Error fetching block height via RPC:', rpcError);
        }
    }

    throw new Error(
        'Failed to fetch block height: ord /status unreachable and Litecoin RPC failed or LITECOIN_RPC_ENABLED=false',
    );
}

export { getBlockInscriptionsPage, getInscriptionData, getBlockHeight, getInscriptionContent, ORD_LITECOIN_URL };
