import { Request, Response } from 'express';
import Invoice from '../models/Invoice';
import { Op } from 'sequelize';

export const getInvoiceById = async (req: Request, res: Response) => {
    try {
        const { invoiceId } = req.params;
        const invoice = await Invoice.findByPk(invoiceId);
        if (invoice) {
            res.json(invoice);
        } else {
            res.status(404).json({ error: 'Invoice not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

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

export const createInvoice = async (req: Request, res: Response) => {
    try {
        const { invoiceId, InscribeStatus } = req.body;
        const newInvoice = await Invoice.create({
            invoiceId,
            InscribeStatus, // TODO Remove this line
        });
        res.json(newInvoice);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}