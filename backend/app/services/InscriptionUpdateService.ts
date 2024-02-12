import { getBlockHeight, getInscriptionData, getBlockInscriptionsPage } from '../utils/ord-litecoin';
import InscriptionsUpdateProgress from '../models/InscriptionsUpdateProgress';
import Inscription from '../models/Inscription'; // Import the Inscription model

let shutdownRequested = false;
let isUpdating = false; // Initialize the updating flag to false


async function getLastProcessedBlock(): Promise<number> {
    try {
        const progress = await InscriptionsUpdateProgress.findOne({ where: { progress_key: 'inscriptions_progress' } });
        return progress ? progress.last_processed_block : 2424000; // Default to 2424000 or an appropriate starting block
    } catch (error) {
        console.error('Error fetching last processed block:', error);
        throw error;
    }
}

async function updateLastProcessedBlock(blockNumber: number, pageNumber: number): Promise<void> {
    
    try {
        await InscriptionsUpdateProgress.upsert({
            progress_key: 'inscriptions_progress',
            last_processed_block: blockNumber,
            last_processed_page: pageNumber
        });
        console.log(`Updated progress to block ${blockNumber}, page ${pageNumber}`);
    } catch (error) {
        console.error('Error updating last processed block and page:', error);
        throw error;
    }
}

export default async function updateInscriptions(): Promise<void> {
    if (isUpdating) return; // Early return if an update is already in progress
    isUpdating = true; // Set the flag to indicate an update has started

    try {
        const now = new Date().toLocaleString()
        console.log(now, ' - Checking for new inscriptions.');
        
        const lastProcessedBlock = await getLastProcessedBlock();
        const currentHeight = await getBlockHeight();
        const CONFIRMATIONS_REQUIRED = 0;
        const safeHeight = currentHeight - CONFIRMATIONS_REQUIRED;

        for (let blockNumber = lastProcessedBlock + 1; blockNumber <= safeHeight && !shutdownRequested; blockNumber++) {
            let pageNumber = 0;
            let more = true;

            while (more && !shutdownRequested) {
                const { inscriptions, more: morePages } = await getBlockInscriptionsPage(blockNumber, pageNumber);
                const inscriptionsData: Array<any> = [];

                for (const inscriptionId of inscriptions) {
                    try {
                        const inscriptionData = await getInscriptionData(inscriptionId);
                        const { content_length, content_type, genesis_fee, genesis_height, inscription_number, next, output_value, parent, previous, rune, sat, satpoint, timestamp, charms, children } = inscriptionData;
                        const content_type_type = content_type.split('/')[0]; // Extract the "type" from "type/subtype"
                        const timestampIso = new Date(parseInt(timestamp) * 1000).toISOString();
                        const modifiedData = {
                            content_length,
                            content_type,
                            content_type_type,
                            genesis_fee,
                            genesis_height,
                            inscription_number,
                            inscription_id: inscriptionId,
                            nsfw: false, // Assuming nsfw is always false
                        };
                        inscriptionsData.push(modifiedData);
                    } catch (error) {
                        console.error(`Error fetching inscription ${inscriptionId}:`, error);
                    }
                }

                if (inscriptionsData.length > 0) {
                    await Inscription.bulkCreate(inscriptionsData, { ignoreDuplicates: true });
                }
                console.log(`# of inscriptions: ${inscriptionsData.length}`)
                // console.log(`Block: ${blockNumber} - Page: ${pageNumber}`);

                more = morePages;
                pageNumber++;
            }

            await updateLastProcessedBlock(blockNumber, pageNumber - 1);

            if (shutdownRequested) {
                console.log('Shutdown requested, finishing up...');
                break;
            }
        }
    } catch (error) {
        console.error('Error updating inscriptions:', error);
        throw error;
    } finally {
        isUpdating = false; // Set the flag to indicate the update has finished
    }
}

let iterationCounter = 0; // Initialize the counte

function checkForNewBlockAndUpdateViews() {
    if (isUpdating) return; // Check if an update is already in progress

    iterationCounter++;
    let currentTime = new Date();
    console.log(`\n Iteration ${iterationCounter} at ${currentTime.toISOString()}`);
    updateInscriptions().catch(error => console.error('Error in update process:', error));
}

const REFRESH_INTERVAL = 30000; // 30 seconds in milliseconds

let intervalId = setInterval(checkForNewBlockAndUpdateViews, REFRESH_INTERVAL); // Store interval ID

process.on('SIGINT', () => {
    console.log('Shutdown signal received. Stopping gracefully...');
    shutdownRequested = true;
    clearInterval(intervalId); // Clear the interval to prevent new iterations
    // Optionally, add logic here to wait for ongoing updateInscriptions to finish
});

process.on('SIGTERM', () => {
    console.log('Shutdown signal received. Stopping gracefully...');
    shutdownRequested = true;
    clearInterval(intervalId); // Clear the interval
    // Optionally, add logic here to wait for ongoing updateInscriptions to finish
});

// setInterval(checkForNewBlockAndUpdateViews, REFRESH_INTERVAL);

// checkForNewBlockAndUpdateViews();
updateInscriptions().catch(error => console.error('Error in update process:', error));