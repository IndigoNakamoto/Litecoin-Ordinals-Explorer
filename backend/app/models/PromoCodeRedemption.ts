// models/PromoCodeRedemption.ts

import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database'; // Import the Sequelize instance
import User from './User'; // Import the User model
import PromoCode from './PromoCode'; // Import the PromoCode model

class PromoCodeRedemption extends Model {}

PromoCodeRedemption.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    promoCodeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    redemptionDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    usageCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
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
    modelName: 'PromoCodeRedemption',
    tableName: 'promo_code_redemptions',
  }
);

// Define associations
PromoCodeRedemption.belongsTo(User, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
});

PromoCodeRedemption.belongsTo(PromoCode, {
  foreignKey: 'promoCodeId',
  onDelete: 'CASCADE',
});

export default PromoCodeRedemption;
