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
                res.json(await getInscriptionData(inscription.inscription_id));
            } catch {
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
