import express from 'express';
import multer from 'multer';
import axios from 'axios';
import Invoice from '../models/Invoice';

// Assuming utility functions and necessary imports are in place
import { generateCredentials, fetchInvoices, calculateFees, createInvoice } from './utils';

// Multer setup for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
      const fileExtension = file.originalname.split('.').pop();
      const fileName = file.originalname.split('.')[0];
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      cb(null, `${file.fieldname}-${fileName}-${uniqueSuffix}.${fileExtension}`);
    }
  }),
  limits: { fileSize: 399 * 1000 }, // 400 KB limit
});

const uploadController = {
  async uploadFiles(req: express.Request, res: express.Response) {
    try {
      const files = req.files as Express.Multer.File[];
      const userId = req.body.userId;
      const auth = generateCredentials('ordlite@gmail.com', '$had0wTaxih');

      // Check for existing invoices
      const hasNewInvoice = await fetchInvoices(auth, userId);
      if (hasNewInvoice) {
        return res.status(400).json({ message: "You have an invoice in progress. Please settle it before uploading new files or cancel the invoice." });
      }

      // Calculate fees and create invoice breakdown
      const invoiceBreakdown = calculateFees(files);
      const total = invoiceBreakdown.total;

      // Create new invoice
      await createInvoice(auth, userId, total, invoiceBreakdown.files);

      // Success response
      res.send(`Files uploaded successfully: ${files.map(file => file.originalname).join(', ')}`);
    } catch (error) {
      console.error('Error in file upload:', error);
      res.status(500).json({ message: "An error occurred during the upload process." });
    }
  }
};

// Export the controller to be used in the router setup
export default uploadController;
