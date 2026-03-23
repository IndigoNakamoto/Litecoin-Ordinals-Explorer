export interface StoredInvoiceSummary {
  invoiceId: string;
  fileName: string;
  createdAt: string;
  status: string;
}

export const INVOICE_HISTORY_KEY = 'invoiceHistory';
export const INVOICE_HISTORY_EVENT = 'ordlite-invoice-history-change';

export const getStoredInvoiceHistory = (): StoredInvoiceSummary[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  const raw = localStorage.getItem(INVOICE_HISTORY_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredInvoiceSummary[]) : [];
  } catch (error) {
    console.error('Failed to parse invoice history:', error);
    return [];
  }
};

export const appendStoredInvoiceHistory = (invoice: StoredInvoiceSummary) => {
  if (typeof window === 'undefined') {
    return;
  }

  const next = [invoice, ...getStoredInvoiceHistory()].slice(0, 20);
  localStorage.setItem(INVOICE_HISTORY_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(INVOICE_HISTORY_EVENT));
};
