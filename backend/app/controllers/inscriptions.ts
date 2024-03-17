import { Request, Response } from 'express';
import Inscription from '../models/Inscription';
import { Op } from 'sequelize';
import { getInscriptionData } from '../utils/ord-litecoin';
import { FindOptions } from 'sequelize';

const PAGE_SIZE = 100; // Number of items per page

export const getInscriptionById = async (req: Request, res: Response) => {
    try {
        const { inscriptionId } = req.params;
        const inscription = await Inscription.findByPk(inscriptionId);
        if (inscription) {
            res.json(inscription);
        } else {
            res.status(404).json({ error: 'Inscription not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getInscriptionByNumber = async (req: Request, res: Response) => {
    try {
        const { inscriptionNumber } = req.params;
        const inscription = await Inscription.findOne({ where: { inscription_number: inscriptionNumber } });
        const inscriptionData = await getInscriptionData(inscription!['inscription_id']);
        
        if (inscription) {
            res.json(inscriptionData);
        } else {
            res.status(404).json({ error: 'Inscription not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

function determineOrderCriteria(sortOrder: string, cursed: string | undefined): [string, string][] {
    let defaultOrder = 'DESC';
    // Check if sortOrder is 'genesis_fee' and cursed is 'true', then set default order to 'ASC'
    if (sortOrder === 'genesis_fee' && cursed === 'true') {
        defaultOrder = 'ASC';
    }

    switch (sortOrder) {
        case 'genesis_fee':
            return [['genesis_fee', defaultOrder]];
        case 'content_length':
            return [['content_length', defaultOrder]];
        case 'number_desc':
            return [['inscription_number', 'DESC']];
        case 'number_asc':
            return [['inscription_number', 'ASC']];
        default:
            return [['inscription_number', 'ASC']];
    }
}

// Helper function to calculate offset
function calculateOffset(page: string | undefined): number {
    if (page && !isNaN(Number(page))) {
        return (Number(page) - 1) * PAGE_SIZE;
    }
    return 0;
}

// Helper function to construct where condition
function constructWhereCondition(cursed: string | undefined, additionalCondition: any = {}): any {
    const whereCondition: any = { ...additionalCondition };
    if (cursed === 'true') {
        whereCondition.inscription_number = { [Op.lt]: 0 };
    } else if (cursed === 'false') {
        whereCondition.inscription_number = { [Op.gte]: 0 };
    }
    return whereCondition;
}

// Helper function to determine the partitioned table based on contentType
function determinePartitionTable(contentType: string): string {
    // Map contentType to corresponding partitioned table
    switch (contentType) {
        case 'image':
            return 'inscriptions_image';
        case 'text':
            return 'inscriptions_text';
        case 'video':
            return 'inscriptions_video';
        case 'audio':
            return 'inscriptions_audio';
        case 'model':
            return 'inscriptions_model';
        case 'application':
            return 'inscriptions_application';
        default:
            return 'inscriptions_default'; // Default partition
    }
}

// Fetch and return inscriptions based on provided criteria
interface CustomFindOptions extends FindOptions {
    tableHints?: string[];
}

async function fetchInscriptions(partitionTable: string, whereCondition: any, orderCriteria: [string, string][], offset: number, res: Response) {
    try {
        const inscriptions = await Inscription.findAll({
            where: whereCondition,
            order: orderCriteria,
            limit: PAGE_SIZE,
            offset: offset,
            // Specify the target partitioned table
            tableHints: [`WITH (FORCESEEK, INDEX(idx_${partitionTable}_content_type))`]
        } as CustomFindOptions);
        res.json(inscriptions);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Controller function for getting inscriptions by content type
export const getInscriptionsByContentType = async (req: Request, res: Response) => {
    const { contentType } = req.params;
    const { sortOrder, page, cursed } = req.query;
    const orderCriteria = determineOrderCriteria(sortOrder as string, cursed as string);
    const offset = calculateOffset(page as string);
    const partitionTable = determinePartitionTable(contentType);
    const whereCondition = constructWhereCondition(cursed as string, { content_type: contentType });
    await fetchInscriptions(partitionTable, whereCondition, orderCriteria, offset, res);
};

export const getInscriptionsByContentTypeType = async (req: Request, res: Response) => {
    const { contentTypeType } = req.params;
    const { sortOrder, page, cursed } = req.query;
    const orderCriteria = determineOrderCriteria(sortOrder as string, cursed as string);
    const offset = calculateOffset(page as string);
    const partitionTable = determinePartitionTable(contentTypeType);
    const whereCondition = constructWhereCondition(cursed as string, { content_type_type: contentTypeType });
    await fetchInscriptions(partitionTable, whereCondition, orderCriteria, offset, res);
};

export const getAllInscriptions = async (req: Request, res: Response) => {
    const { sortOrder, page, cursed } = req.query;
    const orderCriteria = determineOrderCriteria(sortOrder as string, cursed as string);
    const offset = calculateOffset(page as string);
    const partitionTable = 'inscriptions_default'; // Default partition table
    const whereCondition = constructWhereCondition(cursed as string);
    await fetchInscriptions(partitionTable, whereCondition, orderCriteria, offset, res);
};