import express, { Request, Response } from 'express';
import { getInscriptionStats, returnBlockHeight } from '../controllers/stats';
const NodeCache = require("node-cache");
const statsCache = new NodeCache({ stdTTL: 600, checkperiod: 150 }); // Example: cache for 5 minutes or 300 seconds

const router = express.Router();

router.get('/totals', async (req: Request, res: Response) => {
    // Try fetching the result from cache
    let result = statsCache.get("inscriptionTotals");

    if (result) {
        // Cache hit, return the cached result
        res.json(result);
    } else {
        // Cache miss, fetch data from the controller
        result = await getInscriptionStats();
        // Cache the result for future requests
        statsCache.set("inscriptionTotals", result);
        res.json(result);
    }
});

router.get('/blockHeight', async (req: Request, res: Response) => {
    const result = await returnBlockHeight();
    res.json(result);
});

export default router;
