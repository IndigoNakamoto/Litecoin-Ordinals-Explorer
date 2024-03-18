// models/User.ts

import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database';
import UserProfile from './UserProfile';
import UserSetting from './UserSetting'; // Import the UserSetting model
import Invoice from './Invoice';
import Wallet from './Wallet';
import PromoCodeRedemption from './PromoCodeRedemption';

class User extends Model { }

User.init(
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
        username: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        balanceTotal: {
            type: DataTypes.DECIMAL,
            allowNull: false,
            defaultValue: 0,
        },
        role: {
            type: DataTypes.ENUM('BASIC', 'ADMIN'),
            defaultValue: 'BASIC',
        },
    },
    {
        sequelize,
        modelName: 'User',
        tableName: 'users',
    }
);

// Define the associations
User.hasOne(UserProfile, {
    foreignKey: {
        allowNull: false,
    },
    onDelete: 'CASCADE',
});

User.hasOne(UserSetting, {
    foreignKey: {
        allowNull: false,
    },
    onDelete: 'CASCADE',
});

User.hasMany(Invoice, {
    foreignKey: {
        allowNull: false,
    }
});


//These two cause errors
// User.hasMany(Wallet, {
//     foreignKey: {
//         allowNull: false,
//     },
// });

// User.hasMany(PromoCodeRedemption, {
//     foreignKey: {
//         allowNull: false,
//     },
// });


export default User;
