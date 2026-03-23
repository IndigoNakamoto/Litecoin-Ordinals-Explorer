import 'dotenv/config';
import { PrismaClient, Prisma } from '@prisma/client';
import { getInscriptionData, getBlockHeight, getBlockInscriptionsPage } from '../util/ord-litecoin';
import { mapOrdJsonToInscriptionCreateInput } from '../util/ordInscriptionJson';

const prisma = new PrismaClient();

const PROGRESS_KEY = 'indexer_cursor';

let shutdownRequested = false;

process.on('SIGINT', () => {
    console.log('Shutdown signal received. Finishing current page...');
    shutdownRequested = true;
});

process.on('SIGTERM', () => {
    console.log('Shutdown signal received. Finishing current page...');
    shutdownRequested = true;
});

async function getCursor(): Promise<{ block: number; page: number }> {
    const row = await prisma.updateProgress.findUnique({
        where: { progress_key: PROGRESS_KEY },
    });
    return {
        block: row?.last_processed_block ?? 0,
        page: row?.last_processed_page ?? 0,
    };
}

async function setCursor(block: number, page: number): Promise<void> {
    await prisma.updateProgress.upsert({
        where: { progress_key: PROGRESS_KEY },
        create: {
            progress_key: PROGRESS_KEY,
            last_processed_block: block,
            last_processed_page: page,
        },
        update: {
            last_processed_block: block,
            last_processed_page: page,
        },
    });
}

async function storeInscriptionsBatch(rows: Prisma.InscriptionCreateManyInput[]): Promise<void> {
    if (rows.length === 0) return;

    let totalGenesisFee = 0;
    let totalContentLength = 0;
    for (const r of rows) {
        totalGenesisFee += Number(r.genesis_fee ?? 0);
        totalContentLength += Number(r.content_length ?? 0);
    }

    await prisma.inscription.createMany({
        data: rows,
        skipDuplicates: true,
    });

    await prisma.inscriptionStats.upsert({
        where: { id: 1 },
        create: {
            id: 1,
            totalGenesisFee: BigInt(totalGenesisFee),
            totalContentLength: BigInt(totalContentLength),
        },
        update: {
            totalGenesisFee: { increment: BigInt(totalGenesisFee) },
            totalContentLength: { increment: BigInt(totalContentLength) },
        },
    });
}

async function runLoop(): Promise<void> {
    let b = 0;
    let p = 0;
    const cursor = await getCursor();
    b = cursor.block;
    p = cursor.page;

    const start =
        process.env.INDEXER_START_HEIGHT != null && process.env.INDEXER_START_HEIGHT !== ''
            ? parseInt(process.env.INDEXER_START_HEIGHT, 10)
            : NaN;
    if (b === 0 && p === 0 && !Number.isNaN(start) && start > 0) {
        b = start;
    }

    const currentHeight = await getBlockHeight();
    const CONFIRMATIONS_REQUIRED = 1;
    const safeHeight = Math.max(0, currentHeight - CONFIRMATIONS_REQUIRED);

    console.log(`Indexer: cursor block=${b} page=${p}, chain safeHeight=${safeHeight}`);

    while (b <= safeHeight && !shutdownRequested) {
        const { inscriptions: ids, more } = await getBlockInscriptionsPage(b, p);

        const rows: Prisma.InscriptionCreateManyInput[] = [];
        for (const inscriptionId of ids) {
            try {
                const raw = await getInscriptionData(inscriptionId);
                const row = mapOrdJsonToInscriptionCreateInput(raw);
                if (row) rows.push(row);
            } catch (err) {
                console.error(`Error fetching inscription ${inscriptionId}:`, err);
            }
        }

        if (rows.length > 0) {
            const now = new Date();
            await storeInscriptionsBatch(rows.map((r) => ({ ...r, ordSyncedAt: now })));
        }

        if (more) {
            p += 1;
        } else {
            b += 1;
            p = 0;
        }
        await setCursor(b, p);
        console.log(`Progress: next block=${b} page=${p} (more=${more})`);
    }

    console.log('Indexer finished or shut down.');
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * On fatal errors (DB, exhausted ord retries), wait with exponential backoff and resume from DB cursor.
 * Env: INDEXER_RESTART_BASE_MS (2000), INDEXER_RESTART_MAX_MS (300000).
 */
async function runWithRestartBackoff(): Promise<void> {
    const baseMs = Math.max(500, parseInt(process.env.INDEXER_RESTART_BASE_MS || '2000', 10) || 2000);
    const maxMs = Math.max(baseMs, parseInt(process.env.INDEXER_RESTART_MAX_MS || String(300_000), 10) || 300_000);
    let failureStreak = 0;

    while (!shutdownRequested) {
        try {
            await runLoop();
            return;
        } catch (e) {
            if (shutdownRequested) return;
            failureStreak += 1;
            console.error('Indexer loop failed:', e);
            const exp = Math.min(maxMs, baseMs * Math.pow(2, Math.min(failureStreak - 1, 16)));
            const jitter = Math.random() * Math.min(1500, baseMs);
            const delay = Math.min(maxMs, Math.floor(exp + jitter));
            console.warn(`Restarting indexer in ${delay}ms (failure streak ${failureStreak})…`);
            await sleep(delay);
        }
    }
}

runWithRestartBackoff()
    .catch((e) => {
        console.error(e);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
