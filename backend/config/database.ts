// config/database.ts
// Keep the legacy Sequelize layer pointed at the same database as Prisma.
import 'dotenv/config';
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  process.env.DATABASE_URL || 'postgresql://ord_lite_user:ord_lite_pass@127.0.0.1:15432/ord_lite_db',
  {
    dialect: 'postgres',
    define: {
      timestamps: false,
    },
    logging: false,
  },
);

export default sequelize;