// Assuming a JavaScript context, if TypeScript, ensure the environment is correctly set up for TS execution.
import { exec } from 'child_process';
import { promisify } from 'util';
import { promises as fsPromises } from 'fs';
import fs from 'fs'; // Use if needed, or consider fsPromises for promise-based operations.
import path from 'path'; // Use if needed for handling paths.
import axios from 'axios'; // Ensure axios is installed via npm or yarn.
import yaml from 'js-yaml'; // Ensure js-yaml is installed via npm or yarn.

const execAsync = promisify(exec);

class TaskQueue {
    queue: (() => Promise<any>)[] = [];
    isProcessing = false;

    constructor() {
        this.queue = [];
        this.isProcessing = false;
    }

    enqueue<T>(task: () => Promise<T>): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            this.queue.push(() => task().then(resolve).catch(reject));

            console.log('Queue Length: ', this.queue.length)
            if (!this.isProcessing) {
                this.processQueue().catch(error => console.error('Error processing queue:', error));
            }
        });
    }

    async processQueue() {
        if (this.queue.length === 0) {
            this.isProcessing = false;
            return;
        }
        this.isProcessing = true;
        const currentTask = this.queue.shift();
        if (currentTask) {
            try {
                await currentTask();
            } catch (error) {
                console.error('Error executing task:', error);
            }
        }
        await this.processQueue();
    }
}


class OrdService {
    rpcPassword = 'your_rpc_password';
    rpcUser = 'your_rpc_username';
    taskQueue = new TaskQueue();

    constructor(private ordPath = '/Users/indigo/dev/ord-litecoin-0.15/target/release') { }

    public getQueuedFilesInfo(): { queued: boolean; count: number; files: any[] } {
        const queued = this.taskQueue.queue.length > 0;
        const count = this.taskQueue.queue.length;
        const files = this.taskQueue.queue.map(task => task()); // Assuming each task returns a Promise with file info

        return { queued, count, files };
    }

    public async updateIndex() {
        try {
            // Execute the inscription command
            const { stdout, stderr } = await execAsync(`${this.ordPath}/ord --bitcoin-rpc-user ${this.rpcUser} --bitcoin-rpc-pass ${this.rpcPassword} --data-dir "/Users/indigo/Library/Application Support/ord2" index update`);

            if (stderr && stderr.trim() !== '') {
                console.error('Error updating index:', stderr);
                throw new Error(stderr);
            }

            console.log('Update Index - Response: ', stdout)
            return { stdout };
        } catch (error) {
            console.error('Error committing file:', error);
        } 
    }

    public inscribeFilesForInvoice(invoiceId: string) {
        return this.taskQueue.enqueue(async () => {

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
                        const response = await this.commitFile(file, invoiceResponse); // Assuming commitFile is properly defined elsewhere
                        filesInscribed.push({ ...file, inscribeStatus: 'Committed', inscription: JSON.parse(response!.stdout) });
                    } catch (error) {
                        errorFlag = true;
                        console.error('Error inscribing file:', error);
                        filesInscribed.push({ ...file, inscribeStatus: 'Error' });
                    }
                }

                console.log('Files commited:', filesInscribed);

                // Now, directly replace the files within invoice metadata with filesInscribed
                invoiceData.metadata.files = filesInscribed;

                let inscribeStatus = 'Committed'; // Update the status of the invoice
                let status = 'Committed'; // Update the status of the invoice
                if (errorFlag) {
                    inscribeStatus = 'Error'; // Update the status of the invoice
                    status = 'Error'; // Update the status of the invoice
                }

                // Finally, update the invoice with the modified metadata
                await axios.put(`https://payment.ordlite.com/api/v1/stores/${storeId}/invoices/${invoiceData.id}`, {
                    metadata: { ...invoiceData.metadata, inscribeStatus, status } // This now includes the updated files
                }, {
                    headers: { 'Authorization': auth }
                });

            } catch (error) {
                console.error('Error processing files for invoice:', error);
            }

        });
    }

    private async commitFile(file: any, invoice: any): Promise<{ stdout: string; file: any; } | undefined> {
        try {
            console.log('Committing file: ', file)
            // Placeholder for generating YAML file or any other preparation needed
            const yamlFilePath = await this.prepareInscriptionFile(file, invoice);

            // Execute the inscription command
            const { stdout, stderr } = await execAsync(`${this.ordPath}/ord --bitcoin-rpc-user ${this.rpcUser} --bitcoin-rpc-pass ${this.rpcPassword} --data-dir "/Users/indigo/Library/Application Support/ord2" wallet inscribe --fee-rate 2.5 --batch ${yamlFilePath}`);


            // When inscribe command is successful, stdout should contain the inscription transaction details
            if (stderr && stderr.trim() !== '') {
                console.error('Error committing file:', stderr);
                throw new Error(stderr);
            }

            console.log('Committed file - Response: ', stdout)
            return { stdout, file };
        } catch (error) {
            console.error('Error committing file:', error);
        }
    }


    private async prepareInscriptionFile(file: any, invoice: any): Promise<string> {
        // Define the YAML content structure
        const absoluteFilePath = path.resolve(__dirname, '..', file.location);
        const yamlContent = {
            mode: 'separate-outputs',
            parent: null,
            postage: 10000,
            inscriptions: [{
                file: file.location,
                destination: invoice.data.metadata.receivingAddress
            }]
        };

        // Convert the JS object to a YAML string
        const yamlStr = yaml.dump(yamlContent);

        // Define a path for the YAML file
        const yamlDir = path.join(__dirname, 'yaml');
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

    public generateAddresses(count: number): Promise<string[]> {
        console.log('Ord Service Generate addresses')
        return this.taskQueue.enqueue(async () => {
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
        });
    }

    public getWalletBalance() {
        return this.taskQueue.enqueue(async () => {
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
        });
    }

    // Other methods remain unchanged or are adjusted to fit within the queuing system.
}

async function writeFileAsync(filePath: string, data: any, encoding: BufferEncoding = 'utf8') {
    try {
        await fsPromises.writeFile(filePath, data, { encoding });
    } catch (error) {
        console.error('Error writing file:', error);
        throw error; // Rethrowing the error to handle it in the calling function
    }
}


// Export and usage of OrdService remain unchanged.
export default OrdService;
