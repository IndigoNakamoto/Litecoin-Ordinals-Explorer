import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import yaml from 'js-yaml';
import { promises as fsPromises } from 'fs';
const execAsync = promisify(exec);

/* 
Refactor implementation:

Execution to /ord must be syncronous. Implement a queue system to ensure only 1 request at a time. 

We can only run inscribeFilesForInvoice, generateAddress or getWalletBalance or any of the functions 1 at a time to /ord
*/


class LitecoinInscriptionService {
    rpcPassword: string = 'your_rpc_password';
    rpcUser: string = 'your_rpc_username';
    constructor(private ordPath: string = '/Users/indigo/dev/ord-litecoin-0.15/target/release') { }

    public async inscribeFilesForInvoice(invoiceId: string): Promise<void> {
        try {
            const BTCPAY_USERNAME = 'ordlite@gmail.com';
            const BTCPAY_PASSWORD = '$had0wTaxih';
            const storeId = 'AN4wugzAGGN56gHFjL1sjKazs89zfLouiLoeTw9R7Maf';
            const base64Credentials = Buffer.from(`${BTCPAY_USERNAME}:${BTCPAY_PASSWORD}`).toString('base64');

            const auth = `Basic ${base64Credentials}`;
            const invoiceResponse = await axios.get(`https://payment.ordlite.com/api/v1/stores/${storeId}/invoices/${invoiceId}`, {
                headers: { 'Authorization': auth },
            });

            if (!invoiceResponse) {
                console.error(`Invoice ${invoiceId} not found.`);
                return;
            }

            const invoiceData = invoiceResponse.data;
            const files = invoiceData.metadata.files;
            let errorFlag = false;

            const filesInscribed = [];

            for (let file of files) {
                try {
                    const response = await this.inscribeFile(file, invoiceResponse); // Assuming inscribeFile is properly defined elsewhere
                    filesInscribed.push({ ...file, inscribeStatus: 'Inscribed', inscription: JSON.parse(response!.stdout) });
                } catch (error) {
                    errorFlag = true;
                    console.error('Error inscribing file:', error);
                    filesInscribed.push({ ...file, inscribeStatus: 'Error' });
                }
            }

            console.log('Files inscribed:', filesInscribed);

            // Now, directly replace the files within invoice metadata with filesInscribed
            invoiceData.metadata.files = filesInscribed;
            if (!errorFlag) {
                invoiceData.metadata.inscribeStatus = 'Inscribed'; // Update the status of the invoice
                invoiceData.metadata.status = 'Inscribed'; // Update the status of the invoice
            } else if(errorFlag) {
                invoiceData.metadata.inscribeStatus = 'Error'; // Update the status of the invoice
                invoiceData.metadata.status = 'Error'; // Update the status of the invoice
            }

            // Finally, update the invoice with the modified metadata
            await axios.put(`https://payment.ordlite.com/api/v1/stores/${storeId}/invoices/${invoiceData.id}`, {
                metadata: invoiceData.metadata // This now includes the updated files
            }, {
                headers: { 'Authorization': auth }
            });

        } catch (error) {
            console.error('Error inscribing files for invoice:', error);
        }
    }

    private async inscribeFile(file: any, invoice: any): Promise<{ stdout: string; file: any; } | undefined> {
        try {
            console.log('Inscribing file: ', file)
            // Placeholder for generating YAML file or any other preparation needed
            const yamlFilePath = await this.prepareInscriptionFile(file, invoice);
            
            // Execute the inscription command
            const { stdout, stderr } = await execAsync(`${this.ordPath}/ord --bitcoin-rpc-user ${this.rpcUser} --bitcoin-rpc-pass ${this.rpcPassword} --data-dir "/Users/indigo/Library/Application Support/ord2" wallet inscribe --fee-rate 1.2 --batch ${yamlFilePath}`);


            // When inscribe command is successful, stdout should contain the inscription transaction details
            if (stderr && stderr.trim() !== '') {
                console.error('Error during inscription:', stderr);
                throw new Error(stderr);
            }

            console.log('Success inscribing file - Response: ', stdout)
            return { stdout, file };
        } catch (error) {
            console.error('Error inscribing file:', error);
        }
    }


    private async prepareInscriptionFile(file: any, invoice: any): Promise<string> {
        // Define the YAML content structure
        const absoluteFilePath = path.resolve(__dirname, '..', file.location);
        const yamlContent = {
            mode: 'separate-outputs',
            parent: null,
            postage: 10000, // Assuming a static value here, adjust as necessary
            inscriptions: [{
                file: file.location, // This returns "  - file: uploads/files-Litecoin-King-Kong-1711726224222.mp4 ", should it be "file: /Volumes/SanDisk/ordlite.io/backend/uploads/files-Litecoin-King-Kong-1711726224222.mp4"?
                destination: invoice.data.metadata.receivingAddress
            }]
        };

        // Convert the JS object to a YAML string
        const yamlStr = yaml.dump(yamlContent);

        // Define a path for the YAML file
        const yamlDir = path.join(__dirname, 'yaml'); // __dirname is the current directory of this file
        // Ensure the directory exists
        if (!fs.existsSync(yamlDir)) {
            fs.mkdirSync(yamlDir, { recursive: true });
        }

        const yamlFilePath = path.join(yamlDir, `inscription-${Date.now()}.yaml`);

        // Write the YAML string to a file
        await writeFileAsync(yamlFilePath, yamlStr, 'utf8');

        // Return the file path of the newly created YAML file
        return yamlFilePath;
    }

    public async generateAddresses(count: number): Promise<string[]> {
        let addresses: string[] = [];

        for (let i = 0; i < count; i++) {
            try {
                const { stdout, stderr } = await execAsync(`${this.ordPath}/ord --bitcoin-rpc-user ${this.rpcUser} --bitcoin-rpc-pass ${this.rpcPassword} --data-dir "/Users/indigo/Library/Application Support/ord2" wallet receive`);
                if (stderr) {
                    console.error('Error generating address:', stderr);
                    continue; // Skip this iteration and try the next one
                }

                const result = JSON.parse(stdout);
                if (result.address) {
                    addresses.push(result.address);
                } else {
                    console.error('No address found in response:', stdout);
                }
            } catch (error) {
                console.error('Exception generating address:', error);
            }
        }

        return addresses;
    }

    public async getWalletBalance(): Promise<{ cardinal: number; ordinal: number; total: number }> {
        try {
            const { stdout, stderr } = await execAsync(`${this.ordPath}/ord --bitcoin-rpc-user ${this.rpcUser} --bitcoin-rpc-pass ${this.rpcPassword} --data-dir "/Users/indigo/Library/Application Support/ord2" wallet balance`);
            if (stderr) {
                console.error('Error getting wallet balance:', stderr);
                throw new Error('Failed to get wallet balance');
            }

            const result = JSON.parse(stdout);
            return {
                cardinal: result.cardinal,
                ordinal: result.ordinal,
                total: result.total
            };
        } catch (error) {
            console.error('Exception getting wallet balance:', error);
            throw error; // Rethrow the error to handle it further up the call stack
        }
    }
}

async function writeFileAsync(filePath: string, data: any, encoding: BufferEncoding = 'utf8') {
    try {
        await fsPromises.writeFile(filePath, data, { encoding });
    } catch (error) {
        console.error('Error writing file:', error);
        throw error; // Rethrowing the error to handle it in the calling function
    }
}

export default LitecoinInscriptionService;

// const litecoinInscriptionService = new LitecoinInscriptionService();
// litecoinInscriptionService.inscribeFilesForInvoice('JVRReCCppEAPr1iWvPcs73').then(() => {
//   console.log('Inscription process completed successfully.');
// }).catch((error) => {
//   console.error('Inscription process failed:', error);
// });
