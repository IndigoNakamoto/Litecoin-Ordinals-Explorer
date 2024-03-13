// models/InscriptionsUpdateProgress.ts

import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database'; // Import the Sequelize instance

class InscriptionsUpdateProgress extends Model {
  public last_processed_block!: number;
  public last_processed_page!: number;
}

InscriptionsUpdateProgress.init(
  {
    progress_key: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    last_processed_block: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2400000, // Default to the block number of the first Inscription
    },
    last_processed_page: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'InscriptionsUpdateProgress',
    tableName: 'inscriptions_update_progress', // Adjust table name if necessary
    timestamps: false, // Disable timestamps
  }
);

export default InscriptionsUpdateProgress; 
