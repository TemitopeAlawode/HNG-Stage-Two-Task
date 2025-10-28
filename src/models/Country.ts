// Importing necessary Sequelize dependencies: DataTypes for defining column types,
// Model for creating the model class, and ModelStatic for typing model constructors.
import { DataTypes, Model, ModelStatic } from 'sequelize';
// Importing the configured Sequelize instance for database connection.
import sequelize from '../db';


// Defining the CountryAttributes interface to specify the shape of the Country model's attributes.
// This ensures type safety for the model's fields and their expected values.
interface CountryAttributes {
    id?: number;
    name: string
    capital?: string | null //Optional
    region?: string | null  //Optional
    population: number
    currency_code: string
    exchange_rate: number
    estimated_gdp: number | null
    flag_url?: string | null //Optional
    last_refreshed_at: Date //Auto timestamp

}

// Defining the CountryInstance interface, which extends Sequelize's Model class and CountryAttributes.
// This combines Sequelize's model functionality with the custom attributes for type-safe instances.
interface CountryInstance extends Model<CountryAttributes>, CountryAttributes { }


// Defining the Country model using sequelize.define, specifying the model name, attributes, and options.
// The generic type CountryInstance ensures type safety for the model's instances.
const Country = sequelize.define<CountryInstance>(
    'Country',
    {
        // Defining the model's attributes (columns) with their data types, constraints, and validations.
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true
            }
        },
        capital: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        region: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        population: {
            type: DataTypes.BIGINT,
            allowNull: false,
            validate: {
                isInt: true,
                min: 0
            },
        },
        currency_code: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        exchange_rate: {
            type: DataTypes.DECIMAL(18, 4),
            allowNull: false,
        },
        estimated_gdp: {
            type: DataTypes.DECIMAL(18, 2),
            allowNull: false,
        },
        flag_url: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        last_refreshed_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        timestamps: false, // Automatically removes the createdAt and updatedAt columns to track record creation/update times.
        tableName: 'Countries'
    }
);


// Exporting the Country model for use in other parts of the application.
export default Country;