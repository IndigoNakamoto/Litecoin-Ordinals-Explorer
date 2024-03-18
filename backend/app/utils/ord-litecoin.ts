// backend/app/utils/ord-litecoin.ts

import fetch from 'isomorphic-fetch';
import BitcoinJsonRpc from 'bitcoin-json-rpc';
import mempoolJS from '@mempool/mempool.js';


const ORD_LITECOIN_URL = process.env.ORD_LITECOIN_URL || 'http://0.0.0.0:8080';

async function getBlockInscriptionsPage(blockNumber: number, pageNumber: number) {
    const url = `${ORD_LITECOIN_URL}/inscriptions/block/${blockNumber}/${pageNumber}`;

    try {
        const response = await fetch(url, { headers: { 'Accept': 'application/json' } });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

async function getInscriptionData(inscriptionId: string) {
    const url = `${ORD_LITECOIN_URL}/inscription/${inscriptionId}`;
    try {
        const response = await fetch(url, { headers: { 'Accept': 'application/json' } });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

async function getInscriptionContent(inscriptionId: string, contentType: string) {
    const url = `${ORD_LITECOIN_URL}/content/${inscriptionId}`;

    // Set the Accept header dynamically based on the known content type
    const headers = { 'Accept': contentType };

    try {
        const response = await fetch(url, { headers });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Process the response based on the content type
        let data;
        if (contentType.includes('application/json')) {
            data = await response.json();
        } else if (contentType.includes('text')) {
            data = await response.text();
        } else if (contentType.includes('image') || contentType.includes('application/octet-stream')) {
            // For binary data like images or other files
            data = await response.blob();
        } else {
            // Add more conditions as needed for other content types
            console.error('Unhandled content type:', contentType);
            throw new Error('Unhandled content type');
        }

        return data; 
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}




async function getBlockHeight(): Promise<number>  {
    let blockHeight;
    
    try {
      const rpcUser = 'your_rpc_username'; // Replace with your actual RPC username
      const rpcPassword = 'your_rpc_password'; // Replace with your actual RPC password
      const rpcHost = 'localhost';
      const rpcPort = 9332; // Default Litecoin RPC port
      const rpc = new BitcoinJsonRpc(`http://${rpcUser}:${rpcPassword}@${rpcHost}:${rpcPort}`);
      
      blockHeight = await rpc.getBlockCount();
    } catch (rpcError) {
      console.error("Error fetching block height via RPC:", rpcError);
      
      try {
        const { bitcoin } = mempoolJS({
          hostname: 'litecoinspace.org',
          network: 'mainnet', // 'signet' | 'testnet' | 'mainnet',
        });
  
        // Assuming blocks.getBlockHeight() method exists and works as expected.
        // This part might need adjustment based on the actual API of mempoolJS you're using.
        const mempoolBlockHeight = await bitcoin.blocks.getBlockHeight({ height: 0 });
        blockHeight = mempoolBlockHeight;
      } catch (mempoolError) {
        console.error("Error fetching block height via mempoolJS:", mempoolError);
        throw new Error("Failed to fetch block height from both RPC and mempoolJS");
      }
    }
  
    return Number(blockHeight);
  }







export { getBlockInscriptionsPage, getInscriptionData, getBlockHeight, getInscriptionContent };
