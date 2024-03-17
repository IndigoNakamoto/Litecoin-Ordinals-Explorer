import { getBlockHeight, getInscriptionData, getBlockInscriptionsPage } from '../utils/ord-litecoin';
import InscriptionsUpdateProgress from '../models/InscriptionsUpdateProgress';
import Inscription from '../models/Inscription'; // Import the Inscription model

let shutdownRequested = false;

process.on('SIGINT', () => {
    console.log('Shutdown signal received. Stopping gracefully...');
    shutdownRequested = true;
});

process.on('SIGTERM', () => {
    console.log('Shutdown signal received. Stopping gracefully...');
    shutdownRequested = true;
});

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
}

async function startUpdateProcess(): Promise<void> {
    try {
        await updateInscriptions();
    } catch (error) {
        console.error('Error in update process:', error);
    }
}

// startUpdateProcess();

let iterationCounter = 0; // Initialize the counte

function checkForNewBlockAndUpdateViews() {
    iterationCounter++; // Increment the counter each time the function is called
    let currentTime = new Date(); // Get the current time
    console.log(`\n Iteration ${iterationCounter} at ${currentTime.toISOString()}: Checking for new block and updating views.`);
    updateInscriptions().catch(error => console.error('Error in update process:', error));
}

const REFRESH_INTERVAL = 30000; // 30 seconds in milliseconds


setInterval(checkForNewBlockAndUpdateViews, REFRESH_INTERVAL);

checkForNewBlockAndUpdateViews();




// import Inscription from '../models/Inscription';
// import InscriptionsUpdateProgress from '../models/InscriptionsUpdateProgress';
// import { getBlockHeight, getInscriptionData, getBlockInscriptionsPage } from '../utils/ord-litecoin';

// let intervalId: NodeJS.Timeout;

// async function updateInscriptionTable() {
//     try {
//         // Fetch the current block height
//         const currentBlockHeight = await getBlockHeight();
//         console.log(currentBlockHeight);

//         // Get the last processed block and page from the InscriptionsUpdateProgress table
//         let progress = await InscriptionsUpdateProgress.findOne();
//         if (!progress) {
//             progress = await InscriptionsUpdateProgress.create({
//                 progress_key: 'inscriptions_progress',
//                 last_processed_block: 2425366, // Default value
//                 last_processed_page: 0, // Default value
//             });
//         }

//         // let blockNumber = progress ? progress.last_processed_block : 2425366;
//         // let pageNumber = progress ? progress.last_processed_page : 0;
//         let blockNumber = progress!.last_processed_block
//         let pageNumber = progress!.last_processed_page

//         // Iterate until all inscriptions are fetched
//         while (blockNumber <= currentBlockHeight) {
//             // Get list of inscriptions from the page
//             const { inscriptions, more } = await getBlockInscriptionsPage(blockNumber, pageNumber);

//             const result: Array<{
//                 content_length: number;
//                 content_type: string;
//                 content_type_type: string;
//                 genesis_fee: number;
//                 genesis_height: number;
//                 inscription_number: number;
//                 inscription_id: string;
//             }> = [];

//             for (const inscription of inscriptions) {
//                 try {
//                     const data = await getInscriptionData(inscription);
//                     const content_type_type = data.content_type.split('/')[0];
//                     const modifiedData = {
//                         content_length: data.content_length,
//                         content_type: data.content_type,
//                         content_type_type,
//                         genesis_fee: data.genesis_fee,
//                         genesis_height: data.genesis_height,
//                         inscription_number: data.inscription_number,
//                         inscription_id: data.inscription_id,
//                     };
    
//                     // Check if the inscription_id and content_type_type combination already exists
//                     const existingInscription = await Inscription.findOne({
//                         where: {
//                             inscription_id: modifiedData.inscription_id,
//                             content_type_type: modifiedData.content_type_type,
//                         },
//                     });
    
//                     if (!existingInscription) {
//                         // Insert the modified inscription into the Inscription table
//                         await Inscription.create(modifiedData);
//                     } else {
//                         // Update the existing inscription
//                         await existingInscription.update(modifiedData);
//                     }
    
//                 } catch (error) {
//                     console.error(`Error fetching inscription ${inscription}:`, error);
//                 }
//             }

//             // Batch insert the modified inscriptions into the Inscription table
//             await Inscription.bulkCreate(result);

//             console.log('blockNumber:', blockNumber);
//             // console.log('pageNumber:', pageNumber);

//             // Update the InscriptionsUpdateProgress table with the last processed block and page
//             await InscriptionsUpdateProgress.upsert({
//                 progress_key: 'inscriptions_progress',
//                 last_processed_block: blockNumber,
//                 last_processed_page: pageNumber
//             });

//             // If there are more inscriptions for the current block, move to the next page
//             if (more) {
//                 pageNumber++;
//             } else {
//                 // If there are no more inscriptions for the current block, move to the next block and reset the page number
//                 blockNumber++;
//                 pageNumber = 0;
//             }
//         }
//     } catch (error) {
//         console.error('Error updating inscription table:', error);
//     }
// }

// function startUpdateInterval() {
//     intervalId = setInterval(updateInscriptionTable, 30 * 1000);
// }

// function stopUpdateInterval() {
//     clearInterval(intervalId);
// }

// // Initial call to updateInscriptionTable
// updateInscriptionTable();

// // Poll the updateInscriptionTable function every 30 seconds
// startUpdateInterval();

// // Handle shutdown signals
// process.on('SIGINT', () => {
//     console.log('Received SIGINT. Stopping gracefully...');
//     stopUpdateInterval();
//     // You might want to add some cleanup code here if necessary
//     process.exit(0);
// });

// process.on('SIGTERM', () => {
//     console.log('Received SIGTERM. Stopping gracefully...');
//     stopUpdateInterval();
//     // You might want to add some cleanup code here if necessary
//     process.exit(0);
// });



















// import Inscription from '../models/Inscription';
// import InscriptionsUpdateProgress from '../models/InscriptionsUpdateProgress';
// import { getBlockHeight, getInscriptionData, getBlockInscriptionsPage } from '../utils/ord-litecoin';

// // services/InscriptionUpdateService.ts


// export default async function updateInscriptionTable() {
//     try {
//         // Fetch the current block height
//         const currentBlockHeight = await getBlockHeight();
//         console.log(currentBlockHeight)

//         // Get the last processed block and page from the InscriptionsUpdateProgress table
//         const progress = await InscriptionsUpdateProgress.findOne();

//         let blockNumber = progress ? progress.last_processed_block : 2425366;
//         let pageNumber = progress ? progress.last_processed_page : 0;

//         // Iterate until all inscriptions are fetched
//         while (blockNumber <= currentBlockHeight) {
//             // Get list of inscriptions from the page
//             const { inscriptions, more } = await getBlockInscriptionsPage(blockNumber, pageNumber);

//             const result: any[] = [];
//             for (const inscription of inscriptions) {
//                 try {
//                     const data = await getInscriptionData(inscription);
//                     let content_type_type = data.content_type.split('/')[0];
//                     const modifiedData = {
//                         content_length: data.content_length,
//                         content_type: data.content_type,
//                         content_type_type: content_type_type,
//                         genesis_fee: data.genesis_fee,
//                         genesis_height: data.genesis_height,
//                         inscription_number: data.inscription_number,
//                         inscription_id: data.inscription_id,
//                     };
//                     result.push(modifiedData);
//                     // console.log('INSCRIPTION: ', data.inscription_number);
                    
//                 } catch (error) {
//                     console.error(`Error fetching inscription ${inscription}:`, error);
//                 }

//             }

//             // Batch insert the modified inscriptions into the Inscription table
//             await Inscription.bulkCreate(result);

//             console.log('blockNumber:', blockNumber);
//             // console.log('pageNumber:', pageNumber);

//             // Update the InscriptionsUpdateProgress table with the last processed block and page
//             await InscriptionsUpdateProgress.upsert({
//                 progress_key: 'inscriptions_progress',
//                 last_processed_block: blockNumber,
//                 last_processed_page: pageNumber
//             });

//             // If there are more inscriptions for the current block, move to the next page
//             if (more) {
//                 pageNumber++;
//             } else {
//                 // If there are no more inscriptions for the current block, move to the next block and reset the page number
//                 blockNumber++;
//                 pageNumber = 0;
//             }
//         }
//     } catch (error) {
//         console.error('Error updating inscription table:', error);
//     }
// }

// // Initial call to updateInscriptionTable
// updateInscriptionTable();

// // Poll the updateInscriptionTable function every 30 seconds
// setInterval(updateInscriptionTable, 30 * 1000);
