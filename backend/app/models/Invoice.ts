// models/Invoice.ts

import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database'; // Import the Sequelize instance

class Invoice extends Model {}

Invoice.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    invoiceId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    InscribeStatus: {
      type: DataTypes.ENUM('PENDING', 'QUEUED', 'UNCONFIRMED', 'INSCRIBED', 'FAILED'),
      defaultValue: 'PENDING',
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
    modelName: 'Invoice',
    tableName: 'invoices',
  }
);

export default Invoice;
