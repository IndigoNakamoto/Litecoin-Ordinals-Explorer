import express, { Request, Response } from 'express';

const router = express.Router();

router.get('/totals', (req: Request, res: Response) => {
    // Your logic to fetch stats totals goes here
    // For demonstration purposes, let's send a dummy response
    const totals = { users: 100, inscriptions: 200, events: 50 };
    res.json(totals);
});