"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express")); // Importing express
// Importing APIs handlers (Controllers)
const countryController_1 = require("../controllers/countryController");
// Initialize router
const router = express_1.default.Router();
router.post('/countries/refresh', countryController_1.fetchCountryandRateHandler);
router.get('/countries/image', countryController_1.getCountriesSummaryImageHandler);
router.get('/countries', countryController_1.getFilteredCountriesHandler);
router.get('/countries/:name', countryController_1.getCountryByNameHandler);
router.delete('/countries/:name', countryController_1.deleteCountryHandler);
router.get('/status', countryController_1.getCountriesStatusHandler);
exports.default = router;
