import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import {
    findInscriptionByIdParam,
    findInscriptionByNumber,
    getInscriptionDetailEnriched,
    inscriptionListOffset,
    listInscriptionsJson,
    parseInscriptionListLimit,
    prismaWhereCursed,
} from '../services/inscriptionService';

export const getInscriptionById = async (req: Request, res: Response) => {
    try {
        const { inscriptionId } = req.params;
        const inscription = await findInscriptionByIdParam(inscriptionId);
        if (inscription) {
            const payload = await getInscriptionDetailEnriched(inscription, `id:${inscriptionId}`);
            res.json(payload);
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
        const inscription = await findInscriptionByNumber(inscriptionNumber);
        if (inscription) {
            const payload = await getInscriptionDetailEnriched(
                inscription,
                `#${inscriptionNumber}`,
            );
            res.json(payload);
        } else {
            res.status(404).json({ error: 'Inscription not found' });
        }
    } catch {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getInscriptionsByContentType = async (req: Request, res: Response) => {
    const contentType = decodeURIComponent(req.params.contentType);
    const { sortOrder, page, cursed } = req.query;
    const offset = inscriptionListOffset(page as string);
    const base = prismaWhereCursed(cursed as string);
    const where: Prisma.InscriptionWhereInput = { ...base, content_type: contentType };
    try {
        const rows = await listInscriptionsJson({
            where,
            sortOrder: (sortOrder as string) || 'number_asc',
            cursed: cursed as string,
            offset,
        });
        res.json(rows);
    } catch {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getInscriptionsByContentTypeType = async (req: Request, res: Response) => {
    const { contentTypeType } = req.params;
    const { sortOrder, page, cursed, limit } = req.query;
    const pageSize = parseInscriptionListLimit(limit);
    const offset = inscriptionListOffset(page as string, pageSize);
    const base = prismaWhereCursed(cursed as string);
    const where: Prisma.InscriptionWhereInput = { ...base, content_type_type: contentTypeType };
    try {
        const rows = await listInscriptionsJson({
            where,
            sortOrder: (sortOrder as string) || 'number_asc',
            cursed: cursed as string,
            offset,
            pageSize,
        });
        res.json(rows);
    } catch {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getAllInscriptions = async (req: Request, res: Response) => {
    const { sortOrder, page, cursed, limit } = req.query;
    const pageSize = parseInscriptionListLimit(limit);
    const offset = inscriptionListOffset(page as string, pageSize);
    const where = prismaWhereCursed(cursed as string);
    try {
        const rows = await listInscriptionsJson({
            where,
            sortOrder: (sortOrder as string) || 'number_asc',
            cursed: cursed as string,
            offset,
            pageSize,
        });
        res.json(rows);
    } catch {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
