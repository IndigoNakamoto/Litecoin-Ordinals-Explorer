// models/WalletAccount.ts

import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database';

class WalletAccount extends Model {
    public id!: number;
    public walletId!: number;
    public name!: string;
    public address!: string;
    public inscriptions!: string[];
    public confirmed!: number;
    public total!: number;
    public unconfirmed!: number;
}

WalletAccount.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        walletId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        address: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        inscriptions: {
            type: DataTypes.ARRAY(DataTypes.STRING),
        },
        confirmed: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        total: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        unconfirmed: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'WalletAccount',
        tableName: 'wallet_accounts',
    }
);

export default WalletAccount;
