// models/Invoice.ts

import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database'; // Import the Sequelize instance

class Invoice extends Model { }

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
    inscribeStatus: {
      type: DataTypes.ENUM('Pending','Processing', 'Completed', 'Error'),
      defaultValue: 'Pending',
    },
    paymentStatus: {
      type: DataTypes.ENUM('New', 'Processing', 'Expired', 'Invalid', 'Settled'),
      defaultValue: 'New',
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
