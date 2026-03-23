/**
 * Normalize ord `/inscription/:id` JSON into Prisma inscription fields.
 * Ord versions differ: e.g. `fee` vs `genesis_fee`, `height` vs `genesis_height` (often 0).
 * Keep in sync with merge logic in app/controllers/inscriptions.ts — indexer must use the same rules.
 */

import type { Prisma } from '@prisma/client';

export function coerceFiniteInt(value: unknown): number | undefined {
    if (value == null || value === '') return undefined;
    const n = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(n)) return undefined;
    return Math.floor(n);
}

/**
 * Ord JSON often has `genesis_height: 0` but the real reveal height in `height`.
 * Prefer first strictly positive, else first defined (including 0).
 */
export function pickFirstIntPreferPositive(...candidates: unknown[]): number | undefined {
    let zeroOrFallback: number | undefined;
    for (const c of candidates) {
        const n = coerceFiniteInt(c);
        if (n == null) continue;
        if (n > 0) return n;
        zeroOrFallback ??= n;
    }
    return zeroOrFallback;
}

export function pickGenesisHeightFromOrd(ord: Record<string, unknown>): number | undefined {
    const nested: unknown[] = [];
    const genesis = ord.genesis;
    if (genesis && typeof genesis === 'object' && !Array.isArray(genesis)) {
        const g = genesis as Record<string, unknown>;
        nested.push(g.height, g.block_height, g.blockheight);
    }

    return pickFirstIntPreferPositive(
        ord.height,
        ord.genesis_height,
        ord.block_height,
        ord.blockheight,
        ...nested,
    );
}

/** Current ord API uses `fee`; older payloads may use `genesis_fee`. */
export function pickFeeFromOrd(ord: Record<string, unknown>): number | undefined {
    const nested: unknown[] = [];
    const genesis = ord.genesis;
    if (genesis && typeof genesis === 'object' && !Array.isArray(genesis)) {
        const g = genesis as Record<string, unknown>;
        nested.push(g.fee, g.genesis_fee);
    }
    return pickFirstIntPreferPositive(ord.fee, ord.genesis_fee, ...nested);
}

function stringifyMetadata(m: unknown): string | null {
    if (m == null) return null;
    if (typeof m === 'string') return m;
    if (typeof m === 'object') {
        try {
            return JSON.stringify(m);
        } catch {
            return String(m);
        }
    }
    return String(m);
}

function stringArrayFromOrd(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value.map((x) => String(x));
}

/**
 * Map ord inscription JSON → Prisma create input. Returns null if no usable inscription id.
 */
export function mapOrdJsonToInscriptionCreateInput(raw: unknown): Prisma.InscriptionCreateManyInput | null {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    const o = raw as Record<string, unknown>;

    const inscription_id = String(o.inscription_id ?? o.id ?? '');
    if (!inscription_id) return null;

    const content_type = String(o.content_type ?? 'application/octet-stream');
    const [mimePrimary] = content_type.split('/');
    const content_type_type =
        o.content_type_type != null && String(o.content_type_type)
            ? String(o.content_type_type)
            : mimePrimary || null;

    const outputRaw = o.output_value ?? o.output ?? o.value ?? 0;
    let output_value: bigint;
    if (typeof outputRaw === 'bigint') output_value = outputRaw;
    else output_value = BigInt(Math.max(0, Math.floor(Number(outputRaw)) || 0));

    const tsRaw = o.timestamp;
    let timestamp = 0;
    if (typeof tsRaw === 'number' && !Number.isNaN(tsRaw)) timestamp = Math.floor(tsRaw);
    else if (typeof tsRaw === 'string') {
        const n = Date.parse(tsRaw);
        timestamp = Number.isNaN(n) ? 0 : Math.floor(n / 1000);
    }

    const genesis_height = pickGenesisHeightFromOrd(o) ?? 0;
    const genesis_fee = pickFeeFromOrd(o) ?? 0;

    const inscription_number = Math.floor(
        Number(o.inscription_number ?? o.number ?? o.inscriptionNumber ?? 0),
    );

    return {
        address: String(o.address ?? ''),
        content_length: Math.max(0, Math.floor(Number(o.content_length ?? o.size ?? 0))),
        content_type,
        content_type_type,
        genesis_fee: Math.max(0, genesis_fee),
        genesis_height: Math.max(0, genesis_height),
        inscription_number: Number.isFinite(inscription_number) ? inscription_number : 0,
        next: o.next != null && o.next !== '' ? String(o.next) : null,
        output_value,
        parent: o.parent != null && o.parent !== '' ? String(o.parent) : null,
        previous: o.previous != null && o.previous !== '' ? String(o.previous) : null,
        script_pubkey: String(o.script_pubkey ?? o.script_pubkey_asm ?? ''),
        metadata: stringifyMetadata(o.metadata),
        charms: stringArrayFromOrd(o.charms),
        genesis_address:
            o.genesis_address != null && o.genesis_address !== ''
                ? String(o.genesis_address)
                : null,
        inscription_id,
        children: stringArrayFromOrd(o.children),
        processed: Boolean(o.processed ?? false),
        rune: o.rune != null && o.rune !== '' ? String(o.rune) : null,
        sat: o.sat != null && o.sat !== '' ? String(o.sat) : null,
        satpoint: String(o.satpoint ?? ''),
        timestamp,
        nsfw: Boolean(o.nsfw ?? false),
    };
}
