// models/Wallet.ts

import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database';
import WalletAccount from './WalletAccount';
import User from './User';

class Wallet extends Model {
    public id!: number;
    public userId!: number;
    public name!: string;
}

Wallet.init(
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
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'Wallet',
        tableName: 'wallets',
    }
);

// Define the associations
Wallet.belongsTo(User, {
    foreignKey: {
        allowNull: false,
    },
});

Wallet.hasMany(WalletAccount, {
    foreignKey: {
        allowNull: false,
    },
});

export default Wallet;
