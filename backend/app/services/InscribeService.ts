import axios, { AxiosRequestConfig } from 'axios';
import express, { Request, Response } from 'express';
import Invoice from '../models/Invoice';
import { exec } from 'child_process';
import File from '../models/File';
import { config } from 'dotenv';
import fs from 'fs';
import { promisify } from 'util';
import LitecoinInscriptionService from './LitecoinInscriptionService';
import OrdService from './OrdService';
config();

const execAsync = promisify(exec);


interface WebhookEvent {
    type: string;
    // Include other properties based on the webhook payload you expect
    // For example, if you handle invoices:
    invoiceId?: string;
    // You might also have a timestamp, or details specific to the type of webhook event
    timestamp?: number;
    // Add other event-specific details as needed
}

const litecoinInscriptionService = new LitecoinInscriptionService();
const ordService = new OrdService();


class InscriptionService {
    constructor(private readonly appSecret: string) { }

    public async verifySignature(request: Request): Promise<boolean> {
        const sigHeader = request.headers['btcpay-sig'] as string;
        if (!sigHeader) return false;

        const [algorithm, signature] = sigHeader.split('=');
        const hmac = require('crypto').createHmac(algorithm, this.appSecret);
        const hash = hmac.update(JSON.stringify(request.body)).digest('hex');

        return hash === signature;
    }

    public async handleEvent(event: WebhookEvent) {
        switch (event.type) {
            case 'InvoiceCreated':
                await this.handleInvoiceCreated(event);
                break;
            case 'InvoiceExpired':
                await this.handleInvoiceExpired(event);
                break;
            case 'InvoiceInvalid':
                await this.handleInvoiceInvalid(event);
                break;
            case 'InvoiceProcessing':
                await this.handleInvoiceProcessing(event);
                break;
            case 'InvoiceSettled':
                await this.handleInvoiceSettled(event);
                break;

            // Handle other types as necessary
            default:
                console.log('Unhandled event type:', event.type);
        }
    }


    private async handleInvoiceCreated(eventData: any) {
        // Handle invoice created event
        console.log('Invoice Created:', eventData);
        // Invoice.create({ invoiceId: eventData.invoiceId, createdAt: eventData.timestamp, updatedAt: eventData.timestamp });
        // TODO: From metadata, get the files and create file records in the database
        // TODO: Validate the files and update their status in the database
    }

    private async handleInvoiceExpired(eventData: any) {
        // Handle invoice expired event
        console.log('Invoice Expired:', eventData);
        const storeId = 'AN4wugzAGGN56gHFjL1sjKazs89zfLouiLoeTw9R7Maf';
        const BTCPAY_USERNAME = 'ordlite@gmail.com'
        const BTCPAY_PASSWORD = '$had0wTaxih'
        const base64Credentials = Buffer.from(BTCPAY_USERNAME + ':' + BTCPAY_PASSWORD).toString(
            'base64'
        )

        const auth = `Basic ${base64Credentials}`

        let updatedFiles = eventData.metadata.files.map((file: any) => {
            return { ...file, fileStatus: 'Deleted', inscribeStatus: 'Cancelled' }; // Update each file's status to 'Deleted'
        });
        console.log('Updated Files:', updatedFiles);

        let updatedMetadata = { ...eventData.metadata, status: 'Cancelled', files: updatedFiles };
        console.log('Updated Metadata:', updatedMetadata);

        const update_metadata = await axios.put(`https://payment.ordlite.com/api/v1/stores/${storeId}/invoices/${eventData.invoiceId}`, {
            metadata: updatedMetadata
        }, {
            headers: { 'Authorization': auth }
        });

        console.log('handleInvoiceExpired - Update Metadata:', update_metadata.data)


        const update = await Invoice.update({ paymentStatus: 'Expired', inscribeStatus: 'Cancelled', updatedAt: eventData.timestamp }, { where: { invoiceId: eventData.invoiceId } });
        if (update && update_metadata) {
            const files = eventData.metadata.files_location;
            // delete files from upload folder
            for (let file of files) {
                console.log('Deleting file:', file);
                fs.unlink(file, (err) => {
                    if (err) {
                        console.error('Error deleting file:', err);
                    }
                });
            }
        }
    }

    private async handleInvoiceInvalid(eventData: any) {
        console.log('Invoice Invalid:', eventData);
        const storeId = 'AN4wugzAGGN56gHFjL1sjKazs89zfLouiLoeTw9R7Maf';
        const BTCPAY_USERNAME = 'ordlite@gmail.com'
        const BTCPAY_PASSWORD = '$had0wTaxih'
        const base64Credentials = Buffer.from(BTCPAY_USERNAME + ':' + BTCPAY_PASSWORD).toString(
            'base64'
        )

        const auth = `Basic ${base64Credentials}`

        let updatedFiles = eventData.metadata.files.map((file: any) => {
            return { ...file, fileStatus: 'Deleted', inscribeStatus: 'Cancelled' }; // Update each file's status to 'Deleted'
        });

        let updatedMetadata = { ...eventData.metadata, status: 'Cancelled', files: updatedFiles };

        const update_metadata = await axios.put(`https://payment.ordlite.com/api/v1/stores/${storeId}/invoices/${eventData.invoiceId}`, {
            metadata: updatedMetadata
        }, {
            headers: { 'Authorization': auth }
        });

        // console.log('handleInvoiceInvalid - Update Metadata:', update_metadata.data)

        const update = await Invoice.update({ paymentStatus: 'Invalid', inscribeStatus: 'Cancelled', updatedAt: eventData.timestamp }, { where: { invoiceId: eventData.invoiceId } });
        if (update && update_metadata) {
            const files = eventData.metadata.files_location;
            // delete files from upload folder
            for (let file of files) {
                console.log('Deleting file:', file);
                fs.unlink(file, (err) => {
                    if (err) {
                        console.error('Error deleting file:', err);
                    }
                });
            }
        }
    }

    private async handleInvoiceProcessing(eventData: any) {
        console.log('Invoice Processing:', eventData);
        // const storeId = 'AN4wugzAGGN56gHFjL1sjKazs89zfLouiLoeTw9R7Maf';
        // const BTCPAY_USERNAME = 'ordlite@gmail.com'
        // const BTCPAY_PASSWORD = '$had0wTaxih'
        // const base64Credentials = Buffer.from(BTCPAY_USERNAME + ':' + BTCPAY_PASSWORD).toString(
        //     'base64'
        // )

        // const auth = `Basic ${base64Credentials}`
        // let updatedFiles = eventData.metadata.files.map((file: any) => {
        //     return { ...file, inscribeStatus: 'Processing' }; // Update each file's status to 'Deleted'
        // });

        // let updatedMetadata = { ...eventData.metadata, status: 'Processing', files: updatedFiles };
        // const update_metadata = await axios.put(`https://payment.ordlite.com/api/v1/stores/${storeId}/invoices/${eventData.invoiceId}`, {
        //     metadata: updatedMetadata
        // }, {
        //     headers: { 'Authorization': auth }
        // });

        Invoice.update({ paymentStatus: 'Processing', updatedAt: eventData.timestamp }, { where: { invoiceId: eventData.invoiceId } });
    }

    // Inscribe files when invoice is settle
    private async handleInvoiceSettled(eventData: any) {
        console.log('Invoice Settled:', eventData);
        Invoice.update({paymentStatus: 'Settled', updatedAt: eventData.timestamp}, {where: {invoiceId: eventData.invoiceId}});

        const storeId = 'AN4wugzAGGN56gHFjL1sjKazs89zfLouiLoeTw9R7Maf';
        const BTCPAY_USERNAME = 'ordlite@gmail.com'
        const BTCPAY_PASSWORD = '$had0wTaxih'
        const base64Credentials = Buffer.from(BTCPAY_USERNAME + ':' + BTCPAY_PASSWORD).toString(
            'base64'
        )

        const auth = `Basic ${base64Credentials}`
        let updatedFiles = eventData.metadata.files.map((file: any) => {
            return { ...file, inscribeStatus: 'Queued' }; // Update each file's status to 'Deleted'
        });

        let updatedMetadata = { ...eventData.metadata, status: 'Queued', files: updatedFiles };
        await axios.put(`https://payment.ordlite.com/api/v1/stores/${storeId}/invoices/${eventData.invoiceId}`, {
            metadata: updatedMetadata
        }, {
            headers: { 'Authorization': auth }
        });

        // Inscribe files for the settled invoice
        ordService.inscribeFilesForInvoice(eventData.invoiceId).then(() => {
            console.log(`Inscription process completed successfully for invoice: ${eventData.invoiceId}.`);
            Invoice.update({ paymentStatus: 'Settled', updatedAt: eventData.timestamp, inscribeStatus: 'Committed' }, { where: { invoiceId: eventData.invoiceId } });

            // const files = updatedMetadata.files_location
            // for (let file of files) {
            //     console.log('Deleting file:', file);
            //     fs.unlink(file, (err) => {
            //         if (err) {
            //             console.error('Error deleting file:', err);
            //         }
            //     });
            // }

            // let updatedFiles = eventData.metadata.files.map((file: any) => {
            //     return { ...file, fileStatus: 'Deleted'}; // Update each file's status to 'Deleted'
            // });

            // await axios.put(`https://payment.ordlite.com/api/v1/stores/${storeId}/invoices/${eventData.invoiceId}`, {
            //     metadata: updatedMetadata, status: 'Committed', inscribeStatus: 'Committed', files: updatedFiles
            // }, {
            //     headers: { 'Authorization': auth }
            // });
        }).catch((error) => {
            console.error('Inscription process failed:', error);
            Invoice.update({ paymentStatus: 'Settled', updatedAt: eventData.timestamp, inscribeStatus: 'Error' }, { where: { invoiceId: eventData.invoiceId } });
            // await axios.put(`https://payment.ordlite.com/api/v1/stores/${storeId}/invoices/${eventData.invoiceId}`, {
            //     metadata: updatedMetadata, status: 'Error', files: updatedFiles
            // }, {
            //     headers: { 'Authorization': auth }
            // });
        });

    }

}

export default InscriptionService;
