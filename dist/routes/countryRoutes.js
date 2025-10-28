import express from 'express'; // Importing express
// Importing APIs handlers (Controllers)
import { fetchCountryandRateHandler } from "../controllers/countryController";
// Initialize router
const router = express.Router();
router.post('/countries/refresh', fetchCountryandRateHandler);
export default router;
