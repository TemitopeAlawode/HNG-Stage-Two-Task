'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Countries', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    notEmpty: true
                }
            },
            capital: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            region: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            population: {
                type: Sequelize.BIGINT,
                allowNull: false,
                validate: {
                    isInt: true,
                    min: 0
                },
            },
            currency_code: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            exchange_rate: {
                type: Sequelize.DECIMAL(18, 4),
                allowNull: false,
            },
            estimated_gdp: {
                type: Sequelize.DECIMAL(18, 2),
                allowNull: false,
            },
            flag_url: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            last_refreshed_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Countries');
    }
};
export {};
