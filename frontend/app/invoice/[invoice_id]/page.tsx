import { buildBackendUrl } from "../../lib/runtime";

interface InvoiceProps {
    invoiceId: string;
    paymentStatus?: string;
    inscribeStatus?: string;
    createdAt?: string;
    updatedAt?: string;
}

async function fetchInvoice(invoiceId: string): Promise<InvoiceProps | null> {
    try {
        const response = await fetch(buildBackendUrl(`/invoice/${invoiceId}`), {
            cache: 'no-store',
        });

        if (!response.ok) {
            return null;
        }

        return response.json();
    } catch (error) {
        console.error('Failed to fetch invoice:', error);
        return null;
    }
}

export default async function Page({ params }: { params: { invoice_id: string } }) {
    const invoice = await fetchInvoice(params.invoice_id);

    return (
        <section className="mx-auto max-w-screen-xl p-4">
            <h1 className="mb-6 text-3xl font-medium text-gray-200">
                Invoice
            </h1>

            {invoice ? (
                <div className="space-y-3 text-gray-300">
                    <p>Invoice ID: {invoice.invoiceId}</p>
                    <p>Payment Status: {invoice.paymentStatus ?? 'Unknown'}</p>
                    <p>Inscription Status: {invoice.inscribeStatus ?? 'Pending'}</p>
                    <p>Created: {invoice.createdAt ? new Date(invoice.createdAt).toLocaleString() : 'Unknown'}</p>
                    <p>Updated: {invoice.updatedAt ? new Date(invoice.updatedAt).toLocaleString() : 'Unknown'}</p>
                </div>
            ) : (
                <p className="text-gray-400">Invoice not found.</p>
            )}
        </section>
    );
}
