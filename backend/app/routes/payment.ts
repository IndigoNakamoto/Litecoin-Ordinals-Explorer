import express from 'express';
const router = express.Router();
import InscriptionService from '../services/InscribeService';
const btcpaySecret = process.env.BTCPAY_SECRET; // Your BTCPay Server secret

const inscriptionService = new InscriptionService(btcpaySecret!);

// This could be placed in the same file, or better, in a separate types or models file, then imported.

interface WebhookEvent {
    type: string;
    // Include other properties based on the webhook payload you expect
    // For example, if you handle invoices:
    invoiceId?: string;
    // You might also have a timestamp, or details specific to the type of webhook event
    timestamp?: number;
    // Add other event-specific details as needed
}


router.post('/webhook', async (request, response) => {
    const signature = request.headers['btcpay-sig'] as string;

    if (!signature || !inscriptionService.verifySignature(request)) {
        return response.status(401).send('Invalid signature');
    }

    const event: WebhookEvent = request.body;
    inscriptionService.handleEvent(event);

    response.status(200).send('Event processed');
});


export default router