"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCountriesSummaryImageHandler = exports.getCountriesStatusHandler = exports.deleteCountryHandler = exports.getCountryByNameHandler = exports.getFilteredCountriesHandler = exports.fetchCountryandRateHandler = void 0;
const axios_1 = __importDefault(require("axios"));
const Country_1 = __importDefault(require("../models/Country"));
const generateImage_1 = require("../services/generateImage");
const sequelize_1 = require("sequelize");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// ================================================
// @desc   Fetch all countries and exchange rates
// @route  POST  /countries/refresh
// @access Public
// ================================================
const fetchCountryandRateHandler = async (req, res) => {
    try {
        // Fetch Data
        const countriesResponse = await axios_1.default.get("https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies");
        const exchangeRateResponse = await axios_1.default.get("https://open.er-api.com/v6/latest/USD");
        const countries = countriesResponse.data;
        const exchangeRates = exchangeRateResponse.data.rates;
        console.log('Countries: ', countries);
        console.log('Exhange Rate: ', exchangeRates);
        console.log('Fetched countries:', countries.length);
        console.log('Exchange rates:', Object.keys(exchangeRates));
        // Process each country
        let insertedCount = 0;
        for (const country of countries) {
            // Validation
            if (!country.name || !country.population) {
                continue; // Skip invalid data
            }
            const currencyCode = country.currencies?.[0]?.code;
            let exchangeRate = null;
            let estimatedGdp = null;
            if (currencyCode) {
                exchangeRate = exchangeRates[currencyCode];
                if (exchangeRate) {
                    // Generates a random integer between 1000 and 2000 (inclusive)
                    // Math.random() gives a decimal between 0 and 1
                    // Multiply by (max - min + 1) to scale the range, then add min to shift it up
                    // Math.floor() ensures the result is an integer
                    const randomMultiplier = Math.floor(Math.random() * (2000 - 1000 + 1)) + 1000;
                    estimatedGdp = (country.population * randomMultiplier) / exchangeRate;
                }
            }
            else {
                console.log(`No valid currency or exchange rate for ${country.name}`);
                estimatedGdp = 0;
            }
            // Upsert country data
            // Upsert - an "upsert" operation allows you to either insert a new row or update an existing
            // row if a matching primary key or unique constraint is found.
            try {
                await Country_1.default.upsert({
                    name: country.name,
                    capital: country.capital,
                    region: country.region,
                    population: country.population,
                    currency_code: currencyCode,
                    exchange_rate: exchangeRate,
                    estimated_gdp: estimatedGdp,
                    flag_url: country.flag,
                    last_refreshed_at: new Date()
                });
                insertedCount++;
            }
            catch (upsertError) {
                console.error(`Failed to upsert ${country.name}:`, upsertError.message);
            }
        }
        console.log(`Inserted/Updated ${insertedCount} countries`);
        // Generate Image
        await (0, generateImage_1.generateSummaryImage)();
        res.status(200).json({ message: 'Refresh successful!!', insertedCount });
    }
    catch (error) {
        console.error('Fetch error:', error.message);
        if (error.message.includes('fetch data')) {
            res.status(503).json({ error: 'External data source unavailable', details: error.message });
        }
        else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
exports.fetchCountryandRateHandler = fetchCountryandRateHandler;
// ================================================
// @desc   Get all countries from the DB (support filters and sorting)
// @route  GET  /countries?region=Africa | ?currency=NGN | ?sort=gdp_desc
// @access Public
// ================================================
const getFilteredCountriesHandler = async (req, res) => {
    const { region, currency, sort } = req.query;
    try {
        // Gradually fill this filters object only with the parameters that the user actually sent.
        // Build filters dynamically
        const where = {};
        if (region) {
            where.region = region;
        }
        if (currency) {
            where.currency_code = currency;
        }
        // Sorting logic
        const order = [];
        if (sort === 'gdp_desc') {
            order.push(['estimated_gdp', 'DESC']);
        }
        else if (sort === 'gdp_asc') {
            order.push(['estimated_gdp', 'ASC']);
        }
        const countries = await Country_1.default.findAll({ where, order });
        res.json(countries);
    }
    catch (error) {
        res.status(400).json({ message: 'Invalid query parameter values or types' });
    }
};
exports.getFilteredCountriesHandler = getFilteredCountriesHandler;
// ================================================
// @desc   Get one country by name
// @route  GET  /countries/:name
// @access Public
// ================================================
const getCountryByNameHandler = async (req, res) => {
    try {
        // Ensure the parameter exists and is a string
        const name = req.params.name;
        if (!name || typeof name !== 'string') {
            res.status(400).json({ message: 'Invalid or missing country name' });
            return;
        }
        const country = await Country_1.default.findOne({
            where: (0, sequelize_1.where)((0, sequelize_1.fn)('LOWER', (0, sequelize_1.col)('name')), sequelize_1.Op.like, `%${name.toLowerCase()}%` // case-insensitive, partial match
            ),
        });
        // const country = await Country.findOne({
        //     // where: { name: { [Op.iLike]: req.params.name } }  // Case-insensitive
        //      where: where(fn('LOWER', col('name')), Op.eq, name.toLowerCase()),
        // });
        if (!country) {
            res.status(404).json({ error: 'Country not found' });
            return;
        }
        res.json(country);
    }
    catch (error) {
        res.status(400).json({ message: 'Invalid country name..' });
    }
};
exports.getCountryByNameHandler = getCountryByNameHandler;
// ================================================
// @desc Delete a country record
// @route  DELETE   /countries/:name
// @access Public
// ================================================
const deleteCountryHandler = async (req, res) => {
    try {
        // Ensure the parameter exists and is a string
        const name = req.params.name;
        if (!name || typeof name !== 'string') {
            res.status(400).json({ message: 'Invalid or missing country name' });
            return;
        }
        // Delete country (case-insensitive)
        const deleted = await Country_1.default.destroy({
            where: (0, sequelize_1.where)((0, sequelize_1.fn)('LOWER', (0, sequelize_1.col)('name')), sequelize_1.Op.like, name.toLowerCase()),
        });
        if (deleted === 0) {
            res.status(404).json({ message: 'Country not found' });
            return;
        }
        res.json({ message: `Country "${name}" deleted.` });
    }
    catch (error) {
        console.error('Error deleting country:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deleteCountryHandler = deleteCountryHandler;
// ================================================
// @desc   Show total countries and last refresh timestamp
// @route  GET  /status
// @access Public
// ================================================
const getCountriesStatusHandler = async (req, res) => {
    try {
        const total = await Country_1.default.count();
        const lastRefresh = await Country_1.default.max("last_refreshed_at");
        res.json({
            total_countries: total,
            last_refreshed_at: lastRefresh
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getCountriesStatusHandler = getCountriesStatusHandler;
// ================================================
// @desc   Serve the generated summary image
// @route  GET /countries/image
// @access Public
// ================================================
const getCountriesSummaryImageHandler = async (req, res) => {
    try {
        const imagePath = path_1.default.join(__dirname, '../../cache/summary.png');
        // Check if the image exists
        // fs.existsSync() checks if the image file actually exists.
        if (!fs_1.default.existsSync(imagePath)) {
            return res.status(404).json({ error: 'Summary image not found' });
        }
        // Set content type header
        // res.setHeader('Content-Type', 'image/png') ensures browsers treat the
        // response as an image
        res.setHeader('Content-Type', 'image/png');
        // Send the image file
        //Uses res.sendFile() which is the recommended Express method for serving file
        res.sendFile(imagePath);
    }
    catch (error) {
        console.error('Error serving summary image:', error.message);
        res.status(500).json({ error: 'Failed to serve summary image' });
    }
};
exports.getCountriesSummaryImageHandler = getCountriesSummaryImageHandler;
