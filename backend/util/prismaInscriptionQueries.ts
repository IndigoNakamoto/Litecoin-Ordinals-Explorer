import { PreInscription, Inscription } from './types';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const getInscriptionByNumber2 = async (inscription_number: number): Promise<Inscription | null> => {
    return await prisma.inscription.findFirst({ where: { inscription_number } }) as Inscription | null;
}

export const getInscriptionById2 = async (inscriptionId: string): Promise<Inscription | null> => {
    return await prisma.inscription.findFirst({ where: { inscription_id: inscriptionId } }) as Inscription | null;
}

// export const getInscriptionContentType = async (inscriptionId: string): Promise<string | null> => { }


const PAGE_SIZE = 100; // Number of records per page

export const filterAndSortInscriptions2 = async (
    contentTypeType: string | undefined,
    contentType: string | undefined,
    sortBy: 'newest' | 'oldest' | 'largestfile' | 'largestfee',
    page: number,
    cursed: boolean = false,
    inscriptionNumberRange?: [number, number] // New optional parameter for inscription number range
) => {
    let orderBy: any;

    // Determine sorting order
    switch (sortBy) {
        case 'newest':
            orderBy = { inscription_number: 'desc' };
            break;
        case 'oldest':
            orderBy = { inscription_number: 'asc' };
            break;
        case 'largestfile':
            orderBy = { content_length: 'desc' };
            break;
        case 'largestfee':
            orderBy = { genesis_fee: 'desc' };
            break;
        default:
            throw new Error('Invalid sorting option');
    }

    // Calculate skip value based on page number
    const skip = (page - 1) * PAGE_SIZE;

    // Construct the where clause
    const where: any = {
        ...(contentTypeType && { content_type_type: contentTypeType }),
        ...(contentType && { content_type: contentType }),
        inscription_number: {
            ...(cursed ? { gt: 0 } : { gte: 0 }) // Adjust condition based on the 'cursed' parameter
        }
    };

    // Add optional range filter if provided
    if (inscriptionNumberRange && inscriptionNumberRange.length === 2) {
        where.inscription_number = {
            ...where.inscription_number,
            gte: inscriptionNumberRange[0],
            lte: inscriptionNumberRange[1]
        };
    }

    // Query inscriptions
    const inscriptions = await prisma.inscription.findMany({
        where,
        orderBy,
        take: PAGE_SIZE, // Limit records per page
        skip // Skip records based on pagination
    });

    return inscriptions;
};


export const content_type_type_count = async (contentTypeType: string) => {
    const count = await prisma.inscription.count({ where: { content_type_type: contentTypeType } });
    return count;
}

export const getContentTypeTypeCounts = async () => {
    const contentTypes = await prisma.inscription.groupBy({
        by: ['content_type_type'],
        _count: {
            content_type_type: true
        }
    });
    return contentTypes;
}

const main = async () => {

    const inscriptionNumberRange = [0, 100]; // Example range from 0 to 100

    const inscriptions = await filterAndSortInscriptions2(
        'image',          // contentTypeType
        undefined,          // contentType
        'oldest',           // sortBy
        1,                  // page
        false,              // cursed
        // inscriptionNumberRange // inscriptionNumberRange
    );

    return inscriptions;

    // const count = await getContentTypeTypeCounts()
    // return count
}

main().then((data) => console.log(data)).catch((error) => console.error(error)) 