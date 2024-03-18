//backend/app/routes/account.ts

import express, { Request, Response } from 'express';
import WalletAccount from '../models/WalletAccount';

const router = express.Router();

// GET /accounts - Fetch all accounts
router.get('/', (req: Request, res: Response) => {
    // Your logic to fetch all accounts goes here
    // For demonstration purposes, let's send a dummy response
    const accounts = [{ id: 1, name: 'John', email: 'john@gmail.com' }, { id: 2, name: 'Jane', email: 'jane@gmail.com' }];
    res.json(accounts);
});

// POST /accounts - Create a new account
router.post('/', async (req: Request, res: Response) => {
    // Your logic to create a new account goes here
    // For demonstration purposes, let's send a dummy response with the created account
    const { address, provider, inscriptions, balanceTotal, publicKey } = req.body; // Destructure the upsertUser object
    const account = { address, provider, inscriptions, balanceTotal, publicKey };

    const newAccount = await WalletAccount.upsert(account); // Upsert the account
    console.log('Account Upserted:', newAccount);
    res.status(201).json(newAccount); // Respond with the created account
});

export default router;