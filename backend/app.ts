// app.ts
import express, { Request, Response } from 'express';
import cors from 'cors';

import * as mimeTypes from 'mime-types'; // Import mime-types package
import fs from 'fs';
import NodeCache from 'node-cache';

// import updateInscriptions from './app/services/InscriptionUpdateService';



const app = express();
const port = 3005;
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
// app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);
app.use('/api/logout', logoutRouter);
app.use('/api/account', account);
app.use('/api/inscriptions', inscriptionRouter);
app.use('/api/stats', stats);
app.use('/api/upload', upload);
app.use('/api/invoice', invoice);

// Start the server
app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});


// updateInscriptions()

// setInterval(updateInscriptions, 30 * 1000);
