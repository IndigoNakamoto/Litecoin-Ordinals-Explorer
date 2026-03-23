'use client'

import React, { useEffect, useState } from "react";
import InvoiceModal from "./InvoiceModal";

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Typography,
} from "@material-tailwind/react";

import {
  INVOICE_HISTORY_EVENT,
  type StoredInvoiceSummary,
  getStoredInvoiceHistory,
} from "../lib/invoiceHistory";

function InvoiceHistory() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentInvoiceId, setCurrentInvoiceId] = useState('');
  const [rows, setRows] = useState<StoredInvoiceSummary[]>([]);

  useEffect(() => {
    const syncRows = () => {
      setRows(getStoredInvoiceHistory());
    };

    syncRows();
    window.addEventListener(INVOICE_HISTORY_EVENT, syncRows);
    window.addEventListener('storage', syncRows);

    return () => {
      window.removeEventListener(INVOICE_HISTORY_EVENT, syncRows);
      window.removeEventListener('storage', syncRows);
    };
  }, []);

  const openModal = (invoiceId: string) => {
    setCurrentInvoiceId(invoiceId);
    setIsModalOpen(true);
  };

  return (
    <section className="my-10">
      <Card className="h-full w-full" placeholder={undefined}>
        <CardHeader
          placeholder={undefined}
          floated={false}
          shadow={false}
          className="rounded-none flex flex-wrap gap-4 justify-between p-3"
        >
          <div>
            <Typography variant="h6" color="blue-gray" placeholder={undefined}>
              Inscription History
            </Typography>
            <Typography
              variant="small"
              className="mt-1 font-normal text-gray-600"
              placeholder={undefined}
            >
              Recent invoices created from this browser session.
            </Typography>
          </div>
        </CardHeader>
        <CardBody className="overflow-scroll !px-0 py-0" placeholder={undefined}>
          {rows.length === 0 ? (
            <div className="p-6 text-sm text-gray-500">
              No invoices yet. Upload a file to create your first inscription invoice.
            </div>
          ) : (
            <table className="w-full min-w-max table-auto">
              <thead>
                <tr>
                  <th className="border-b border-gray-300 !p-4 text-left">Date</th>
                  <th className="border-b border-gray-300 !p-4 text-left">File</th>
                  <th className="border-b border-gray-300 !p-4 text-left">Status</th>
                  <th className="border-b border-gray-300 !p-4 text-left">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.invoiceId}>
                    <td className="border-b border-gray-300 !p-4 text-sm text-gray-600">
                      {new Date(row.createdAt).toLocaleString()}
                    </td>
                    <td className="border-b border-gray-300 !p-4 text-sm text-gray-700">
                      {row.fileName}
                    </td>
                    <td className="border-b border-gray-300 !p-4 text-sm text-gray-700">
                      {row.status}
                    </td>
                    <td className="border-b border-gray-300 !p-4">
                      <Button
                        variant="text"
                        size="sm"
                        onClick={() => openModal(row.invoiceId)}
                        placeholder={undefined}
                      >
                        View Invoice
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
      <InvoiceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} invoiceId={currentInvoiceId} />
    </section>
  );
}

export default InvoiceHistory;
