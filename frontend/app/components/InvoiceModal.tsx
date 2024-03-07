import { Dialog, DialogBody, DialogHeader } from "@material-tailwind/react";
import React, { useState, useEffect } from 'react';

const fetchInvoiceData = async (invoice_id: string) => {
    // Mock data
    const invoiceData = {
        invoice_id: `invoice_${invoice_id}`,
        user_id: `usere_${invoice_id}`,
        status: 'pending',
        created_at: '2024-02-02T12:00:00Z',
        due_at: '2024-02-02T12:30:00Z',
        user_email: 'satoshi@litecoin.com',
        inscriptions: [
            {
                "commit": "20930da8aacf7807ed169e3639a1a5caeacfc2473d9974688828a9546d8f97b8",
                "inscriptions": [
                    {
                        "id": "94c3cfcac9db3a097231c2ef64c884b75aad9dc88ec9e2152c9796105f34de5fi0",
                        "location": "94c3cfcac9db3a097231c2ef64c884b75aad9dc88ec9e2152c9796105f34de5f:0:0"
                    }
                ],
                "parent": null,
                "reveal": "94c3cfcac9db3a097231c2ef64c884b75aad9dc88ec9e2152c9796105f34de5f",
                "total_fees": 67403
            },
        ],
        service_fee: 350000
    };

    return invoiceData;
};

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoiceId: string;
}

const InvoiceModal: React.FC<ModalProps> = ({ isOpen, onClose, invoiceId }) => {
    const [fetchedInvoice, setFetchedInvoice] = useState<any | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const data = await fetchInvoiceData(invoiceId);
            setFetchedInvoice(data);
        };

        if (isOpen) {
            fetchData();
        }
    }, [isOpen, invoiceId]);

    return (
        <Dialog open={isOpen} handler={onClose} placeholder={undefined}>
            <DialogHeader placeholder={undefined}>
                Invoice Details
            </DialogHeader>
            <DialogBody placeholder={undefined}>
                {/* Render your invoice details here */}
                <p>Invoice ID: {fetchedInvoice?.invoice_id || "Loading..."}</p>
                {/* Include other details as needed */}
            </DialogBody>
        </Dialog>
    );
};


export default InvoiceModal;