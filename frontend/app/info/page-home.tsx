'use client'
import { Typography, Card } from "@material-tailwind/react";
import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { InscriptionHero } from '../components/InscriptionHero'
import Head from 'next/head'; // For setting head elements

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
    // console.error("Fetch error:", error);
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
    <Card color="transparent" shadow={false} placeholder={undefined}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Typography
          className="text-5xl md:text-5xl font-bold text-white" placeholder={undefined}        >
          {count}
        </Typography>
      </motion.div>
      <Typography variant="h6" color="white" className="mt-1 font-medium text-white" placeholder={undefined}>
        {title}
      </Typography>
    </Card>
  );
}




export default function StatsPage() {
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
      // console.error('Expected an array for content type distribution, received:', distributionResponse);
      setContentTypeDistribution([]); // Fallback to an empty array
    }

  }, []);

  const fetchBlockHeight = async (): Promise<number | null> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/stats/blockHeight`);
      const { blockHeight } = await response.json();
      return blockHeight;
    } catch (error) {
      // console.error("Error fetching block height:", error);
      return null;
    }
  };


  const checkForNewBlock = useCallback(async () => {
    const newBlockHeight = await fetchBlockHeight();
    if (newBlockHeight && newBlockHeight !== currentBlockHeight) {
      // console.log(`New block detected: ${newBlockHeight}`);
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

  const title = `Ordinals Lite Statistics | OrdLite.io`;
  const description = 'Explore real-time stats of Ordinals Lite. Secure, immutable, and decentralized network powered by Scrypt miners.';

  return (
    <div>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://www.ordlite.io/social_background2.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@ordlite" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content="https://www.ordlite.io/social_background2.jpg" />
      </Head>
      <section className="container mx-auto grid gap-10 px-4 py-10 lg:grid-cols-1 lg:gap-16 lg:pt-14 xl:grid-cols-2 justify-between">

        <div className=''>
          <Typography
            variant="h1"
            className="text-3xl !leading-snug lg:text-5xl text-white " placeholder={undefined}          >
            Ordinal Lite Info
          </Typography>
          <Typography variant="lead" className="text-gray-500 pb-10" placeholder={undefined}>
            The current state of Ordinals on the Litecoin Blockchain
          </Typography>
          <div className="grid grid-cols-1 gap-8 gap-x-28 text-white">
            <StatsCard key="inscriptions" count={(generalStats.totalInscriptions ?? 0).toLocaleString()} title="Inscriptions" />
            <StatsCard key="gbStoredData" count={String(formatBytesToGB(Number(generalStats.totalContentLength ?? 0)))} title="GB stored on-chain" />
            <StatsCard key="ltcFeesPaid" count={String(formatLitsToLitecoin(Number(generalStats.totalGenesisFee ?? 0)))} title="LTC fees paid to Scrypt miners" />
          </div>
        </div>

        <div className='xl:py-14'>
          {/* <Typography variant="h4" className="mb-6 underline underline-offset-1 text-white font-medium" placeholder={undefined}>
            File Count
          </Typography> */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-x-24 min-w-2xl max-w-3xl pt-16">
            {contentTypeDistribution.map((item) => (
              <motion.div
                key={item.content_type_type}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="py-4 bg-slate-700 dark:bg-gray-800 rounded-lg shadow"
              >
                <Typography className="text-3xl font-bold text-white" placeholder={undefined}>
                  {item.count.toLocaleString()}
                </Typography>
                <span className="mt-1 font-large text-white">{item.content_type_type.charAt(0).toUpperCase() + item.content_type_type.slice(1)}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <section className="container mx-auto grid gap-10 lg:grid-cols-1 lg:gap-20 xl:grid-cols-1 p-4">
        <div>
          <Typography
            variant="h1"
            className="text-3xl !leading-snug lg:text-5xl text-white" placeholder={undefined}          >
            Inscriptions on Ordinals Lite
          </Typography>
          <Typography
            variant="lead"
            className="mt-3 w-full !text-gray-500 lg:w-11/12" placeholder={undefined}          >
            Ordinals Lite represents a cutting-edge platform that guarantees security, immutability, and decentralization, powered by over 1,000 Litecoin nodes across the globe on the most reliable blockchain with unmatched 100% uptime. This network is fortified by an extensive global network of dedicated Scrypt ASIC miners, ensuring unparalleled network stability and security.
          </Typography>
          <Typography
            variant="lead"
            className="mt-3 w-full !text-gray-500 lg:w-11/12" placeholder={undefined}          >
            The very first inscription, Inscription #0, featured on Litecoin was the groundbreaking Mimblewimble White Paper, heralding a significant evolution in Litecoin&apos;s capabilities. With the activation of MWEB and Taproot at block 2,257,920, Litecoin has transformed into a fully integrated digital currency, enhancing user privacy, scalability, and security through specialized block space dedicated to Fungible Transactions.
          </Typography>
          {/* <Typography
            variant="lead"
            className="mt-3 w-full !text-gray-500 lg:w-11/12" placeholder={undefined}          >
            Introducing the groundbreaking Mimblewimble Extension Block (MWEB) feature, Litecoin has set a new standard for transaction privacy and efficiency. By allocating a highly prunable block space for fungible transactions, MWEB cleverly removes competition for space within the base and the SegWit blocks, which are crucial for the support of ordinals. This innovation not only enhances transaction privacy but also optimizes the network&apos;s overall performance and scalability.
          </Typography> */}
        </div>
        <div className="w-full bg-black">
          <Typography variant="h4" className="mb-6 text-white underline underline-offset-1 font-medium" placeholder={undefined}>
            Inscription #0
          </Typography>
          <InscriptionHero inscription_id='71e0f6dc87a473aa69787fff8e09e5eddfdca96e587928a5b1a25c0ae16dc0eei0' content_length={57} maxHeight="600px" inscription_number={0} content_type="application/pdf" content_type_type="application" />
        </div>


      </section>
    </div>
  );
}
