// app.ts
import express, { Request, Response } from 'express';
import cors from 'cors';

import * as mimeTypes from 'mime-types'; // Import mime-types package
import fs from 'fs';
import NodeCache from 'node-cache';

const app = express();
const port = 3005;
const cache = new NodeCache({ stdTTL: 300, checkperiod: 120 });

import usersRouter from './app/routes/users';
import loginRouter from './app/routes/login';
import logoutRouter from './app/routes/logout';
import inscriptionRouter from './app/routes/inscriptions';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});

// Use the users router
app.use('/users', usersRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
app.use('/inscriptions', inscriptionRouter);


// Start the server
app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});


import sequelize from './config/database';
import updateInscriptionTable from './app/services/InscriptionUpdateService';

// Import your models
// import Inscription from './models/Inscription';
// import InscriptionsUpdateProgress from './models/InscriptionsUpdateProgress';

// Define associations between models if any

// Synchronize tables and start services
// sequelize.sync()
//   .then(() => {
//     console.log('Tables created successfully');
//     updateInscriptionTable();
//     setInterval(updateInscriptionTable, 30 * 1000);
//   })
//   .catch(err => {
//     console.error('Error creating tables:', err);
//   });
