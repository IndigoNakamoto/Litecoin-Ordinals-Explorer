'use client'
// /app/invoice/[invoice_id]/page.tsx
import {
    Typography,
} from "@material-tailwind/react";
import router, { useRouter } from 'next/router';
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
// Fetch invoice data
const fetchInvoice = async (invoice_id: string) => {
    const data = await fetchInvoiceData(invoice_id);
    return data
};

export default function Page({ params }: { params: { invoice_id: string } }) {


    interface InvoiceProps {
        // Define your invoice data structure here
        invoice_id: string;
        user_id: string;
        status: string;
        // Other properties...
    }

    const invoice_id = params.invoice_id;
    const [fetchedInvoice, setFetchedInvoice] = useState<InvoiceProps | null>(null);

    useEffect(() => {
        // Fetch invoice data
        const fetchData = async () => {
            const data = await fetchInvoice(invoice_id);
            setFetchedInvoice(data)
        };

        fetchData();
    }, [invoice_id]);


    return (
        <section className="mx-auto p-4 max-w-screen-xl">
            <Typography variant="h1" className="mb-6 font-xl text-gray-200">
                Invoice
            </Typography>
            <p>Invoice ID: {fetchedInvoice?.invoice_id || ""}</p>
            <p>Invoice ID: {fetchedInvoice?.user_id || ""}</p>
            <p>Invoice ID: {fetchedInvoice?.status || ""}</p>
            {/* Render other invoice details */}
        </section>
    );
}