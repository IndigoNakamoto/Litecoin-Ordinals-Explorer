// backend/src/inscribe.ts
class InscribingManager {
    private inscriptions: string[];

    checkUploadFolderForInscriptions(): void {
        // get list of files in backend/uploads
        // add them to inscriptions
        // 1 file gets inscribed per yaml file
        // We will have to get the list of files to inscribe from the invoice. 
        // If an invoice expired, then we will have to remove the files from the inscriptions list and upload folder.
        // After we have the list of files to inscribe, we will have to check the upload folder for the files and add them to the inscriptions list.
        // after the file has been inscribed and we get an inscription id, we can delete the file from the upload folder.
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