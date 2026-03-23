/**
 * Merge ord `/inscription/:id` JSON with a Prisma Inscription row for API responses.
 * Uses the same height/fee picks as `ordInscriptionJson` mapping.
 */

import type { Inscription } from '@prisma/client';
import {
    coerceFiniteInt,
    pickFeeFromOrd,
    pickGenesisHeightFromOrd,
} from './ordInscriptionJson';

export type InscriptionJson = ReturnType<typeof toJsonInscription>;

export function toJsonInscription(i: Inscription) {
    return {
        ...i,
        output_value: Number(i.output_value),
    };
}

function mergeNumericPreferPositive(ordValue: number | undefined, dbValue: number): number {
    if (ordValue != null && ordValue > 0) return ordValue;
    if (dbValue > 0) return dbValue;
    return ordValue ?? dbValue;
}

/**
 * When ord is reachable we still merge DB fields so clients always get `genesis_height`
 * (ord often exposes `height` only).
 */
export function mergeOrdInscriptionWithDb(ord: unknown, db: Inscription) {
    const base = toJsonInscription(db);
    if (!ord || typeof ord !== 'object' || Array.isArray(ord)) {
        return base;
    }
    const o = ord as Record<string, unknown>;
    const ordHeight = pickGenesisHeightFromOrd(o);
    const dbHeight = Number(base.genesis_height);
    const genesisHeight = mergeNumericPreferPositive(ordHeight, dbHeight);

    const ordFee = pickFeeFromOrd(o);
    const dbFee = Number(base.genesis_fee);
    const genesisFee = mergeNumericPreferPositive(ordFee, dbFee);

    return {
        ...base,
        ...o,
        genesis_height: genesisHeight,
        genesis_fee: genesisFee,
        output_value:
            coerceFiniteInt(o.output_value) != null ? Number(o.output_value) : base.output_value,
    };
}
