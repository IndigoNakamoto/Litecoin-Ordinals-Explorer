'use client'

import { Button, Card, Typography } from "@material-tailwind/react";
import { useEffect, useMemo, useState } from 'react';

import FileUpload from "../components/FileUpload";
import FileUploadAlert from "../components/FileUploadAlert";
import InvoiceHistory from '../components/inscribe-history';
import { appendStoredInvoiceHistory } from "../lib/invoiceHistory";
import { buildBackendUrl } from "../lib/runtime";
import { getStoredWalletSession } from "../lib/walletSession";

export default function Page() {
    const [files, setFiles] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [latestInvoiceId, setLatestInvoiceId] = useState<string | null>(null);
    const walletSession = useMemo(() => getStoredWalletSession(), []);

    useEffect(() => {
        if (walletSession.connected && walletSession.username) {
            setStatusMessage(`Connected wallet: ${walletSession.username}`);
        }
    }, [walletSession.connected, walletSession.username]);

    const handleFileSelect = (file: File) => {
        setFiles((prevFiles) => [...prevFiles, file]);
        setError(null);
        setStatusMessage(`${file.name} added to your inscription queue.`);
    };

    const handleSubmit = async () => {
        if (files.length === 0) {
            setError('Choose at least one file before creating an invoice.');
            return;
        }

        setSubmitting(true);
        setError(null);
        setStatusMessage(null);

        const invoiceId = `inv-${Date.now()}`;
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('files', file);
        });
        formData.append('user_id', walletSession.username || 'guest');
        formData.append('invoice_id', invoiceId);

        try {
            const uploadResponse = await fetch(buildBackendUrl('/upload'), {
                method: 'POST',
                body: formData,
            });

            if (!uploadResponse.ok) {
                throw new Error(await uploadResponse.text());
            }

            const invoiceResponse = await fetch(buildBackendUrl('/invoice'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ invoiceId }),
            });

            if (!invoiceResponse.ok) {
                throw new Error('Invoice creation failed.');
            }

            appendStoredInvoiceHistory({
                invoiceId,
                fileName: files.map((file) => file.name).join(', '),
                createdAt: new Date().toISOString(),
                status: 'Pending',
            });
            setLatestInvoiceId(invoiceId);
            setStatusMessage(`Invoice ${invoiceId} created successfully.`);
            setFiles([]);
        } catch (submitError) {
            const message = submitError instanceof Error ? submitError.message : 'Upload failed';
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="mx-auto max-w-full bg-gray-200 lg:py-20">
            <div className="mx-auto max-w-screen-lg p-4">
                <Typography variant="h1" className="mb-6 font-2xl text-gray-900" placeholder={undefined}>
                    Inscribe
                </Typography>
                <Typography className="mb-6 text-gray-600" placeholder={undefined}>
                    Upload a supported file, create an invoice, and keep track of recent inscription requests from this browser.
                </Typography>

                <div className="grid grid-cols-1 gap-4 pt-4">
                    {error ? (
                        <FileUploadAlert error={error} onClose={() => setError(null)} />
                    ) : (
                        <FileUpload onFileSelect={handleFileSelect} onErrorChange={setError} />
                    )}

                    <Card className="p-4" placeholder={undefined}>
                        <Typography variant="h6" color="blue-gray" placeholder={undefined}>
                            Ready to inscribe
                        </Typography>
                        <Typography className="mt-1 text-sm text-gray-600" placeholder={undefined}>
                            {walletSession.connected
                                ? `Wallet connected as ${walletSession.username || 'unknown address'}.`
                                : 'You can upload without connecting, but connecting a wallet makes account tracking easier.'}
                        </Typography>

                        <div className="mt-4 space-y-2">
                            {files.length === 0 ? (
                                <p className="text-sm text-gray-500">No files selected yet.</p>
                            ) : (
                                files.map((file) => (
                                    <div key={`${file.name}-${file.lastModified}`} className="flex items-center justify-between rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700">
                                        <span>{file.name}</span>
                                        <span>{Math.round(file.size / 1000)} KB</span>
                                    </div>
                                ))
                            )}
                        </div>

                        {statusMessage && (
                            <p className="mt-4 text-sm text-blue-700">{statusMessage}</p>
                        )}
                        {latestInvoiceId && (
                            <p className="mt-1 text-xs text-gray-600">Latest invoice: {latestInvoiceId}</p>
                        )}

                        <div className="mt-6 flex flex-wrap gap-3">
                            <Button
                                onClick={handleSubmit}
                                color="blue"
                                disabled={submitting || files.length === 0}
                                placeholder={undefined}
                            >
                                {submitting ? 'Creating invoice...' : 'Create inscription invoice'}
                            </Button>
                            {files.length > 0 && (
                                <Button
                                    variant="text"
                                    color="blue-gray"
                                    onClick={() => setFiles([])}
                                    placeholder={undefined}
                                >
                                    Clear files
                                </Button>
                            )}
                        </div>
                    </Card>
                </div>

                <div className="my-6">
                    <InvoiceHistory />
                </div>
            </div>
        </section>
    );
}
