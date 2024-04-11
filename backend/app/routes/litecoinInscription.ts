import express, { Request, Response } from 'express';
import LitecoinInscriptionService from '../services/LitecoinInscriptionService';
import OrdService from '../services/OrdService';

const router = express.Router();
const inscriptionService = new LitecoinInscriptionService();
const ordService = new OrdService();

// Previous route definitions...

// Route to generate a new address
router.get('/generateAddresses', async (req: Request, res: Response) => {
    console.log('Generating new address...');
    try {
        // const newAddress = await inscriptionService.generateAddresses(10);
        const newAddress = await ordService.generateAddresses(10)
        return res.status(200).json({ address: newAddress });
    } catch (error: any) {
        return res.status(500).json({ message: 'Error generating new address', error: error.message });
    }
});

// Route to get the wallet balance
router.get('/walletBalance', async (req: Request, res: Response) => {
    console.log('Getting wallet balance...');
    try {
        const balance = await ordService.getWalletBalance();
        return res.status(200).json({ balance });
    } catch (error: any) {
        return res.status(500).json({ message: 'Error retrieving wallet balance', error: error.message });
    }
});

router.post('/:invoiceId', async (req: Request, res: Response) => { 
    const { invoiceId } = req.params;
    try { 
        const response = await ordService.inscribeFilesForInvoice(invoiceId)
        return res.status(200).json(response)
    } catch (error: any) { 
        return res.status(500).json({message: error})
    }
})

router.get('/updateIndex', async (req: Request, res: Response) => {
    try {
        const response = await ordService.updateIndex()
        return res.status(200).json(response)
    } catch (error: any) {
        return res.status(500).json({message: error})
    }
})
export default router;
