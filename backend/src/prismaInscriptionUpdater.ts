import { PrismaClient, Prisma } from '@prisma/client';
import { getInscriptionData, getBlockHeight, getBlockInscriptionsPage } from '../util/ord-litecoin';

const prisma = new PrismaClient();

interface ContentTypeCounts {
    [key: string]: number;
}

interface ContentTypeTypeCounts {
    [key: string]: number;
}

let shutdownRequested = false;

process.on('SIGINT', () => {
    console.log('Shutdown signal received. Finishing current block before shutting down...');
    shutdownRequested = true;
});

process.on('SIGTERM', () => {
    console.log('Shutdown signal received. Finishing current block before shutting down...');
    shutdownRequested = true;
});

async function getLastProcessedBlock(): Promise<number> {
    const progress = await prisma.inscription.findFirst({
        orderBy: {
            inscription_number: 'desc'
        }
    });
    return progress?.genesis_height ?? 0;
}

async function updateLastProcessedBlock(blockNumber: number, pageIndex: number): Promise<void> {
    try {
        // Upsert query: inserts or updates the last processed block and page
        await prisma.updateProgress.upsert({
            where: { progress_key: 'last_processed_block' },
            update: {
                last_processed_block: blockNumber,
                last_processed_page: pageIndex,
            },
            create: {
                progress_key: 'last_processed_block',
                last_processed_block: blockNumber,
                last_processed_page: pageIndex,
            },
        });
        console.log(`Updated progress to block ${blockNumber}, page ${pageIndex}`);
    } catch (error) {
        console.error('Error updating last processed block and page:', error);
        throw error;
    }
}

async function storeInscriptionsBatch(inscriptions: Array<Prisma.InscriptionUncheckedCreateInput>) {
    let totalGenesisFee = 0;
    let totalContentLength = 0;
    const contentTypeCounts: ContentTypeCounts = {};
    const contentTypeTypeCounts: ContentTypeTypeCounts = {};

    // Process inscriptions to include content_type_type and aggregate counts
    const modifiedInscriptions: Array<Prisma.InscriptionUncheckedCreateInput & { content_type_type: string }> = inscriptions.map(inscription => {
        const [type] = inscription.content_type.split('/'); // Extract "type" from "type/subtype"
        totalGenesisFee += inscription.genesis_fee ?? 0;
        totalContentLength += inscription.content_length ?? 0;

        // Count occurrences of content_type
        contentTypeCounts[inscription.content_type] = (contentTypeCounts[inscription.content_type] || 0) + 1;
        // Count occurrences of content_type_type
        contentTypeTypeCounts[type] = (contentTypeTypeCounts[type] || 0) + 1;

        return {
            ...inscription,
            content_type_type: type,
        };
    });

    // Insert modified inscriptions with createMany
    const result = await prisma.inscription.createMany({
        data: modifiedInscriptions,
    });

    // Update aggregate statistics in InscriptionStats
    // Assume there's a singleton pattern or specific record for updating
    await prisma.inscriptionStats.upsert({
        where: { id: 1 }, // Example condition, adjust based on your schema's identification strategy
        update: {
            totalGenesisFee: { increment: totalGenesisFee },
            totalContentLength: { increment: totalContentLength },
        },
        create: {
            totalGenesisFee,
            totalContentLength,
        },
    });

    return result;
}



async function main() {
    let lastProcessedBlock = await getLastProcessedBlock();
    if (lastProcessedBlock === 0) {
        // Handle the case when no last processed block is found
        // Set a default value or perform a specific action
        lastProcessedBlock = 2425360; // Example default value
    }

    const currentHeight = await getBlockHeight();
    const CONFIRMATIONS_REQUIRED = 1;
    const safeHeight = currentHeight - CONFIRMATIONS_REQUIRED;

    for (let blockNumber = lastProcessedBlock; blockNumber <= safeHeight && !shutdownRequested; blockNumber++) {
        let pageNumber = 0;
        if (blockNumber === lastProcessedBlock) {
            // Resume from the last processed page
            const lastProcessedPage = await getLastProcessedBlock();
            if (lastProcessedPage !== null) {
                pageNumber = lastProcessedPage + 1;
            }
        }

        let more = true;

        while (more && !shutdownRequested) {
            const { inscriptions, more: morePages } = await getBlockInscriptionsPage(blockNumber, pageNumber);
            const inscriptionsData = [];

            for (const inscriptionId of inscriptions) {
                try {
                    console.log('Get inscription: ', inscriptionId)
                    const inscriptionData = await getInscriptionData(inscriptionId);
                    console.log('Got inscription: ', inscriptionData.inscription_number)
                    inscriptionsData.push(inscriptionData);
                } catch (error) {
                    console.error(`Error fetching inscription ${inscriptionId}:`, error);
                }
            }

            if (inscriptionsData.length > 0) {
                await storeInscriptionsBatch(inscriptionsData);
            }

            console.log(`Block: ${blockNumber} - Page: ${pageNumber}`);

            more = morePages;
            pageNumber++;
        }

        await updateLastProcessedBlock(blockNumber, pageNumber - 1);
        console.log('Updated Inscriptions Table \n')

        if (shutdownRequested) {
            console.log('Shutdown requested, finishing up...');
            break;
        }
    }
}


main()
    .catch(e => {
        console.error(e.message)
    }).finally(async () => {
        await prisma.$disconnect()
    }
    )