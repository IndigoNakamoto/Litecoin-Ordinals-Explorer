// Import Sequelize and Model
import { DataTypes, Model } from 'sequelize';
// Import the Sequelize instance
import sequelize from '../../config/database';

// Define Inscription class extending Model
class Inscription extends Model {
  public id!: number;
  public content_length!: number;
  public content_type!: string;
  public content_type_type!: string;
  public nsfw!: boolean;
}

// Initialize the Inscription model with properties and configuration
Inscription.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    content_length: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    content_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content_type_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    genesis_fee: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    genesis_height: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    inscription_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    inscription_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nsfw: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    }
  },
  {
    sequelize, // Pass the Sequelize instance
    modelName: 'Inscription', // Model name
    tableName: 'inscriptions', // Table name
    timestamps: false, // Disable automatic timestamps
    createdAt: false,
    updatedAt: false,
  }
);

// Export the Inscription model
export default Inscription;
