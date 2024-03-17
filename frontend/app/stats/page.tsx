'use client'
import { Typography, Card } from "@material-tailwind/react";
import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { InscriptionCard } from '../components/inscriptionCard'
import Footer from "../components/footer";

interface ContentTypeDistribution {
  content_type_type: string;
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
  return new Intl.NumberFormat().format(Number(gb.toFixed(2)));
}



function formatLitsToLitecoin(lits: number) {
  const litsPerLitecoin = 100000000; // Number of lits in 1 Litecoin
  const litecoins = lits / litsPerLitecoin;

  // Convert to a fixed number of digits after the decimal to prevent scientific notation for very small numbers
  let formattedLitecoins = litecoins.toFixed(8); // Ensures the result is a string with 8 decimal places

  // Split the result into whole and fraction parts
  let [whole, fraction] = formattedLitecoins.includes('.') ? formattedLitecoins.split('.') : [formattedLitecoins, '00000000'];

  // Format the fractional part with non-breaking spaces
  fraction = `${fraction.slice(0, 2)}\u00A0${fraction.slice(2, 5)}\u00A0${fraction.slice(5)}`;

  return `${whole}.${fraction}`;
}



interface StatsCardPropsType {
  count: string;
  title: string;
}

function StatsCard({ count, title }: StatsCardPropsType) {
  return (
    <Card color="transparent" shadow={false}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Typography
          variant="gradient"
          className="text-4xl md:text-6xl font-bold text-white"
        >
          {count}
        </Typography>
      </motion.div>
      <Typography variant="h6" color="white" className="mt-1 font-medium text-blue-500">
        {title}
      </Typography>
    </Card>
  );
}




export function StatsSection4() {
  const [contentTypeDistribution, setContentTypeDistribution] = useState<ContentTypeDistribution[]>([]);
  const [generalStats, setGeneralStats] = useState<GeneralStat>({});
  const [currentBlockHeight, setCurrentBlockHeight] = useState<number | null>(null);

  const fetchData = useCallback(async () => {

    const totalStats = await fetchStats('stats/totals');


    // Fetch each stat and update state accordingly

    setGeneralStats(prevStats => ({
      ...prevStats,
      totalContentLength: totalStats.totalContentLength
    }));

    setGeneralStats(prevStats => ({
      ...prevStats,
      totalInscriptions: parseInt(totalStats.totalInscriptions)
    }));

    setGeneralStats(prevStats => ({
      ...prevStats,
      totalGenesisFee: parseInt(totalStats.totalGenesisFee)
    }));

    const distributionResponse = totalStats.contentTypesMapped
    // Since the data is wrapped under a "distribution" key, extract it directly
    if (distributionResponse && Array.isArray(distributionResponse)) {
      setContentTypeDistribution(distributionResponse);
    } else {
      console.error('Expected an array for content type distribution, received:', distributionResponse);
      setContentTypeDistribution([]); // Fallback to an empty array
    }

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
    <div>
      <section className="container mx-auto grid gap-10 px-4 py-16 lg:grid-cols-1 lg:gap-20 lg:py-36 xl:grid-cols-2 xl:place-items-center">
        <div>

          <Typography
            variant="h1"
            className="text-3xl !leading-snug lg:text-5xl"
          >
            Inscriptions on Ordinals Lite
          </Typography>
          <Typography
            variant="lead"
            className="mt-3 w-full !text-gray-500 lg:w-10/12"
          >
            Immutable, decentralized data is securely inscribed across 1000+ Litecoin nodes, with a dedicated network of globally distributed Scrypt ASIC miners protecting the network.
          </Typography>
          <Typography
            variant="lead"
            className="mt-3 w-full !text-gray-500 lg:w-10/12"
          >
            Litecoin's innovative Mimblewimble Extension Block (MWEB) feature ensures fungible transactions have their dedicated block space. This separation means they do not compete for space in the base block or the SegWit block, which supports ordinals.
          </Typography>
          <Typography
            variant="lead"
            className="mt-3 w-full !text-gray-500 lg:w-10/12"
          >
            The first inscription on Litecoin is the Mimblewimble White Paper, implemented on Litecoin as MWEB with Taproot on block 2,265,984.
          </Typography>
        </div>
        <div>
          <Typography variant="h4" className="mb-6 text-blue-500 underline underline-offset-1 font-medium">
            Ordinal Lite Stats
          </Typography>
          <div className="grid grid-cols-1 gap-8 gap-x-28 text-white text-white">
            <StatsCard key="inscriptions" count={(generalStats.totalInscriptions ?? 0).toLocaleString()} title="Inscriptions" />
            <StatsCard key="gbStoredData" count={String(formatBytesToGB(Number(generalStats.totalContentLength ?? 0)))} title="GB stored on-chain" />
            <StatsCard key="ltcFeesPaid" count={String(formatLitsToLitecoin(Number(generalStats.totalGenesisFee ?? 0)))} title="LTC fees paid to Scrypt miners" />
          </div>
        </div>
      </section>
      <section className="container mx-auto grid gap-10 px-4 py-16 lg:grid-cols-1 lg:gap-20 lg:py-16 xl:grid-cols-2 xl:place-items-center">
        <div className="w-full md:w-1/2 bg-black">
          <Typography variant="h4" className="mb-6 text-gray-200 underline underline-offset-1 font-medium">
            Inscription #0
          </Typography>
          <InscriptionCard inscription_id='71e0f6dc87a473aa69787fff8e09e5eddfdca96e587928a5b1a25c0ae16dc0eei0' content_length={57} maxHeight="500px" inscription_number={0} content_type="application/pdf" content_type_type="application" />
        </div>
        <div>
          <Typography variant="h4" className="mb-6 text-blue-500 underline underline-offset-1 font-medium">
            File Count
          </Typography>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-x-24 min-w-2xl max-w-3xl">
            {contentTypeDistribution.map((item) => (
              <motion.div
                key={item.content_type_type}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="py-4 bg-slate-700 dark:bg-gray-800 rounded-lg shadow"
              >
                <Typography variant="gradient" className="text-3xl font-bold text-white">
                  {item.count.toLocaleString()}
                </Typography>
                <span className="mt-1 font-medium text-blue-500">{item.content_type_type}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default StatsSection4;