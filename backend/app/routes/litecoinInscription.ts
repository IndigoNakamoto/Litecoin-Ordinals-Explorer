import express, { Request, Response } from 'express';
import LitecoinInscriptionService from '../services/LitecoinInscriptionService';

const router = express.Router();
const inscriptionService = new LitecoinInscriptionService();

// Previous route definitions...

// Route to generate a new address
router.get('/generateAddresses', async (req: Request, res: Response) => {
    console.log('Generating new address...');
    try {
        const newAddress = await inscriptionService.generateAddresses(10);
        return res.status(200).json({ address: newAddress });
    } catch (error: any) {
        return res.status(500).json({ message: 'Error generating new address', error: error.message });
    }
});

// Route to get the wallet balance
router.get('/walletBalance', async (req: Request, res: Response) => {
    console.log('Getting wallet balance...');
    try {
        const balance = await inscriptionService.getWalletBalance();
        return res.status(200).json({ balance });
    } catch (error: any) {
        return res.status(500).json({ message: 'Error retrieving wallet balance', error: error.message });
    }
});

export default router;
