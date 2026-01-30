import { Sequelize } from 'sequelize';

const isProduction = process.env.NODE_ENV === 'production';

const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USER as string,
  process.env.DB_PASSWORD as string,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    dialect: 'mysql',
    dialectOptions: isProduction ? {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    } : {},
    logging: !isProduction,
  }
);

(async () => {
  try {
    await sequelize.authenticate();
    console.log(
      isProduction
        ? 'Connected to production database'
        : 'Connected to local database'
    );
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

export default sequelize;






// import { Sequelize } from 'sequelize';

// const isProduction = process.env.NODE_ENV === 'production';

// const sequelize = new Sequelize(
//   process.env.DB_NAME as string,
//   process.env.DB_USER as string,
//   process.env.DB_PASSWORD as string,
//   {
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306, // MySQL default port is 3306, not 5432
//     dialect: 'mysql',
//     dialectOptions: isProduction ? {
//       ssl: {
//         require: true,
//         rejectUnauthorized: false,
//       },
//     } : {},
//     logging: !isProduction,
//   }
// );

// // Test connection
// const testConnection = async () => {
//   try {
//     await sequelize.authenticate();
//     console.log(
//       isProduction
//         ? 'Connected to production MySQL database successfully'
//         : 'Connected to local MySQL database successfully'
//     );
//   } catch (error) {
//     console.error('Unable to connect to the MySQL database:', error);
//   }
// };

// testConnection();

// export default sequelize;










// import { Sequelize } from 'sequelize';
// import dotenv from 'dotenv';

// dotenv.config();

// const env = process.env.NODE_ENV || 'development';

// // Use DATABASE_URL for production, individual vars for development/test
// const sequelize = process.env.DATABASE_URL && env === 'production'
//   ? new Sequelize(process.env.DATABASE_URL, {
//       dialect: 'mysql',
//       dialectOptions: {
//         ssl: {
//           require: true,
//           rejectUnauthorized: false, 
//         },
//       },
//       logging: false,
//     })
//   : new Sequelize(process.env.DB_NAME as string, process.env.DB_USER as string, process.env.DB_PASSWORD, {
//       host: process.env.DB_HOST,
//       port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
//       dialect: 'mysql',
//       logging: env === 'development' ? console.log : false,
//     });

// (async () => {
//   try {
//     await sequelize.authenticate();
//     console.log('Connection has been established successfully.');
//   } catch (error) {
//     console.error('Unable to connect to the database:', error);
//     throw error; // Ensure app crashes with clear error for logs
//   }
// })();

// export default sequelize;