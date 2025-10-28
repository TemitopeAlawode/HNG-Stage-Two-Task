import axios from "axios";
import Country from "../models/Country";
import { generateSummaryImage } from "../services/generateImage";
// ================================================
// @desc   Fetch all countries and exchange rates
// @route  POST  /countries/refresh
// @access Public
// ================================================
export const fetchCountryandRateHandler = async (req, res) => {
    try {
        // Fetch Data
        const countriesResponse = await axios.get("https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies");
        const exchangeRateResponse = await axios.get("https://open.er-api.com/v6/latest/USD");
        const countries = countriesResponse.data;
        const exchangeRates = exchangeRateResponse.data;
        console.log('Countries: ', countries);
        console.log('Exhange Rate: ', exchangeRates);
        // Process each country
        for (const country of countries) {
            // Validation
            if (!country.name || !country.currency_code || !country.population) {
                continue; // Skip invalid data
            }
            const currencyCode = country.currencies[0].code;
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
                estimatedGdp = 0;
            }
            // Upsert - an "upsert" operation allows you to either insert a new row or update an existing
            // row if a matching primary key or unique constraint is found.
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
        }
        // Generate Image
        await generateSummaryImage();
        res.status(200).json({ message: 'Refresh successful!!' });
    }
    catch (error) {
        if (error.message.includes('fetch data')) {
            res.status(503).json({ error: 'External data source unavailable', details: error.message });
        }
        else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
