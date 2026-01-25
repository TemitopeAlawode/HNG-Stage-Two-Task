"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Importing necessary Sequelize dependencies: DataTypes for defining column types,
// Model for creating the model class, and ModelStatic for typing model constructors.
const sequelize_1 = require("sequelize");
// Importing the configured Sequelize instance for database connection.
const db_1 = __importDefault(require("../db"));
// Defining the Country model using sequelize.define, specifying the model name, attributes, and options.
// The generic type CountryInstance ensures type safety for the model's instances.
const Country = db_1.default.define('Country', {
    // Defining the model's attributes (columns) with their data types, constraints, and validations.
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true
        }
    },
    capital: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    region: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    population: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
        validate: {
            isInt: true,
            min: 0
        },
    },
    currency_code: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    exchange_rate: {
        type: sequelize_1.DataTypes.DECIMAL(18, 4),
        allowNull: false,
    },
    estimated_gdp: {
        type: sequelize_1.DataTypes.DECIMAL(18, 2),
        allowNull: false,
    },
    flag_url: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    last_refreshed_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    timestamps: false, // Automatically removes the createdAt and updatedAt columns to track record creation/update times.
    tableName: 'Countries'
});
// Exporting the Country model for use in other parts of the application.
exports.default = Country;
