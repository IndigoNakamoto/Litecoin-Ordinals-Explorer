import express, { Request, Response } from 'express';
import { getInscriptionStats } from '../controllers/stats';

const router = express.Router();

router.get('/totals', async (_req: Request, res: Response) => {
    try {
        const result = await getInscriptionStats();
        res.json(result);
    } catch {
        res.status(500).json({ error: 'Failed to load inscription stats' });
    }
});

export default router;
