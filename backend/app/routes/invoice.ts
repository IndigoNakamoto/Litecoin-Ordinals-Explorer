import express from 'express';
import { createInvoice, checkIfNewInvoiceExistsByAccountId, getInvoiceStatusById, getInvoiceById, getInvoicesByStatus, getInvoiceByAccountId, getInvoicePaymentMethods, getLTC, markInvoiceInvalid } from '../controllers/invoices';
const router = express.Router();


router.get('/ltcusd', async (req, res) => {
    const ltc = await getLTC(req, res);
    res.send(ltc);
});

router.get('/:invoiceId', getInvoiceById);

router.get('/status/:invoiceId', getInvoiceStatusById);

router.get('/status/:status', getInvoicesByStatus);

router.get('/account/:account_id', getInvoiceByAccountId);

router.get('/paymentMethods/:invoiceId', getInvoicePaymentMethods);

router.post('/markInvalid/:invoiceId', markInvoiceInvalid);

router.get('/new/account/:account_id', checkIfNewInvoiceExistsByAccountId);


export default router