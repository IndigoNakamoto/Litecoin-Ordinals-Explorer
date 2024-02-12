// backend/src/inscribe.ts
class InscribingManager {
    private inscriptions: string[];

    checkUploadFolderForInscriptions(): void {
        // get list of inscriptions from upload folder
        // add them to inscriptions
    }

    addInscription(inscription: string): void {
        this.inscriptions.push(inscription);
    }

    removeInscription(inscription: string): void {
        const index = this.inscriptions.indexOf(inscription);
        if (index !== -1) {
            this.inscriptions.splice(index, 1);
        }
    }

    getInscriptions(): string[] {
        return this.inscriptions;
    }
}

// polls btcpay server for new invoices
class InvoiceManager {
    private invoices: string[];

    checkForNewInvoices(): void {
        // get list of invoices from btcpay server
        // add them to invoices
    }

    updateInvoiceStatus(invoice: string): void {
    }

    updateInvoiceFileStatus(invoice: string, file: string, status: string): void {
    }

    getInvoices(): string[] {
        return this.invoices;
    }
}