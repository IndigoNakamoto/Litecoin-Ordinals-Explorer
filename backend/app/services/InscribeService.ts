import axios, { AxiosRequestConfig } from 'axios';
import express, { Request, Response } from 'express';
import Invoice from '../models/Invoice';
import File from '../models/File';
import { config } from 'dotenv';

class InscriptionService {
    constructor(private readonly appSecret: string) { }

    private async verifySignature(request: Request): Promise<boolean> {
        const sigHeader = request.headers['btcpay-sig'] as string;
        if (!sigHeader) return false;

        const [algorithm, signature] = sigHeader.split('=');
        const hmac = require('crypto').createHmac(algorithm, this.appSecret);
        const hash = hmac.update(JSON.stringify(request.body)).digest('hex');

        return hash === signature;
    }

    private async handleInvoiceCreated(eventData: any) {
        // Handle invoice created event
        console.log('Invoice Created:', eventData);
        Invoice.create({ invoiceId: eventData.invoiceId, createdAt: eventData.timestamp, updatedAt: eventData.timestamp });
        // TODO: From metadata, get the files and create file records in the database
        // TODO: Validate the files and update their status in the database
    }

    private async handleInvoiceExpired(eventData: any) {
        // Handle invoice expired event
        console.log('Invoice Expired:', eventData);
        Invoice.update({ paymentStatus: 'Expired', updatedAt: eventData.timestamp }, { where: { invoiceId: eventData.invoiceId } });
        // TODO: From metadata, get the files, delete them from storage and update their status to 'Deleted'
    }

    private async handleInvoiceInvalid(eventData: any) {
        console.log('Invoice Invalid:', eventData);
        Invoice.update({ paymentStatus: 'Invalid', updatedAt: eventData.timestamp }, { where: { invoiceId: eventData.invoiceId } });
        // TODO: From metadata, get the files, delete them from storage and update their status to 'Deleted'
    }

    private async handleInvoiceProcessing(eventData: any) {
        console.log('Invoice Processing:', eventData);
        Invoice.update({ paymentStatus: 'Processing', updatedAt: eventData.timestamp }, { where: { invoiceId: eventData.invoiceId } });
    }

    // Inscribe files when invoice is settle
    private async handleInvoiceSettled(eventData: any) {
        console.log('Invoice Settled:', eventData);
        const invoice = await Invoice.findOne({ where: { invoiceId: eventData.invoiceId } });
        // inscribe files for the invoice
        Invoice.update({ paymentStatus: 'Settled', updatedAt: eventData.timestamp }, { where: { invoiceId: eventData.invoiceId } });

    }

    private async handleInvoiceReceivedPayment(eventData: any) {
        // Handle invoice received payment event
        console.log('Invoice Received Payment:', eventData);
        Invoice.update({ paymentStatus: 'Settled', updatedAt: eventData.timestamp }, { where: { invoiceId: eventData.invoiceId } });

    }

    private async inscribeFiles(invoiceId: string) {
        // Iterate over each file and inscribe it
        const files = await File.findAll({ where: { invoiceId, inscribeStatus: 'Pending' } });
        // let error = false
        for (let file of files) {
            // generate the yaml file
            // run the yaml file
            // if error, set error to true and update file inscribe status in database ['Error']
            // else update file inscribe status in database ['Inscribed']
            // delete file from storage
            // update file storage status in database ['Deleted']
        }
        // if error is true, update invoice inscribe status in database ['Error']
        // else update invoice inscribe status in database ['Completed']
    }

    public async listenForWebhookEvents(request: Request, response: Response) {
        try {
            // Verify the request signature
            const signatureVerified = await this.verifySignature(request);
            if (!signatureVerified) {
                return response.status(403).json({ error: 'Invalid signature' });
            }

            // Get the event data from the request body
            const eventData = request.body;

            // Handle the event based on its type
            switch (eventData.type) {
                case 'InvoiceCreated':
                    await this.handleInvoiceCreated(eventData);
                    break;
                case 'InvoiceExpired':
                    await this.handleInvoiceExpired(eventData);
                    break;
                case 'InvoiceReceivedPayment':
                    await this.handleInvoiceReceivedPayment(eventData);
                    break;
                // Add cases for other event types...
                default:
                    console.log('Unhandled event type:', eventData.type);
            }

            return response.status(200).json({ message: 'Event handled successfully' });
        } catch (error) {
            console.error('Error handling webhook event:', error);
            return response.status(500).json({ error: 'Internal server error' });
        }
    }

    public async subscribeToWebhook(storeId: string, webhookUrl: string, events: string[]) {
        const webhookData = {
            enabled: true,
            automaticRedelivery: true,
            url: webhookUrl,
            authorizedEvents: {
                everything: true,
                specificEvents: events,
            },
            secret: this.appSecret,
        };

        try {
            const response = await axios.post(`/api/v1/stores/${storeId}/webhooks`, webhookData, config as AxiosRequestConfig);
            console.log('Webhook subscribed successfully:', response.data);
        } catch (error: any) {
            console.error('Error subscribing to webhook:', error.response.data);
        }
    }
}

export default InscriptionService;
