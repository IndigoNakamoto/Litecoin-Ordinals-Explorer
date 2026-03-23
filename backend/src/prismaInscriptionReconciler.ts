import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { getInscriptionData } from '../util/ord-litecoin';
import { mapOrdJsonToInscriptionCreateInput } from '../util/ordInscriptionJson';
import { inscriptionCreateInputToUpdateData } from '../util/inscriptionPrismaMaps';

const prisma = new PrismaClient();

const PROGRESS_SCAN = 'reconcile_scan_cursor';
const PROGRESS_ZEROS = 'reconcile_zeros_cursor';
const PROGRESS_STALE = 'reconcile_stale_cursor';

function envInt(name: string, defaultValue: number): number {
    const v = process.env[name];
    if (v == null || v === '') return defaultValue;
    const n = parseInt(v, 10);
    return Number.isNaN(n) ? defaultValue : n;
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

let shutdownRequested = false;

process.on('SIGINT', () => {
    console.log('Reconciler: shutdown after current inscription…');
    shutdownRequested = true;
});

process.on('SIGTERM', () => {
    console.log('Reconciler: shutdown after current inscription…');
    shutdownRequested = true;
});

async function getCursor(progressKey: string): Promise<number> {
    const row = await prisma.updateProgress.findUnique({
        where: { progress_key: progressKey },
    });
    return row?.last_processed_block ?? 0;
}

async function setCursor(progressKey: string, id: number): Promise<void> {
    await prisma.updateProgress.upsert({
        where: { progress_key: progressKey },
        create: {
            progress_key: progressKey,
            last_processed_block: id,
            last_processed_page: 0,
        },
        update: {
            last_processed_block: id,
            last_processed_page: 0,
        },
    });
}

type Heuristic = 'zeros' | 'stale' | 'scan';

function resolveHeuristic(): Heuristic {
    const h = (process.env.RECONCILE_HEURISTIC || 'zeros').toLowerCase();
    if (h === 'scan' || h === 'full') return 'scan';
    if (h === 'stale' || h === 'nullsync') return 'stale';
    return 'zeros';
}

function progressKeyForHeuristic(h: Heuristic): string {
    if (h === 'scan') return PROGRESS_SCAN;
    if (h === 'stale') return PROGRESS_STALE;
    return PROGRESS_ZEROS;
}

async function fetchBatch(
    heuristic: Heuristic,
    batchSize: number,
    afterId: number,
): Promise<{ id: number; inscription_id: string }[]> {
    if (heuristic === 'scan') {
        return prisma.inscription.findMany({
            where: { id: { gt: afterId } },
            orderBy: { id: 'asc' },
            take: batchSize,
            select: { id: true, inscription_id: true },
        });
    }
    if (heuristic === 'stale') {
        return prisma.inscription.findMany({
            where: {
                id: { gt: afterId },
                ordSyncedAt: null,
            },
            orderBy: { id: 'asc' },
            take: batchSize,
            select: { id: true, inscription_id: true },
        });
    }
    return prisma.inscription.findMany({
        where: {
            id: { gt: afterId },
            OR: [{ genesis_height: 0 }, { genesis_fee: 0 }],
        },
        orderBy: { id: 'asc' },
        take: batchSize,
        select: { id: true, inscription_id: true },
    });
}

async function run(): Promise<void> {
    const batchSize = Math.max(1, envInt('RECONCILE_BATCH_SIZE', 25));
    const delayMs = Math.max(0, envInt('ORD_REQUEST_DELAY_MS', 75));
    const maxTotal = envInt('RECONCILE_MAX_INSCRIPTIONS', 0); // 0 = unlimited
    const heuristic = resolveHeuristic();
    const progressKey = progressKeyForHeuristic(heuristic);

    let afterId =
        process.env.RECONCILE_RESET_CURSOR === '1' || process.env.RECONCILE_RESET_CURSOR === 'true'
            ? 0
            : await getCursor(progressKey);

    let processed = 0;

    console.log(
        `Reconciler: heuristic=${heuristic} batch=${batchSize} delayMs=${delayMs} max=${maxTotal || '∞'} afterId=${afterId}`,
    );

    while (!shutdownRequested) {
        const batch = await fetchBatch(heuristic, batchSize, afterId);
        if (batch.length === 0) {
            console.log('Reconciler: no more rows in this pass; resetting cursor to 0.');
            await setCursor(progressKey, 0);
            break;
        }

        for (const row of batch) {
            if (shutdownRequested) break;
            if (maxTotal > 0 && processed >= maxTotal) {
                console.log(`Reconciler: hit RECONCILE_MAX_INSCRIPTIONS=${maxTotal}, stopping.`);
                shutdownRequested = true;
                break;
            }

            try {
                const raw = await getInscriptionData(row.inscription_id);
                const mapped = mapOrdJsonToInscriptionCreateInput(raw);
                if (!mapped) {
                    console.warn(`Reconciler: skip ${row.inscription_id} (unmappable ord JSON)`);
                } else {
                    const data = inscriptionCreateInputToUpdateData(mapped);
                    await prisma.inscription.update({
                        where: { inscription_id: row.inscription_id },
                        data: {
                            ...data,
                            ordSyncedAt: new Date(),
                        },
                    });
                    console.log(`Reconciler: updated id=${row.id} ${row.inscription_id}`);
                }
            } catch (e) {
                console.error(`Reconciler: failed ${row.inscription_id}:`, e);
                const backoff = envInt('RECONCILE_ERROR_BACKOFF_MS', 2000);
                if (backoff > 0) await sleep(backoff);
            }

            processed += 1;

            if (delayMs > 0) await sleep(delayMs);
        }

        const lastId = batch[batch.length - 1]!.id;
        afterId = lastId;
        await setCursor(progressKey, lastId);

        if (batch.length < batchSize) {
            console.log('Reconciler: final partial batch; resetting cursor to 0.');
            await setCursor(progressKey, 0);
            break;
        }
    }

    console.log(`Reconciler: done, processed=${processed}`);
}

run()
    .catch((e) => {
        console.error(e);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
