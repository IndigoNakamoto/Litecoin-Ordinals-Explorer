// import { PreInscription, Inscription } from './types';
// import { PrismaClient, Prisma } from '@prisma/client';
// import { ContentTypeType, ContentType } from './types';

// const prisma = new PrismaClient();

// export const getInscriptionByNumber2 = async (inscription_number: number): Promise<Inscription | null> => {
//     return await prisma.inscription.findFirst({ where: { inscription_number } }) as Inscription | null;
// }

// export const getInscriptionById2 = async (inscriptionId: string): Promise<Inscription | null> => {
//     return await prisma.inscription.findFirst({ where: { inscription_id: inscriptionId } }) as Inscription | null;
// }

// // export const getInscriptionContentType = async (inscriptionId: string): Promise<string | null> => { }


// export const filterAndSortInscriptions2 = async (
//     contentTypeType: ContentTypeType | undefined,
//     contentType: ContentType | undefined,
//     sortBy: 'newest' | 'oldest' | 'largestfile' | 'largestfee',
//     page: number,
//     cursed: boolean = false,
//     page_size: number = 200, // New optional parameter for page size
//     inscriptionNumberRange?: [number, number] // New optional parameter for inscription number range
// ) => {
//     let orderBy: any;

//     // Determine sorting order
//     switch (sortBy) {
//         case 'newest':
//             orderBy = { inscription_number: 'desc' };
//             break;
//         case 'oldest':
//             orderBy = { inscription_number: 'asc' };
//             break;
//         case 'largestfile':
//             orderBy = { content_length: 'desc' };
//             break;
//         case 'largestfee':
//             orderBy = { genesis_fee: 'desc' };
//             break;
//         default:
//             throw new Error('Invalid sorting option');
//     }

//     // Calculate skip value based on page number
//     const skip = (page - 1) * page_size;

//     // Construct the where clause
//     const where: any = {
//         ...(contentTypeType && { content_type_type: contentTypeType }),
//         ...(contentType && { content_type: contentType }),
//         inscription_number: {
//             ...(cursed ? { gt: 0 } : { gte: 0 }) // Adjust condition based on the 'cursed' parameter
//         }
//     };

//     // Add optional range filter if provided
//     if (inscriptionNumberRange && inscriptionNumberRange.length === 2) {
//         where.inscription_number = {
//             ...where.inscription_number,
//             gte: inscriptionNumberRange[0],
//             lte: inscriptionNumberRange[1]
//         };
//     }

//     // Query inscriptions
//     const inscriptions = await prisma.inscription.findMany({
//         where,
//         orderBy,
//         take: page_size, // Limit records per page
//         skip // Skip records based on pagination
//     });

//     return inscriptions;
// };

// function mapData(inputArray: any[]) {
//     return inputArray.map(item => {
//         // Extract the key (content_type_type as String) and its count
//         const key = item.content_type_type;
//         const value = item._count.content_type_type;

//         // Return a new object with the structure {String: Number}
//         return { content_type: key, count: value };
//     });
// }


// export const getContentTypeTypeCounts = async () => {
//     const contentTypes = await prisma.inscription.groupBy({
//         by: ['content_type_type'],
//         _count: {
//             content_type_type: true
//         }
//     });
//     const contentTypesMapped = mapData(contentTypes);
//     return contentTypesMapped;
// }

// export const getMainTotals = async () => {
//     const contentTypes = await prisma.inscription.groupBy({
//         by: ['content_type_type'],
//         _count: {
//             content_type_type: true
//         }
//     });
//     const contentTypesMapped = mapData(contentTypes);

//     const totalInscriptions = await prisma.inscription.count();

//     const totals = await prisma.inscriptionStats.findFirst({
//         where: { id: 1 },
//         select: {
//             totalGenesisFee: true,
//             totalContentLength: true,
//         }
//     });

//     if (totals) {
//         // Convert BigInt to Number, ensure they are within safe range
//         const safeTotals = {
//             totalGenesisFee: Number(totals.totalGenesisFee),
//             totalContentLength: Number(totals.totalContentLength),
//             totalInscriptions: Number(totalInscriptions),
//             contentTypesMapped
//         };
//         return safeTotals;
//     }

//     // Handle case where totals might be undefined
//     return null;
// };

// export const testAudioView = async () => {
//     const audio = await prisma.inscription.findMany({where: { content_type_type: 'audio' }});
//     return audio;
// }

// const main = async () => {

//     const inscriptionNumberRange = [0, 100]; // Example range from 0 to 100

//     // const inscriptions = await filterAndSortInscriptions2(
//     //     'image',          // contentTypeType
//     //     undefined,          // contentType
//     //     'oldest',           // sortBy
//     //     1,                  // page
//     //     false,              // cursed
//     //     // inscriptionNumberRange // inscriptionNumberRange
//     // );

//     // return inscriptions;

//     // const result = await getMainTotals()

//     const result = await testAudioView()

//     // let result = 
//     // console.log(result)
//     return result

//     // const unqiue = await getUniqueContentTypeTypes()
//     // console.log(unqiue)
// }

// main().then((data) => console.log(data)).catch((error) => console.error(error)) 