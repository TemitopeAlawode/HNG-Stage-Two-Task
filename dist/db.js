import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();
const env = process.env.NODE_ENV || 'development';
// Use DATABASE_URL for production, individual vars for development/test
const sequelize = process.env.DATABASE_URL && env === 'production'
    ? new Sequelize(process.env.DATABASE_URL, {
        dialect: 'mysql',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        },
        logging: false,
    })
    : new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
        dialect: 'mysql',
        logging: env === 'development' ? console.log : false,
    });
(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    }
    catch (error) {
        console.error('Unable to connect to the database:', error);
        throw error; // Ensure app crashes with clear error for logs
    }
})();
export default sequelize;
