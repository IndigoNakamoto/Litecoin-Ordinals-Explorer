// config/database.ts
// The database configuration file is used to create a Sequelize instance and connect to the PostgreSQL database. The Sequelize instance is then exported to be used in the models.
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('ord_lite_db', 'ord_lite_user', 'ord_lite_pass', {
  host: 'localhost',
  port: 5432,
  dialect: 'postgres',
  define: {
    timestamps: false,
  },
  logging: false
});

export default sequelize;