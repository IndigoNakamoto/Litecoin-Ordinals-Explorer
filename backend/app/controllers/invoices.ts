import { Request, Response } from 'express';
import Invoice from '../models/Invoice';
import { Op } from 'sequelize';
const axios = require('axios');

export const getInvoiceById = async (req: Request, res: Response) => {
    console.log('Getting Invoice by ID')
    try {
        const { invoiceId } = req.params;
        console.log('Invoice ID:', invoiceId)
        const BTCPAY_USERNAME = 'ordlite@gmail.com'
        const BTCPAY_PASSWORD = '$had0wTaxih'
        const storeId = 'AN4wugzAGGN56gHFjL1sjKazs89zfLouiLoeTw9R7Maf';
        const base64Credentials = Buffer.from(BTCPAY_USERNAME + ':' + BTCPAY_PASSWORD).toString(
            'base64'
        )

        const auth = `Basic ${base64Credentials}`
        const invoice = await axios.get(`https://payment.ordlite.com/api/v1/stores/${storeId}/invoices/${invoiceId}`, {
            headers: { 'Authorization': `${auth}` },
        });

        const {createdTime, expirationTime, id, metadata, status} = invoice.data
        const invoiceDB = await Invoice.findOne({ where: { invoiceId } });
        // console.log('Invoice:', invoice.data);
        // console.log('InvoiceDB:', invoiceDB?.dataValues.inscribeStatus);

        const payment_method = await getPaymentMethod(id)
        // console.log('Payment Method object: ', payment_method)
        const {due, destination, paymentLink} = payment_method[0]
 

        if (invoice&& invoiceDB) {
            res.json({id, createdTime, expirationTime, due, destination, paymentLink, metadata, status, inscribeStatus:invoiceDB?.dataValues.inscribeStatus, });
        } else {
            res.status(404).json({ error: 'Invoice not found' });
        }
    } catch (error) {
        console.log('Error: ', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Implement getInvoiceStatusByid
export const getInvoiceStatusById = async (req: Request, res: Response) => {
    console.log('Getting Invoice Status')
    try {
        const { invoiceId } = req.params;
        const invoice = await Invoice.findOne({ where: { invoiceId } });
        if (invoice) {
            if(invoice === null){
                res.status(404).json({ error: 'Invoice not found' });
            }
            res.json({ inscribeStatus: invoice.inscribeStatus, paymentStatus: invoice.paymentStatus });
        } else {
            res.status(404).json({ error: 'Invoice not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


export const getLTC = async (req: Request, res: Response) => {
    console.log('Getting LTC_USD Rate')
    try {
        const rates = await axios.get(`https://payment.ordlite.com/api/rates?storeId=AN4wugzAGGN56gHFjL1sjKazs89zfLouiLoeTw9R7Maf`);
        console.log('\nLTC_USD Rate:', rates.data[0].rate)
        res.json(rates.data[0].rate);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error: ' + error });
    }
}

export const getInvoicesByStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.params;
        const invoices = await Invoice.findAll({
            where: {
                InscribeStatus: status,
            },
        });
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const checkIfNewInvoiceExistsByAccountId = async (req: Request, res: Response) => {
    // Extract account_id from the request parameters
    const { account_id } = req.params;

    // BTCPay Server credentials and storeId
    const BTCPAY_USERNAME = 'ordlite@gmail.com';
    const BTCPAY_PASSWORD = '$had0wTaxih';
    const storeId = 'AN4wugzAGGN56gHFjL1sjKazs89zfLouiLoeTw9R7Maf';
    
    // Encode credentials to Base64 for the Authorization header
    const base64Credentials = Buffer.from(`${BTCPAY_USERNAME}:${BTCPAY_PASSWORD}`).toString('base64');
    const auth = `Basic ${base64Credentials}`;

    // Prepare URLSearchParams for the query
    const params = new URLSearchParams();
    params.append('textSearch', account_id);

    try {
        // Fetch invoices from BTCPay Server
        const response = await axios.get(`https://payment.ordlite.com/api/v1/stores/${storeId}/invoices`, {
            headers: { 'Authorization': auth },
            params: params
        });

        // Check if there is at least one invoice with status 'New'
        const hasNewInvoice = response.data.some((invoice: any) => invoice.status === 'New');

        // Respond with the boolean result
        res.json({ hasNewInvoice });
    } catch (error) {
        // Handle errors, such as network issues or invalid credentials
        console.error('Failed to check invoices:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getInvoiceByAccountId = async (req: Request, res: Response) => {
    // get all invoices from database
    const { account_id } = req.params;

    // query for invoices from btcpay server
    const BTCPAY_USERNAME = 'ordlite@gmail.com'
    const BTCPAY_PASSWORD = '$had0wTaxih'
    const storeId = 'AN4wugzAGGN56gHFjL1sjKazs89zfLouiLoeTw9R7Maf';
    const base64Credentials = Buffer.from(BTCPAY_USERNAME + ':' + BTCPAY_PASSWORD).toString(
        'base64'
    )

    // Using URLSearchParams to handle query string serialization
    const params = new URLSearchParams();
    params.append('textSearch', account_id)

    const auth = `Basic ${base64Credentials}`
    const btcpay_invoices = await axios.get(`https://payment.ordlite.com/api/v1/stores/${storeId}/invoices`, {
        headers: { 'Authorization': `${auth}` },
        params: params
    });

    // Remove checkoutLink from each object
    const invoicesWithoutCheckoutLink = btcpay_invoices.data.map((invoice: any) => {
        const { checkoutLink, ...rest } = invoice;
        const { id, amount, status, expirationTime, createdTime, currency, metadata, receivingAddress } = rest;
        return { id, amount, status, expirationTime, createdTime, currency, metadata, receivingAddress };
    });

    res.json(invoicesWithoutCheckoutLink);
}

export const createInvoice = async (invoiceId: String, ipaddress: String, accountid: String, receivingAddress: String) => {
    console.log('Creating Invoice record in app controllers invoices')
    console.log('Invoice ID:', invoiceId)
    console.log('IP Address:', ipaddress)
    console.log('Account ID:', accountid)
    console.log('Receiving Address:', receivingAddress)
    try {
        const newInvoice = await Invoice.create({
            receivingaddress: receivingAddress,
            invoiceId,
            ipaddress,
            accountid
        });
        return newInvoice;
    } catch (error) {
        throw new Error(`Error creating invoice: ${error}`);
        // return { error: `Error creating invoice: ${error}` };
    }
}

/**
 * Marks an invoice as Invalid.
 */
export const markInvoiceInvalid = async (req: Request, res: Response) => {
    const { invoiceId } = req.params;

    try {
        // Prepare authentication credentials
        const BTCPAY_USERNAME = 'ordlite@gmail.com';
        const BTCPAY_PASSWORD = '$had0wTaxih';
        const base64Credentials = Buffer.from(`${BTCPAY_USERNAME}:${BTCPAY_PASSWORD}`).toString('base64');
        const authHeader = `Basic ${base64Credentials}`;
        const storeId = 'AN4wugzAGGN56gHFjL1sjKazs89zfLouiLoeTw9R7Maf';

        // Prepare and send the POST request to update the invoice status to Invalid
        const response = await axios.post(`https://payment.ordlite.com/api/v1/stores/${storeId}/invoices/${invoiceId}/status`,
            { status: 'Invalid' },
            { headers: { 'Authorization': authHeader } });

        // If the request is successful, return the updated invoice information

        const { id, amount, status, expirationTime, createdTime, currency, metadata, receivingAddress } = response.data



        res.json({ id, amount, status, expirationTime, createdTime, currency, metadata, receivingAddress });
    } catch (error) {
        // if (error.response) {
        //     // Handle API responses with error status codes
        //     res.status(error.response.status).json(error.response.data);
        // } else if (error.request) {
        //     // Handle cases where no response was received from the API
        //     res.status(500).json({ error: 'No response received from external API' });
        // } else {
        //     // Handle other errors
        //     res.status(500).json({ error: 'An error occurred while marking the invoice as invalid' });
        // }
        res.status(500).json({ error: 'An error occurred while marking the invoice as invalid' });
    }
};

export const getPaymentMethod = async (invoiceId: string) => {
    try {
        const BTCPAY_USERNAME = 'ordlite@gmail.com'
        const BTCPAY_PASSWORD = '$had0wTaxih'
        const base64Credentials = Buffer.from(`${BTCPAY_USERNAME}:${BTCPAY_PASSWORD}`).toString('base64');
        const authHeader = `Basic ${base64Credentials}`;
        const storeId = 'AN4wugzAGGN56gHFjL1sjKazs89zfLouiLoeTw9R7Maf';
        // Prepare the API URL
        const apiUrl = `https://payment.ordlite.com/api/v1/stores/${storeId}/invoices/${invoiceId}/payment-methods`;

        // Making the GET request
        const response = await axios.get(apiUrl, {
            headers: { 'Authorization': authHeader },
            params: { invoiceId }
        });
        return response.data;
    } catch (error) {
        return { error: 'Error fetching payment methods' };
    }
}


export const getInvoicePaymentMethods = async (req: Request, res: Response) => {
    try {
        const { invoiceId } = req.params; // Extracting path parameters from the request
        const onlyAccountedPayments = req.query.onlyAccountedPayments || true; // Handling optional query parameter with default value

        // Prepare the authentication credentials
        const BTCPAY_USERNAME = 'ordlite@gmail.com'
        const BTCPAY_PASSWORD = '$had0wTaxih'
        const base64Credentials = Buffer.from(`${BTCPAY_USERNAME}:${BTCPAY_PASSWORD}`).toString('base64');
        const authHeader = `Basic ${base64Credentials}`;
        const storeId = 'AN4wugzAGGN56gHFjL1sjKazs89zfLouiLoeTw9R7Maf';
        // Prepare the API URL
        const apiUrl = `https://payment.ordlite.com/api/v1/stores/${storeId}/invoices/${invoiceId}/payment-methods`;

        // Making the GET request
        const response = await axios.get(apiUrl, {
            headers: { 'Authorization': authHeader },
            params: { onlyAccountedPayments }
        });

        // Sending the response back
        res.json(response.data);
    } catch (error) {
        // if (error.response) {
        //     // The request was made and the server responded with a status code
        //     // that falls out of the range of 2xx
        //     console.log(error.response.data);
        //     console.log(error.response.status);
        //     console.log(error.response.headers);
        //     res.status(error.response.status).json(error.response.data);
        // } else if (error.request) {
        //     // The request was made but no response was received
        //     console.log(error.request);
        //     res.status(500).json({ error: 'No response received from the server' });
        // } else {
        //     // Something happened in setting up the request that triggered an Error
        //     console.log('Error', error.message);
        //     res.status(500).json({ error: error.message });
        // }
        // return { error: 'Error fetching payment methods' };
        res.status(500).json({ error: 'An error occurred while fetching payment method' });
    }
};