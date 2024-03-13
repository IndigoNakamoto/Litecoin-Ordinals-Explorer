import Inscription from '../models/Inscription';
import InscriptionsUpdateProgress from '../models/InscriptionsUpdateProgress';
import { getBlockHeight, getInscriptionData, getBlockInscriptionsPage } from '../utils/ord-litecoin';

// services/InscriptionUpdateService.ts


export default async function updateInscriptionTable() {
    try {
        // Fetch the current block height
        const currentBlockHeight = await getBlockHeight();
        console.log(currentBlockHeight)

        // Get the last processed block and page from the InscriptionsUpdateProgress table
        const progress = await InscriptionsUpdateProgress.findOne();

        let blockNumber = progress ? progress.last_processed_block : 2425366;
        let pageNumber = progress ? progress.last_processed_page : 0;

        // Iterate until all inscriptions are fetched
        while (blockNumber <= currentBlockHeight) {
            // Get list of inscriptions from the page
            const { inscriptions, more } = await getBlockInscriptionsPage(blockNumber, pageNumber);

            const result: any[] = [];
            for (const inscription of inscriptions) {
                try {
                    const data = await getInscriptionData(inscription);
                    let content_type_type = data.content_type.split('/')[0];
                    const modifiedData = {
                        content_length: data.content_length,
                        content_type: data.content_type,
                        content_type_type: content_type_type,
                        genesis_fee: data.genesis_fee,
                        genesis_height: data.genesis_height,
                        inscription_number: data.inscription_number,
                        inscription_id: data.inscription_id,
                    };
                    result.push(modifiedData);
                    // console.log('INSCRIPTION: ', data.inscription_number);
                    
                } catch (error) {
                    console.error(`Error fetching inscription ${inscription}:`, error);
                }

            }

            // Batch insert the modified inscriptions into the Inscription table
            await Inscription.bulkCreate(result);

            console.log('blockNumber:', blockNumber);
            // console.log('pageNumber:', pageNumber);

            // Update the InscriptionsUpdateProgress table with the last processed block and page
            await InscriptionsUpdateProgress.upsert({
                progress_key: 'inscriptions_progress',
                last_processed_block: blockNumber,
                last_processed_page: pageNumber
            });

            // If there are more inscriptions for the current block, move to the next page
            if (more) {
                pageNumber++;
            } else {
                // If there are no more inscriptions for the current block, move to the next block and reset the page number
                blockNumber++;
                pageNumber = 0;
            }
        }
    } catch (error) {
        console.error('Error updating inscription table:', error);
    }
}

// Initial call to updateInscriptionTable
updateInscriptionTable();

// Poll the updateInscriptionTable function every 30 seconds
setInterval(updateInscriptionTable, 30 * 1000);
