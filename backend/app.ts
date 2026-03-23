// app.ts
// Load .env before any module reads process.env (e.g. util/ord-litecoin ORD_LITECOIN_URL at import time).
import 'dotenv/config';

import express, { Request, Response } from 'express';
import cors from 'cors';

import * as mimeTypes from 'mime-types'; // Import mime-types package
import fs from 'fs';
import NodeCache from 'node-cache';
import { getBlockHeight } from './util/ord-litecoin';

// import updateInscriptions from './app/services/InscriptionUpdateService';



const app = express();
const port = Number(process.env.PORT) || 3005;
const cache = new NodeCache({ stdTTL: 300, checkperiod: 120 });

// import usersRouter from './app/routes/users';
import loginRouter from './app/routes/login';
import logoutRouter from './app/routes/logout';
import inscriptionRouter from './app/routes/inscriptions';
import stats from './app/routes/stats';
import upload from './app/routes/upload';
import invoice from './app/routes/invoice';
import account from './app/routes/account';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});

// Use the users router
// app.use('/users', usersRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
app.use('/account', account);
app.use('/inscriptions', inscriptionRouter);
app.use('/stats', stats);
app.use('/upload', upload);
app.use('/invoice', invoice);

app.get('/blockHeight', async (_req: Request, res: Response) => {
    try {
        const blockHeight = await getBlockHeight();
        res.json({ blockHeight });
    } catch (error) {
        console.error('Error fetching block height:', error);
        res.status(500).json({ error: 'Failed to fetch block height' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});


// updateInscriptions()

// setInterval(updateInscriptions, 30 * 1000);