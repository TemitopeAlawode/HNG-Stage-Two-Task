import express from 'express';  // Importing express

// Importing APIs handlers (Controllers)
import { 
    fetchCountryandRateHandler,
    getFilteredCountriesHandler,
    getCountryByNameHandler,
    deleteCountryHandler,
    getCountriesStatusHandler,
    getCountriesSummaryImageHandler
 } from "../controllers/countryController";


// Initialize router
const router = express.Router();


router.post('/countries/refresh', fetchCountryandRateHandler);
router.get('/countries/image', getCountriesSummaryImageHandler);
router.get('/countries', getFilteredCountriesHandler);
router.get('/countries/:name', getCountryByNameHandler);
router.delete('/countries/:name', deleteCountryHandler);
router.get('/status', getCountriesStatusHandler);




export default router;