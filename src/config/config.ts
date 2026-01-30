// // Importing dotenv to load env variables
// import dotenv from 'dotenv';

// // Loads .env file contents into process.env
// dotenv.config();


// // Configuration object for different environments (e.g., development, production)
// // const config = {
//   module.exports = {
//   development: {
//     username: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     dialect: 'mysql'
//   },
//   test: {
//     username: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
//     dialect: 'mysql'
//   },
//   // production: {
//   //   username: process.env.DB_USER,
//   //   password: process.env.DB_PASSWORD,
//   //   database: process.env.DB_NAME,
//   //   host: process.env.DB_HOST,
//   //   port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
//   //   dialect: 'mysql'
//   // }
//   production: {
//          use_env_variable: 'DATABASE_URL', // Use single connection string
//          dialect: 'mysql',
//          dialectOptions: {
//            ssl: {
//              require: true,
//              rejectUnauthorized: false, // Allow self-signed certs (common in cloud DBs)
//            },
//          },
//          logging: false,
//        },
// }

// // module.exports = config;












import dotenv from 'dotenv';

dotenv.config();

const config = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql'
  },
  jwtSecret: process.env.JWT_SECRET_KEY,
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    dialect: 'mysql'
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: false,
  }
}

module.exports = config;