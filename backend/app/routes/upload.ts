import express, { Request, Response } from 'express';
import multer from 'multer';
const router = express.Router();
const axios = require('axios');
import { createInvoice, getPaymentMethod } from '../controllers/invoices';
import { createTracing } from 'trace_events';
import fs from 'fs';
import Invoice from '../models/Invoice';


// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: function (req, file, cb) {
    // Generate a unique filename
    const fileExtension = file.originalname.split('.').pop();
    const fileName = file.originalname.split('.')[0]
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${fileName}-${Date.now()}.${fileExtension}`);
  }
});

// Set up multer for file uploads with size limit
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 399 * 1000, // 400 KB in bytes
  }
});


// We create the invoice when the files are uploaded
// Need to create a reference to Invoice model after the invoice is created by BTCPay
router.post('/', upload.array('files', 50), async (req, res) => {
  const { account_id, receivingAddress } = req.body; // Assuming this is how you retrieve your user's ID
  const storeId = 'AN4wugzAGGN56gHFjL1sjKazs89zfLouiLoeTw9R7Maf';
  const BTCPAY_USERNAME = 'ordlite@gmail.com'
  const BTCPAY_PASSWORD = '$had0wTaxih'

  const files = req.files as Express.Multer.File[];

  const base64Credentials = Buffer.from(BTCPAY_USERNAME + ':' + BTCPAY_PASSWORD).toString(
    'base64'
  )

  const auth = `Basic ${base64Credentials}`

  try {
    const status = 'New';
    const invoices = await axios.get(`https://payment.ordlite.com/api/v1/stores/${storeId}/invoices`, {
      params: { status },
      headers: { 'Authorization': `${auth}` }
    });
    // Check if any "NEW" invoice matches the user ID in its metadata
    const hasNewInvoice = invoices.data.some((invoice: { metadata: { account_id: string; }; }) => invoice.metadata && invoice.metadata.account_id === account_id);

    if (hasNewInvoice) {
      console.log('User has an invoice in progress');

      // Delete the uploaded files
      files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) {
            console.error('Error deleting file:', file.path, err);
          } else {
            console.log('Successfully deleted file:', file.path);
          }
        });
      });
      res.status(400).json({ message: "You have an invoice in progress. Please settle it before uploading new files or cancel the invoice." });

    } else if (!hasNewInvoice) {



      const rates = await axios.get(`https://payment.ordlite.com/api/rates?storeId=AN4wugzAGGN56gHFjL1sjKazs89zfLouiLoeTw9R7Maf`);

      // console.log('\nLTC_USD Rate:', rates.data[0].rate)

      const FEE_PER_BYTE = 1
      const POSTAGE = 0.00010000;
      const SERVICE_FEE_USD_RATE = 0.5;
      const LTC_USD = rates.data[0].rate;
      const SERVICE_FEE_LIT_RATE = SERVICE_FEE_USD_RATE / LTC_USD



      // Calculate fees for each file
      const invoiceBreakdown = files.map((file: Express.Multer.File) => {
        const fileSize = file.size;
        const contentFee = fileSize / 4 * FEE_PER_BYTE / 100000000;
        const serviceFee = SERVICE_FEE_LIT_RATE;
        const total = contentFee + POSTAGE + serviceFee;
        return {
          location: file.path,
          fileStatus: 'Uploaded', // Enum: Uploaded, Deleted
          inscribeStatus: 'Pending', // Enum: Pending, Processing, Completed, Cancelled
          inscriptionId: null,
          fileName: file.originalname,
          fileSize,
          contentFee,
          serviceFee,
          postage: POSTAGE,
          total
        };
      })

      // console.log('\nInvoice Breakdown:', invoiceBreakdown)
      const total_service_fee = invoiceBreakdown.reduce((acc: number, file: { serviceFee: number }) => acc + file.serviceFee, 0);
      // console.log('Total Service Fee:', total_service_fee)
      const total_content_fee = invoiceBreakdown.reduce((acc: number, file: { contentFee: number }) => acc + file.contentFee, 0);
      // console.log('Total Content Fee:', total_content_fee)
      const total_postage = invoiceBreakdown.length * POSTAGE;
      // console.log('Total Postage Fee:', total_postage)
      const total = total_service_fee + total_content_fee + total_postage;
      // console.log('Total:', total)




      try {
        const invoice = await axios.post(`https://payment.ordlite.com/api/v1/stores/${storeId}/invoices`, {
          amount: total,
          currency: 'LTC',
          additionalSearchTerms: [account_id],
          metadata: {
            receivingAddress,
            account_id,
            files: invoiceBreakdown,
            files_location: files.map(file => file.path),
            ltc_usd_rate: LTC_USD,
            status: 'Pending' // Enum: Pending, Processing, Completed, Cancelled
          },
          receipt: {
            "enabled": true,
            "showQR": true,
          }
        }, {
          headers: { 'Authorization': `${auth}` }
        });
        const ipaddress = req.ip as string;
        try { 
          await createInvoice(invoice.data.id, ipaddress, account_id, receivingAddress)

        } catch (error) {
          console.error('Error creating invoice:', error);
          res.json(error)
        }
        const payment = await getPaymentMethod(invoice.data.id)
        // console.log('Invoice created:', dbInvoice)
        // Assuming all validations pass, send a success response
        // res.send(`Files uploaded successfully: ${files.map(file => file.originalname).join(', ')}`);
        const { id, amount, status, expirationTime, createdTime, currency, metadata } = invoice.data;
        // console.log('Invoice created:', invoice.data)
        const { paymentLink, destination, due } = payment[0]

        // console.log('Payment method: ', payment)

        // Send invoiceData invoice.data: id, amount, status, expirationTime, createdTime, currency, metadata, receivingAddress
        // Send paymentMethods: paymentLink
        // console.log('Payment Method Response', payment[0])
        // console.log({ id, expirationTime, createdTime, due, destination, paymentLink, metadata, status, currency, LTC_USD })





        // TODO: Create Invoice 
        // const invoiceDocument = await Invoice.create({ account_id, receivingAddress, files: invoiceBreakdown })
        // console.log('Invoice Document:', invoiceDocument)

        // Invoice.create({ invoiceId: eventData.invoiceId, createdAt: eventData.timestamp, updatedAt: eventData.timestamp });
        res.send({ id, expirationTime, createdTime, due, destination, paymentLink, metadata, status, currency, LTC_USD })
      } catch (error) {
        console.error('Error creating invoice:', error);
        res.json(error)
      }
    }




  } catch (error) {
    console.error('Error fetching invoices:', error);
    return res.status(500).json({ message: "An error occurred while checking invoices." });
  }

});


export default router;
