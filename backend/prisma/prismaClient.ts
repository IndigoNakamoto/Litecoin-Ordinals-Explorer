import { PrismaClient, Prisma } from '@prisma/client';
import { getInscriptionData, getBlockHeight, getBlockInscriptionsPage } from '../util/ord-litecoin';

const prisma = new PrismaClient();

prisma.inscription.findFirst({ where: { inscription_number: 0 } }).then((progress) => {
    console.log(progress)
})