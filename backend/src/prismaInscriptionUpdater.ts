import 'dotenv/config';
import { PrismaClient, Prisma } from '@prisma/client';
import { getInscriptionData, getBlockHeight, getBlockInscriptionsPage } from '../util/ord-litecoin';

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

function mapOrdJsonToCreateInput(raw: unknown): Prisma.InscriptionCreateManyInput | null {
    if (!raw || typeof raw !== 'object') return null;
    const o = raw as Record<string, unknown>;

    const inscription_id = String(o.inscription_id ?? o.id ?? '');
    if (!inscription_id) return null;

    const content_type = String(o.content_type ?? 'application/octet-stream');
    const [mimePrimary] = content_type.split('/');
    const content_type_type =
        o.content_type_type != null && String(o.content_type_type)
            ? String(o.content_type_type)
            : mimePrimary || null;

    const outputRaw = o.output_value ?? o.output ?? 0;
    let output_value: bigint;
    if (typeof outputRaw === 'bigint') output_value = outputRaw;
    else output_value = BigInt(Math.max(0, Math.floor(Number(outputRaw)) || 0));

    const tsRaw = o.timestamp;
    let timestamp = 0;
    if (typeof tsRaw === 'number' && !Number.isNaN(tsRaw)) timestamp = Math.floor(tsRaw);
    else if (typeof tsRaw === 'string') {
        const n = Date.parse(tsRaw);
        timestamp = Number.isNaN(n) ? 0 : Math.floor(n / 1000);
    }

    return {
        address: String(o.address ?? ''),
        content_length: Math.max(0, Math.floor(Number(o.content_length ?? 0))),
        content_type,
        content_type_type,
        genesis_fee: Math.max(0, Math.floor(Number(o.genesis_fee ?? 0))),
        genesis_height: Math.max(0, Math.floor(Number(o.genesis_height ?? 0))),
        inscription_number: Math.floor(Number(o.inscription_number ?? o.number ?? 0)),
        next: o.next != null && o.next !== '' ? String(o.next) : null,
        output_value,
        parent: o.parent != null && o.parent !== '' ? String(o.parent) : null,
        previous: o.previous != null && o.previous !== '' ? String(o.previous) : null,
        script_pubkey: String(o.script_pubkey ?? ''),
        metadata: o.metadata != null ? String(o.metadata) : null,
        charms: Array.isArray(o.charms) ? o.charms.map(String) : [],
        genesis_address:
            o.genesis_address != null && o.genesis_address !== '' ? String(o.genesis_address) : null,
        inscription_id,
        children: Array.isArray(o.children) ? o.children.map(String) : [],
        processed: Boolean(o.processed ?? false),
        rune: o.rune != null && o.rune !== '' ? String(o.rune) : null,
        sat: o.sat != null && o.sat !== '' ? String(o.sat) : null,
        satpoint: String(o.satpoint ?? ''),
        timestamp,
        nsfw: Boolean(o.nsfw ?? false),
    };
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
                const row = mapOrdJsonToCreateInput(raw);
                if (row) rows.push(row);
            } catch (err) {
                console.error(`Error fetching inscription ${inscriptionId}:`, err);
            }
        }

        if (rows.length > 0) {
            await storeInscriptionsBatch(rows);
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

runLoop()
    .catch((e) => {
        console.error(e);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
