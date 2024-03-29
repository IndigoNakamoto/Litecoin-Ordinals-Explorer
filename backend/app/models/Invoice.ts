// models/Invoice.ts

import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database'; // Import the Sequelize instance

class Invoice extends Model {
    invoiceId: any;
    inscribeStatus!: string | 'Pending';
    paymentStatus!: string | 'New';
}

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
    ipaddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    accountid: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    inscribeStatus: {
      type: DataTypes.ENUM('Pending','Processing', 'Completed', 'Error', 'Cancelled'),
      defaultValue: 'Pending',
    },
    paymentStatus: {
      type: DataTypes.ENUM('New', 'Processing', 'Expired', 'Invalid', 'Settled'),
      defaultValue: 'New',
    },
    receivingaddress: {
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
    modelName: 'Invoice',
    tableName: 'invoices',
  }
);

export default Invoice;
