// models/WalletAccount.ts

import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database';

class WalletAccount extends Model {
    public id!: number;
    public address!: string;
    public provider!: string;
    public inscriptions!: string[];
    public balanceTotal!: number;
    public publicKey!: string;
}

WalletAccount.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        address: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        provider: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        inscriptions: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: [],
        },
        balanceTotal: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        publicKey: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: true,
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        }
    },
    {
        sequelize,
        modelName: 'WalletAccount',
        tableName: 'wallet_accounts',
    }
);

export default WalletAccount;
