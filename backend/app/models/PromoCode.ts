// models/PromoCode.ts

import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database'; // Import the Sequelize instance

class PromoCode extends Model {}

PromoCode.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    discountType: {
      type: DataTypes.ENUM('FIXED_AMOUNT', 'PERCENTAGE'),
      allowNull: false,
    },
    discountValue: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    minimumPurchaseAmount: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    maxRedemptions: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    usageLimitPerUser: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
    modelName: 'PromoCode',
    tableName: 'promo_codes',
  }
);

export default PromoCode;
