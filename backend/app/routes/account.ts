//backend/app/routes/account.ts

import express, { Request, Response } from 'express';
import WalletAccount from '../models/WalletAccount';

const router = express.Router();

// GET /accounts - Fetch all accounts
router.get('/', async (req: Request, res: Response) => {
    const accounts = await WalletAccount.findAll(); // Fetch all accounts
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