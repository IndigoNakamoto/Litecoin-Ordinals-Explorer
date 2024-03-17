// models/File.ts

import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database'; // Import the Sequelize instance
import Invoice from './Invoice'; // Import the Invoice model

class File extends Model { }

File.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    invoiceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Invoice,
        key: 'id',
      },
    },
    inscribeStatus: {
      type: DataTypes.ENUM('Pending','Processing', 'Inscribed', 'Error'),
      defaultValue: 'Pending',
    },
    storage_status: {
      type: DataTypes.ENUM('Uploaded', 'Deleted'),
      defaultValue: 'Uploaded',
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      onUpdate: "NOW",
    },
  },
  {
    sequelize,
    modelName: 'File',
    tableName: 'files',
  }
);

export default File;
