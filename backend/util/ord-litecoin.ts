// backend/util/ord-litecoin.ts — HTTP client for ord-litecoin + optional Litecoin Core RPC for block height.
// (Do not import @mempool/mempool.js here: it pulls bitcoin-json-rpc, which breaks ts-node under Node ESM rules.)

import fetch from 'isomorphic-fetch';

// Default matches mainnet docker profile (ord on host 8081). Regtest profile uses 8080 — set ORD_LITECOIN_URL in .env.
const ORD_LITECOIN_URL = (process.env.ORD_LITECOIN_URL || 'http://127.0.0.1:8081').replace(/\/$/, '');

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseEnvInt(name: string, fallback: number): number {
    const raw = process.env[name];
    if (raw == null || raw === '') return fallback;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : fallback;
}

/** Transient HTTP statuses for idempotent GETs to ord. */
function isRetryableOrdHttpStatus(status: number): boolean {
    return status === 429 || status === 502 || status === 503 || status === 504;
}

function isRetryableNetworkError(err: unknown): boolean {
    if (!err || typeof err !== 'object') return false;
    const e = err as { code?: string; errno?: unknown; message?: unknown };
    const codes = new Set(['ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'EPIPE', 'EAI_AGAIN', 'ECONNABORTED']);
    if (e.code && codes.has(e.code)) return true;
    if (typeof e.errno === 'string' && codes.has(e.errno)) return true;
    const msg = String(e.message ?? '');
    return /ECONNRESET|ECONNREFUSED|ETIMEDOUT|socket hang up|EPIPE|EAI_AGAIN|network/i.test(msg);
}

function backoffMs(attempt: number, baseMs: number, maxMs: number): number {
    const exp = Math.min(maxMs, baseMs * Math.pow(2, attempt));
    const jitter = Math.random() * Math.min(1000, baseMs);
    return Math.min(maxMs, Math.floor(exp + jitter));
}

/**
 * GET (or custom init) to ord with exponential backoff on network drops and transient HTTP errors.
 * Env: ORD_FETCH_MAX_RETRIES (default 10), ORD_FETCH_INITIAL_DELAY_MS (500), ORD_FETCH_MAX_DELAY_MS (120000).
 */
export async function fetchOrdWithRetry(url: string, init?: RequestInit): Promise<Response> {
    const maxRetries = Math.max(0, parseEnvInt('ORD_FETCH_MAX_RETRIES', 10));
    const baseMs = Math.max(50, parseEnvInt('ORD_FETCH_INITIAL_DELAY_MS', 500));
    const maxMs = Math.max(baseMs, parseEnvInt('ORD_FETCH_MAX_DELAY_MS', 120_000));
    const maxAttempts = maxRetries + 1;

    let lastErr: unknown;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            const res = await fetch(url, init);
            if (!res.ok && isRetryableOrdHttpStatus(res.status) && attempt < maxAttempts - 1) {
                const wait = backoffMs(attempt, baseMs, maxMs);
                console.warn(
                    `ord HTTP ${res.status} ${truncateUrl(url)} — retry ${attempt + 1}/${maxRetries} in ${wait}ms`,
                );
                await sleep(wait);
                continue;
            }
            return res;
        } catch (err) {
            lastErr = err;
            if (!isRetryableNetworkError(err) || attempt >= maxAttempts - 1) {
                throw err;
            }
            const wait = backoffMs(attempt, baseMs, maxMs);
            const brief = err instanceof Error ? err.message : String(err);
            console.warn(`ord fetch ${truncateUrl(url)} — ${brief} — retry ${attempt + 1}/${maxRetries} in ${wait}ms`);
            await sleep(wait);
        }
    }
    throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

function truncateUrl(url: string, max = 96): string {
    return url.length <= max ? url : `${url.slice(0, max)}…`;
}

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
    const res = await fetchOrdWithRetry(url, { headers: { Accept: 'application/json' } });
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
    const response = await fetchOrdWithRetry(url, { headers: { Accept: 'application/json' } });
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
    const response = await fetchOrdWithRetry(url, { headers: { Accept: 'application/json' } });
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
}

async function getInscriptionContent(inscriptionId: string, contentType: string) {
    const url = `${ORD_LITECOIN_URL}/content/${inscriptionId}`;
    const headers = { Accept: contentType };
    const response = await fetchOrdWithRetry(url, { headers });
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
