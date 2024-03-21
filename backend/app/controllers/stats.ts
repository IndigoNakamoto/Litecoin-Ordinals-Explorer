import Inscription from '../models/Inscription';
import sequelize from '../../config/database';
import { Op } from 'sequelize'; // If needed for more complex operations

// Assuming this interface reflects the raw result structure accurately
interface RawContentTypeCount {
  content_type_type: string;
  count: string; // Raw queries might return counts as strings
}

interface ContentTypeCount {
  content_type_type: string;
  count: number;
}

export async function getInscriptionStats() {
  try {
    const [totalInscriptions, totalGenesisFee, totalContentLength, rawContentTypesCounts] = await Promise.all([
      Inscription.count(),
      Inscription.sum('genesis_fee'),
      Inscription.sum('content_length'),
      Inscription.findAll({
        attributes: [
          'content_type_type',
          [sequelize.fn('COUNT', sequelize.col('content_type_type')), 'count']
        ],
        group: 'content_type_type',
        raw: true,
      })
    ]);

    // Explicitly assert the type here if necessary
    const contentTypesCounts: ContentTypeCount[] = rawContentTypesCounts.map((item: any) => ({
      content_type_type: item.content_type_type,
      count: parseInt(item.count, 10), // Ensure count is a number
    }));

    const response = {
      totalGenesisFee,
      totalContentLength,
      totalInscriptions,
      contentTypesMapped: contentTypesCounts,
    };
    return response;
  } catch (error) {
    console.error('Failed to get inscription stats:', error);
    throw error;
  }
}