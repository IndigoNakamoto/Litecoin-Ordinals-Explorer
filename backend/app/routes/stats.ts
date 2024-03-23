import express, { Request, Response } from 'express';
import { getContentTypeCount, getContentTypeTypeCount, getInscriptionStats, getTotalCount, returnBlockHeight } from '../controllers/stats';
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
    let result = statsCache.get("blockHeight");
    if (result) {
        // Cache hit, return the cached result
        res.json(result);
    } else {
        const result = await returnBlockHeight();
        statsCache.set("blockHeight", result);
        res.json(result)
    }
});

router.get('/total_count', async (req: Request, res: Response) => {
    let result = statsCache.get('totalInscriptionsCount');
    if (result) {
        res.json(result);
    } else {
        const count = await getTotalCount();
        statsCache.set('totalInscriptionsCount', { count });
        res.json({ count });
    }
});

router.get('/content_type_count/:contentType', async (req: Request, res: Response) => {
    let result = statsCache.get(`contentTypeCount-${req.params.contentType}`);
    if (result) {
        res.json(result);
    } else { 
        const { contentType } = req.params;
        const count = await getContentTypeCount(contentType);
        statsCache.set(`contentTypeCount-${contentType}`, { count });
        res.json({ count });
    }
});

router.get('/content_type_type_count/:contentTypeType', async (req: Request, res: Response) => {
    let result = statsCache.get(`contentTypeTypeCount-${req.params.contentTypeType}`);
    if (result) {
        res.json(result);
    } else {
        const { contentTypeType } = req.params;
        const count = await getContentTypeTypeCount(contentTypeType);
        statsCache.set(`contentTypeTypeCount-${contentTypeType}`, { count });
        res.json({ count });
    }
});

export default router;
