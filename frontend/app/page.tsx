/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import React, { useEffect, useState, useCallback } from 'react';


interface ContentTypeDistribution {
  content_type: string;
  count: number;
}

interface GeneralStat {
  totalContentLength?: number;
  totalInscriptions?: number;
  totalGenesisFee?: number;
  inscriptionNumberHighLow?: { high: number; low: number };
}

const fetchStats = async (endpoint: string): Promise<any> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/${endpoint}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    return {};
  }
};

function formatBytesToGB(bytes: number): string {
  const bytesPerGB = 1073741824; // Number of bytes in 1 GB
  const gb = bytes / bytesPerGB;
  return new Intl.NumberFormat().format(Number(gb.toFixed(2))) + ' GB';
}



function formatLitsToLitecoin(lits: number) {
  const litsPerLitecoin = 100000000; // Number of lits in 1 Litecoin
  const litecoins = lits / litsPerLitecoin;

  // Convert to a fixed number of digits after the decimal to prevent scientific notation for very small numbers
  let formattedLitecoins = litecoins.toFixed(8); // Ensures the result is a string with 8 decimal places

  // Split the result into whole and fraction parts
  let [whole, fraction] = formattedLitecoins.includes('.') ? formattedLitecoins.split('.') : [formattedLitecoins, '00000000'];

  // Format the fractional part with spaces as specified
  fraction = `${fraction.slice(0, 2)} ${fraction.slice(2, 5)} ${fraction.slice(5)}`;

  return `${whole}.${fraction}`;
}


export default function Home() {
  const [contentTypeDistribution, setContentTypeDistribution] = useState<ContentTypeDistribution[]>([]);
  const [generalStats, setGeneralStats] = useState<GeneralStat>({});
  const [currentBlockHeight, setCurrentBlockHeight] = useState<number | null>(null);

  const fetchData = useCallback(async () => {


    // Fetch each stat and update state accordingly
    const totalContentLengthStat = await fetchStats('stats/totalContentLength');
    setGeneralStats(prevStats => ({
      ...prevStats,
      totalContentLength: totalContentLengthStat.totalContentLength
    }));

    const totalInscriptionsStat = await fetchStats('stats/totalInscriptions');
    setGeneralStats(prevStats => ({
      ...prevStats,
      totalInscriptions: parseInt(totalInscriptionsStat.totalInscriptions)
    }));

    const totalGenesisFeeStat = await fetchStats('stats/totalGenesisFee');
    setGeneralStats(prevStats => ({
      ...prevStats,
      totalGenesisFee: parseInt(totalGenesisFeeStat.totalGenesisFee)
    }));

    const distributionResponse = await fetchStats('stats/contentTypesDistribution');
    // Since the data is wrapped under a "distribution" key, extract it directly
    if (distributionResponse && Array.isArray(distributionResponse.distribution)) {
      setContentTypeDistribution(distributionResponse.distribution);
    } else {
      console.error('Expected an array for content type distribution, received:', distributionResponse);
      setContentTypeDistribution([]); // Fallback to an empty array
    }

    // const inscriptionNumberHighLowStat = await fetchStats('stats/inscriptionNumberHighLow');
    // setGeneralStats(prevStats => ({
    //   ...prevStats,
    //   inscriptionNumberHighLow: inscriptionNumberHighLowStat
    // }));
  }, []);

  const fetchBlockHeight = async (): Promise<number | null> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/blockHeight`);
      const { blockHeight } = await response.json();
      return blockHeight;
    } catch (error) {
      console.error("Error fetching block height:", error);
      return null;
    }
  };
  

  const checkForNewBlock = useCallback(async () => {
    const newBlockHeight = await fetchBlockHeight();
    if (newBlockHeight && newBlockHeight !== currentBlockHeight) {
      console.log(`New block detected: ${newBlockHeight}`);
      setCurrentBlockHeight(newBlockHeight);
      fetchData(); // This explicitly calls fetchData on block height change
    }
  }, [currentBlockHeight, fetchData]); // Ensure fetchData is stable (useCallback)

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
      checkForNewBlock();
    }, 30000); // Adjust interval as needed
    return () => clearInterval(interval);
  }, [checkForNewBlock, fetchData]);
  

  return (
    <main className="mx-auto p-4 max-w-screen-2xl">
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">General Stats</h2>
        <div className="space-y-2">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <span className="text-4xl font-semibold dark:text-gray-200">{generalStats.totalContentLength !== undefined ? formatBytesToGB(generalStats.totalContentLength) : '0'}</span>
            <span className="ml-2 text-gray-600 dark:text-gray-400">
              Stored data
            </span>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <span className="text-4xl font-semibold dark:text-gray-200">{generalStats.totalGenesisFee !== undefined ? formatLitsToLitecoin(generalStats.totalGenesisFee) : '0'}</span>
            <span className="ml-2 text-gray-600 dark:text-gray-400">
              Total Inscription fees
            </span>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <span className="text-4xl font-semibold dark:text-gray-200">{generalStats.totalInscriptions !== undefined ? new Intl.NumberFormat().format(generalStats.totalInscriptions) : '0'}</span>
            <span className="ml-2 text-gray-600 dark:text-gray-400">
              Inscriptions
            </span>
          </div>
        </div>
      </section>

      {/* <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Latest Inscriptions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        </div>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Featured</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        </div>
      </section> */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Content Count</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contentTypeDistribution.map((item) => (
            <div key={item.content_type} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
              <span className="text-lg font-semibold dark:text-gray-200">{item.content_type}:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">{item.count !== undefined ? new Intl.NumberFormat().format(item.count) : '0'}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
  
}
