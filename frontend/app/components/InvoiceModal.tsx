'use client'

import { Dialog, DialogBody, DialogHeader, Typography } from "@material-tailwind/react";
import React, { useEffect, useState } from 'react';

import { buildBackendUrl } from '../lib/runtime';

interface InvoiceResponse {
    invoiceId: string;
    inscribeStatus?: string;
    paymentStatus?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoiceId: string;
}

const InvoiceModal: React.FC<ModalProps> = ({ isOpen, onClose, invoiceId }) => {
    const [fetchedInvoice, setFetchedInvoice] = useState<InvoiceResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!invoiceId) {
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const response = await fetch(buildBackendUrl(`/invoice/${invoiceId}`));

                if (!response.ok) {
                    throw new Error(`Unable to load invoice ${invoiceId}`);
                }

                const data = await response.json();
                setFetchedInvoice(data);
            } catch (fetchError) {
                const message = fetchError instanceof Error ? fetchError.message : 'Unknown invoice error';
                setError(message);
                setFetchedInvoice(null);
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            fetchData();
        }
    }, [invoiceId, isOpen]);

    return (
        <Dialog open={isOpen} handler={onClose} placeholder={undefined}>
            <DialogHeader placeholder={undefined}>
                Invoice Details
            </DialogHeader>
            <DialogBody placeholder={undefined}>
                {loading && <p>Loading invoice...</p>}
                {error && <p className="text-red-500">{error}</p>}
                {!loading && !error && fetchedInvoice && (
                    <div className="space-y-3">
                        <Typography placeholder={undefined}>
                            Invoice ID: {fetchedInvoice.invoiceId}
                        </Typography>
                        <Typography placeholder={undefined}>
                            Payment Status: {fetchedInvoice.paymentStatus ?? 'Unknown'}
                        </Typography>
                        <Typography placeholder={undefined}>
                            Inscription Status: {fetchedInvoice.inscribeStatus ?? 'Pending'}
                        </Typography>
                        <Typography placeholder={undefined}>
                            Created: {fetchedInvoice.createdAt ? new Date(fetchedInvoice.createdAt).toLocaleString() : 'Unknown'}
                        </Typography>
                        <Typography placeholder={undefined}>
                            Updated: {fetchedInvoice.updatedAt ? new Date(fetchedInvoice.updatedAt).toLocaleString() : 'Unknown'}
                        </Typography>
                    </div>
                )}
            </DialogBody>
        </Dialog>
    );
};

export default InvoiceModal;
