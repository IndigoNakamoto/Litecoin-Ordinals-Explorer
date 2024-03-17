import express from 'express';
import {createInvoice, getInvoiceById, getInvoicesByStatus} from '../controllers/invoices';
const router = express.Router();

router.post('/', createInvoice);
router.get('/:invoiceId', getInvoiceById);
router.get('/status/:status', getInvoicesByStatus);


export default router