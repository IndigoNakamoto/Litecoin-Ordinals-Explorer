//util/ord-litecoin.ts

import fetch from 'isomorphic-fetch';
import BitcoinJsonRpc from 'bitcoin-json-rpc';

async function getBlockInscriptionsPage(blockNumber: number, pageNumber: number) {
    const url = `http://0.0.0.0:80/inscriptions/block/${blockNumber}/${pageNumber}`;

    try {
        const response = await fetch(url, { headers: { 'Accept': 'application/json' } });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(`block: ${blockNumber} page: ${pageNumber}`);
        return data;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

async function getBlockHeight() { 
  const rpcUser = 'your_rpc_username'; // Replace with your actual RPC username
  const rpcPassword = 'your_rpc_password'; // Replace with your actual RPC password
  const rpcHost = 'localhost';
  const rpcPort = 9332; // Default Litecoin RPC port
  const rpc = new BitcoinJsonRpc(`http://${rpcUser}:${rpcPassword}@${rpcHost}:${rpcPort}`);
  const blockHeight = await rpc.getBlockCount();
  return blockHeight;
}


async function getInscriptionData(inscriptionId: string) {
    const url = `http://0.0.0.0:80/inscription/${inscriptionId}`;
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

export { getBlockInscriptionsPage, getInscriptionData, getBlockHeight };
