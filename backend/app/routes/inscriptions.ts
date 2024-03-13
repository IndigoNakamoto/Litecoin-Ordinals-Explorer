import express, { Request, Response } from 'express';

const router = express.Router();

// GET /inscriptions - Fetch all inscriptions
router.get('/', (req: Request, res: Response) => {
    // Your logic to fetch all inscriptions goes here
    // For demonstration purposes, let's send a dummy response
    const inscriptions = [{ id: 1, name: 'John', email: 'john@gmail.com' }, { id: 2, name: 'Jane', email: 'jane@gmail.com' }];
    res.json(inscriptions);
});

router.get('/:inscriptionId', (req: Request, res: Response) => {
    // Your logic to fetch inscription by ID goes here
    // For demonstration purposes, let's send a dummy response
    const inscription = { id: 1, name: 'John', email: '' };
    res.json(inscription);
});

router.get('/:inscriptionNumber', (req: Request, res: Response) => {
    // Your logic to fetch inscription by ID goes here
    // For demonstration purposes, let's send a dummy response
    const inscription = { id: 1, name: 'John', email: '' };
    res.json(inscription);
});

export default router;