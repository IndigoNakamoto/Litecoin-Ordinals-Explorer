// models/InscriptionStats.ts

import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database'; // Import the Sequelize instance




// model InscriptionStats {
//     id                   Int                    @id @default(autoincrement())
//     totalGenesisFee      BigInt                 @default(0)
//     totalContentLength   BigInt                 @default(0)
//     createdAt            DateTime               @default(now())
//     updatedAt            DateTime               @updatedAt
//     ContentTypeCount     ContentTypeCount[]
//     ContentTypeTypeCount ContentTypeTypeCount[]
//   }