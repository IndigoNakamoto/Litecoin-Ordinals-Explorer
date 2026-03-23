import prisma from '../../prisma/prismaClient';

interface ContentTypeCount {
  content_type_type: string;
  count: number;
}

export async function getInscriptionStats() {
  try {
    const [totalInscriptions, sums, groupedContentTypes] = await Promise.all([
      prisma.inscription.count(),
      prisma.inscription.aggregate({
        _sum: {
          genesis_fee: true,
          content_length: true,
        },
      }),
      prisma.inscription.groupBy({
        by: ['content_type_type'],
        _count: {
          content_type_type: true,
        },
      }),
    ]);

    const contentTypesCounts: ContentTypeCount[] = groupedContentTypes.map((item) => ({
      content_type_type: item.content_type_type ?? 'unknown',
      count: item._count.content_type_type,
    }));

    const response = {
      totalGenesisFee: sums._sum.genesis_fee ?? 0,
      totalContentLength: sums._sum.content_length ?? 0,
      totalInscriptions,
      contentTypesMapped: contentTypesCounts,
    };
    return response;
  } catch (error) {
    console.error('Failed to get inscription stats:', error);
    throw error;
  }
}