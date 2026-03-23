import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Recompute `InscriptionStats` id=1 from live `Inscription` rows.
 * Safe after reconciler updates (indexer increments are not adjusted — run this to realign totals).
 */
async function rebuild(): Promise<void> {
    const [agg, totalInscriptions] = await Promise.all([
        prisma.inscription.aggregate({
            _sum: {
                genesis_fee: true,
                content_length: true,
            },
        }),
        prisma.inscription.count(),
    ]);

    const totalGenesisFee = BigInt(agg._sum.genesis_fee ?? 0);
    const totalContentLength = BigInt(agg._sum.content_length ?? 0);

    await prisma.inscriptionStats.upsert({
        where: { id: 1 },
        create: {
            id: 1,
            totalGenesisFee,
            totalContentLength,
        },
        update: {
            totalGenesisFee,
            totalContentLength,
        },
    });

    console.log(
        `stats:rebuild — totalInscriptions=${totalInscriptions} totalGenesisFee=${totalGenesisFee} totalContentLength=${totalContentLength}`,
    );
}

rebuild()
    .catch((e) => {
        console.error(e);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
