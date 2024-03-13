// models/UserProfile.ts

import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database'; // Import the Sequelize instance

class UserProfile extends Model { }

UserProfile.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        location: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        url: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        bio: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        avatarUrl: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        socialX: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        socialInstagram: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        socialGitHub: {
            type: DataTypes.STRING,
            allowNull: true,
        }
    },
    {
        sequelize,
        modelName: 'UserProfile',
        tableName: 'user_profiles',
    }
);

export default UserProfile;
