// Import Sequelize operators
import { Op } from 'sequelize';

// Import Inscription model
import Inscription from '../models/Inscription';

// Controller for handling inscription-related operations
const InscriptionController = {
  // Other methods...

  // Custom query method
  async customQuery(req, res) {
    try {
      // Extract query parameters
      const { content_type_type, sort } = req.query;
      
      // Define conditions for content_type_type and curse
      const whereConditions = {
        content_type_type,
        nsfw: content_type_type >= 0, // Curse condition: Inscriptions < 0 are cursed
      };
      
      // Define sorting criteria
    const order: [string, string][] = [];
    if (sort === 'asc') {
        order.push(['genesis_fee', 'ASC'], ['content_length', 'ASC'], ['inscription_number', 'ASC']);
    } else {
        order.push(['genesis_fee', 'DESC'], ['content_length', 'DESC'], ['inscription_number', 'DESC']);
    }

    // Fetch inscriptions with filtering and sorting
    const inscriptions = await Inscription.findAll({
        where: whereConditions,
        order,
    });

    // Respond with the retrieved inscriptions
    res.json({ inscriptions });
    } catch (error) {
      // Handle error
      console.error('Error executing custom query:', error);
      res.status(500).json({ error: 'Unable to execute custom query' });
    }
  },
};

// Export the InscriptionController
export default InscriptionController;
