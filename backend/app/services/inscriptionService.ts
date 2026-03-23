/**
 * Domain access for Prisma-backed inscriptions + optional ord enrichment.
 * List endpoints use DB only (fast); detail endpoints merge ord when reachable (correct).
 */

import { Prisma, Inscription } from '@prisma/client';
import { getInscriptionData } from '../utils/ord-litecoin';
import prisma from '../../prisma/prismaClient';
import { mergeOrdInscriptionWithDb, toJsonInscription, type InscriptionJson } from '../../util/ordInscriptionMerge';

export const INSCRIPTION_PAGE_SIZE = 100;
export const INSCRIPTION_LIST_LIMIT_MAX = 100;

/** Optional `limit` query param for list APIs; clamped to [1, INSCRIPTION_LIST_LIMIT_MAX]. */
export function parseInscriptionListLimit(raw: unknown): number {
    const n =
        typeof raw === 'string'
            ? parseInt(raw, 10)
            : typeof raw === 'number' && Number.isFinite(raw)
              ? Math.floor(raw)
              : NaN;
    if (!Number.isFinite(n) || n < 1) return INSCRIPTION_PAGE_SIZE;
    return Math.min(n, INSCRIPTION_LIST_LIMIT_MAX);
}

export async function findInscriptionByIdParam(inscriptionId: string): Promise<Inscription | null> {
    let row = await prisma.inscription.findUnique({
        where: { inscription_id: inscriptionId },
    });
    if (!row && /^\d+$/.test(inscriptionId)) {
        row = await prisma.inscription.findUnique({
            where: { id: parseInt(inscriptionId, 10) },
        });
    }
    return row;
}

export async function findInscriptionByNumber(inscriptionNumber: number): Promise<Inscription | null> {
    return prisma.inscription.findFirst({
        where: { inscription_number: inscriptionNumber },
    });
}

/**
 * Load from DB and merge ord (same policy as by-number). Falls back to DB-only if ord fails.
 */
export async function getInscriptionDetailEnriched(
    row: Inscription,
    logLabel: string,
): Promise<InscriptionJson | Record<string, unknown>> {
    try {
        const ord = await getInscriptionData(row.inscription_id);
        return mergeOrdInscriptionWithDb(ord, row);
    } catch (err) {
        console.warn(
            `[inscriptions] ord enrichment failed for ${logLabel} (${row.inscription_id}):`,
            err instanceof Error ? err.message : err,
            '- returning DB row only. Set ORD_LITECOIN_URL and ensure ord is listening (mainnet usually :8081, regtest :8080).',
        );
        return toJsonInscription(row);
    }
}

function prismaOrderBy(
    sortOrder: string,
    cursed: string | undefined,
): Prisma.InscriptionOrderByWithRelationInput {
    if (sortOrder === 'genesis_fee') {
        return { genesis_fee: cursed === 'true' ? 'asc' : 'desc' };
    }
    if (sortOrder === 'content_length') {
        return { content_length: 'desc' };
    }
    if (sortOrder === 'number_desc') {
        return { inscription_number: 'desc' };
    }
    if (sortOrder === 'number_asc' || sortOrder === 'oldest') {
        return { inscription_number: 'asc' };
    }
    if (sortOrder === 'newest') {
        return { inscription_number: 'desc' };
    }
    return { inscription_number: 'asc' };
}

export function inscriptionListOffset(page: string | undefined, pageSize = INSCRIPTION_PAGE_SIZE): number {
    if (page && !Number.isNaN(Number(page))) {
        return (Number(page) - 1) * pageSize;
    }
    return 0;
}

export function prismaWhereCursed(cursed: string | undefined): Prisma.InscriptionWhereInput {
    if (cursed === 'true') return { inscription_number: { lt: 0 } };
    if (cursed === 'false') return { inscription_number: { gte: 0 } };
    return {};
}

export async function listInscriptionsJson(input: {
    where: Prisma.InscriptionWhereInput;
    sortOrder: string;
    cursed: string | undefined;
    offset: number;
    pageSize?: number;
}): Promise<InscriptionJson[]> {
    const take = input.pageSize ?? INSCRIPTION_PAGE_SIZE;
    const rows = await prisma.inscription.findMany({
        where: input.where,
        orderBy: prismaOrderBy(input.sortOrder, input.cursed),
        skip: input.offset,
        take,
    });
    return rows.map(toJsonInscription);
}
