import axios from "axios"
import { Request, Response } from "express"
import Country from "../models/Country";
import { generateSummaryImage } from "../services/generateImage";
import { col, fn, Op, where } from "sequelize";
import path from "path";
import fs from 'fs';


// ================================================
// @desc   Fetch all countries and exchange rates
// @route  POST  /countries/refresh
// @access Public
// ================================================
export const fetchCountryandRateHandler = async (req: Request, res: Response) => {
    try {
        // Fetch Data
        const countriesResponse = await axios.get("https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies");
        const exchangeRateResponse = await axios.get("https://open.er-api.com/v6/latest/USD");

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
            let exchangeRate = null
            let estimatedGdp = null

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
            
            if (!currencyCode || !exchangeRates[currencyCode]) {
    console.log(`Skipping ${country.name}: no valid currency/exchange rate`);
    continue;
}

            else {
                console.log(`No valid currency or exchange rate for ${country.name}`);
                estimatedGdp = 0;
            }

            // Upsert country data
            // Upsert - an "upsert" operation allows you to either insert a new row or update an existing
            // row if a matching primary key or unique constraint is found.
            try {
                await Country.upsert({
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
            } catch (upsertError: any) {
                console.error(`Failed to upsert ${country.name}:`, upsertError.message);
            }
        }

        console.log(`Inserted/Updated ${insertedCount} countries`);

        // Generate Image
        await generateSummaryImage();

        res.status(200).json({ message: 'Refresh successful!!', insertedCount });
    } catch (error: any) {
        console.error('Fetch error:', error.message);
        if (error.message.includes('fetch data')) {
            res.status(503).json({ error: 'External data source unavailable', details: error.message });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

}


// ================================================
// @desc   Get all countries from the DB (support filters and sorting)
// @route  GET  /countries?region=Africa | ?currency=NGN | ?sort=gdp_desc
// @access Public
// ================================================
export const getFilteredCountriesHandler = async (req: Request, res: Response) => {
    const { region, currency, sort } = req.query;
    try {
        // Gradually fill this filters object only with the parameters that the user actually sent.
        // Build filters dynamically
        const where: any = {};
        if (region) {
            where.region = region;
        }
        if (currency) {
            where.currency_code = currency;
        }

        // Sorting logic
        const order: any[] = [];
        if (sort === 'gdp_desc') {
            order.push(['estimated_gdp', 'DESC']);
        } else if (sort === 'gdp_asc') {
            order.push(['estimated_gdp', 'ASC']);
        }

        const countries = await Country.findAll({ where, order });
        res.json(countries);
    } catch (error) {
        res.status(400).json({ message: 'Invalid query parameter values or types' });
    }
}


// ================================================
// @desc   Get one country by name
// @route  GET  /countries/:name
// @access Public
// ================================================
export const getCountryByNameHandler = async (req: Request, res: Response) => {
    try {
        // Ensure the parameter exists and is a string
        const name = req.params.name;
        if (!name || typeof name !== 'string') {
            res.status(400).json({ message: 'Invalid or missing country name' });
            return;
        }

        const country = await Country.findOne({
            where: where(
                fn('LOWER', col('name')),
                Op.like,
                `%${name.toLowerCase()}%` // case-insensitive, partial match
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
    } catch (error) {
        res.status(400).json({ message: 'Invalid country name..' });
    }
}


// ================================================
// @desc Delete a country record
// @route  DELETE   /countries/:name
// @access Public
// ================================================
export const deleteCountryHandler = async (req: Request, res: Response) => {
    try {
        // Ensure the parameter exists and is a string
        const name = req.params.name;
        if (!name || typeof name !== 'string') {
            res.status(400).json({ message: 'Invalid or missing country name' });
            return;
        }

        // Delete country (case-insensitive)
        const deleted = await Country.destroy({
            where: where(
                fn('LOWER', col('name')),
                Op.like,
                name.toLowerCase()
            ),
        });
        if (deleted === 0) {
            res.status(404).json({ message: 'Country not found' });
            return;
        }
        res.json({ message: `Country "${name}" deleted.` });
    } catch (error) {
        console.error('Error deleting country:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


// ================================================
// @desc   Show total countries and last refresh timestamp
// @route  GET  /status
// @access Public
// ================================================
export const getCountriesStatusHandler = async (req: Request, res: Response) => {
    try {
        const total = await Country.count();
        const lastRefresh = await Country.max("last_refreshed_at");
        res.json({
            total_countries: total,
            last_refreshed_at: lastRefresh
        });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}


// ================================================
// @desc   Serve the generated summary image
// @route  GET /countries/image
// @access Public
// ================================================
export const getCountriesSummaryImageHandler = async (req: Request, res: Response) => {
    try {
        const imagePath = path.join(__dirname, '../../cache/summary.png');
        // Check if the image exists
        // fs.existsSync() checks if the image file actually exists.
        if (!fs.existsSync(imagePath)) {
            return res.status(404).json({ error: 'Summary image not found' });
        }

        // Set content type header
        // res.setHeader('Content-Type', 'image/png') ensures browsers treat the
        // response as an image
        res.setHeader('Content-Type', 'image/png');

        // Send the image file
        //Uses res.sendFile() which is the recommended Express method for serving file
        res.sendFile(imagePath);
    } catch (error: any) {
        console.error('Error serving summary image:', error.message);
        res.status(500).json({ error: 'Failed to serve summary image' });
    }
}