import Inscription from '../models/Inscription';
import sequelize from '../../config/database';

interface ContentTypeCount {
    content_type_type: string;
    count: number; // Make sure this matches the type you're expecting for count
  }

  
  
export async function getInscriptionStats() {
    try {
      // Example of counting total inscriptions
      const totalInscriptions = await Inscription.count();
  
      // Example of aggregating data: Getting total genesis fee, total content length, and counts by content type
      const totalGenesisFee = await Inscription.sum('genesis_fee');
      const totalContentLength = await Inscription.sum('content_length');
  
      // Example of getting counts by content type using group and count
      const contentTypesCounts: ContentTypeCount[] = await Inscription.findAll({
          attributes: [
              'content_type_type',
              [sequelize.fn('COUNT', sequelize.col('content_type_type')), 'count']
          ],
          group: 'content_type_type',
          raw: true,
      }) as unknown as ContentTypeCount[]; 
  
      // Prepare the response object
      const response = {
        totalGenesisFee,
        totalContentLength,
        totalInscriptions,
        contentTypesMapped: contentTypesCounts.map(type => ({
          content_type_type: type.content_type_type,
          count: +type.count, // Converting count to number just in case
        })),
      };
  
      return response;
    } catch (error) {
      console.error('Failed to get inscription stats:', error);
      throw error;
    }
  }