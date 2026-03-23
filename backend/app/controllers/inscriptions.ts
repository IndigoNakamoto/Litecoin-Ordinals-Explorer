import { Request, Response } from 'express';
import { Prisma, Inscription } from '@prisma/client';
import { getInscriptionData } from '../utils/ord-litecoin';
import prisma from '../../prisma/prismaClient';

const PAGE_SIZE = 100;

function toJsonInscription(i: Inscription) {
    return {
        ...i,
        output_value: Number(i.output_value),
    };
}

/** Ord `/inscription/:id` JSON varies by version; map common height aliases onto `genesis_height`. */
function coerceFiniteInt(value: unknown): number | undefined {
    if (value == null || value === '') return undefined;
    const n = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(n)) return undefined;
    return Math.floor(n);
}

/**
 * Ord JSON often has `genesis_height: 0` but the real reveal height in `height`.
 * Using `a ?? b` would keep 0 and never read `height` — prefer first strictly positive, else first defined.
 */
function pickFirstIntPreferPositive(...candidates: unknown[]): number | undefined {
    let zeroOrFallback: number | undefined;
    for (const c of candidates) {
        const n = coerceFiniteInt(c);
        if (n == null) continue;
        if (n > 0) return n;
        zeroOrFallback ??= n;
    }
    return zeroOrFallback;
}

function pickGenesisHeightFromOrd(ord: Record<string, unknown>): number | undefined {
    const nested: unknown[] = [];
    const genesis = ord.genesis;
    if (genesis && typeof genesis === 'object' && !Array.isArray(genesis)) {
        const g = genesis as Record<string, unknown>;
        nested.push(g.height, g.block_height);
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
function pickFeeFromOrd(ord: Record<string, unknown>): number | undefined {
    return pickFirstIntPreferPositive(ord.fee, ord.genesis_fee);
}

/**
 * Ord sometimes returns `height` / `genesis_fee` as 0 or omits them while Prisma has the indexed truth.
 * `0 ?? db` keeps 0 — so only trust ord when it gives a positive value, else prefer DB when DB is positive.
 */
function mergeNumericPreferPositive(ordValue: number | undefined, dbValue: number): number {
    if (ordValue != null && ordValue > 0) return ordValue;
    if (dbValue > 0) return dbValue;
    return ordValue ?? dbValue;
}

/**
 * When ord is reachable we still merge DB fields so clients always get `genesis_height`
 * (ord often exposes `height` only).
 */
function mergeOrdInscriptionWithDb(ord: unknown, db: Inscription) {
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

export const getInscriptionById = async (req: Request, res: Response) => {
    try {
        const { inscriptionId } = req.params;
        let inscription = await prisma.inscription.findUnique({
            where: { inscription_id: inscriptionId },
        });
        if (!inscription && /^\d+$/.test(inscriptionId)) {
            inscription = await prisma.inscription.findUnique({
                where: { id: parseInt(inscriptionId, 10) },
            });
        }
        if (inscription) {
            res.json(toJsonInscription(inscription));
        } else {
            res.status(404).json({ error: 'Inscription not found' });
        }
    } catch {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getInscriptionByNumber = async (req: Request, res: Response) => {
    try {
        const inscriptionNumber = parseInt(req.params.inscriptionNumber, 10);
        if (Number.isNaN(inscriptionNumber)) {
            res.status(400).json({ error: 'Invalid inscription number' });
            return;
        }
        const inscription = await prisma.inscription.findFirst({
            where: { inscription_number: inscriptionNumber },
        });
        if (inscription) {
            try {
                const ord = await getInscriptionData(inscription.inscription_id);
                res.json(mergeOrdInscriptionWithDb(ord, inscription));
            } catch (err) {
                console.warn(
                    `[inscriptions/number] ord enrichment failed for #${inscriptionNumber} (${inscription.inscription_id}):`,
                    err instanceof Error ? err.message : err,
                    '- returning DB row only. Set ORD_LITECOIN_URL and ensure ord is listening (mainnet usually :8081, regtest :8080).',
                );
                res.json(toJsonInscription(inscription));
            }
        } else {
            res.status(404).json({ error: 'Inscription not found' });
        }
    } catch {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

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

function calculateOffset(page: string | undefined): number {
    if (page && !Number.isNaN(Number(page))) {
        return (Number(page) - 1) * PAGE_SIZE;
    }
    return 0;
}

function prismaWhereCursed(cursed: string | undefined): Prisma.InscriptionWhereInput {
    if (cursed === 'true') return { inscription_number: { lt: 0 } };
    if (cursed === 'false') return { inscription_number: { gte: 0 } };
    return {};
}

async function fetchInscriptionsPrisma(
    where: Prisma.InscriptionWhereInput,
    sortOrder: string,
    cursed: string | undefined,
    offset: number,
    res: Response,
) {
    try {
        const rows = await prisma.inscription.findMany({
            where,
            orderBy: prismaOrderBy(sortOrder, cursed),
            skip: offset,
            take: PAGE_SIZE,
        });
        res.json(rows.map(toJsonInscription));
    } catch {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const getInscriptionsByContentType = async (req: Request, res: Response) => {
    const contentType = decodeURIComponent(req.params.contentType);
    const { sortOrder, page, cursed } = req.query;
    const offset = calculateOffset(page as string);
    const base = prismaWhereCursed(cursed as string);
    const where: Prisma.InscriptionWhereInput = { ...base, content_type: contentType };
    await fetchInscriptionsPrisma(where, (sortOrder as string) || 'number_asc', cursed as string, offset, res);
};

export const getInscriptionsByContentTypeType = async (req: Request, res: Response) => {
    const { contentTypeType } = req.params;
    const { sortOrder, page, cursed } = req.query;
    const offset = calculateOffset(page as string);
    const base = prismaWhereCursed(cursed as string);
    const where: Prisma.InscriptionWhereInput = { ...base, content_type_type: contentTypeType };
    await fetchInscriptionsPrisma(where, (sortOrder as string) || 'number_asc', cursed as string, offset, res);
};

export const getAllInscriptions = async (req: Request, res: Response) => {
    const { sortOrder, page, cursed } = req.query;
    const offset = calculateOffset(page as string);
    const where = prismaWhereCursed(cursed as string);
    await fetchInscriptionsPrisma(
        where,
        (sortOrder as string) || 'number_asc',
        cursed as string,
        offset,
        res,
    );
};
