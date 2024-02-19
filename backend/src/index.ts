// backend/src/index.ts
import express from 'express';
import { getBlockInscriptionsPage, getInscriptionData, getBlockHeight } from '../util/ord-litecoin';
import {
  getTotalContentLength,
  getContentLengthPerGenesisHeight,
  getTotalGenesisFee,
  getGenesisFeePerGenesisHeight,
  getTotalInscriptions,
  getInscriptionNumberHighLow,
  getContentTypesDistribution
} from '../util/inscriptionStats';
import { filterAndSortInscriptions } from '../util/inscriptionQueries'
import cors from 'cors';


const app = express();
const port = 3005;

app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.get('/inscriptions', async (req, res) => {
  const contentType = typeof req.query.contentType === 'string' ? req.query.contentType : 'All';
  
  const sortByOptions: ('newest' | 'oldest' | 'largestFile' | 'largestFee')[] = ['newest', 'oldest', 'largestFile', 'largestFee'];
  let sortBy: 'newest' | 'oldest' | 'largestFile' | 'largestFee' = 'newest';
  if (typeof req.query.sortBy === 'string' && sortByOptions.includes(req.query.sortBy as any)) {
    sortBy = req.query.sortBy as 'newest' | 'oldest' | 'largestFile' | 'largestFee';
  }

  const limit = parseInt(req.query.limit as string, 10) || 200;
  const lastInscriptionNumber = req.query.lastInscriptionNumber ? parseInt(req.query.lastInscriptionNumber as string, 10) : undefined;
  const cursed = req.query.cursed === 'true'; // Check if 'cursed' query parameter is true

  try {
    const inscriptions = await filterAndSortInscriptions(contentType, sortBy, limit, lastInscriptionNumber, cursed);
    res.json(inscriptions);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});




app.get('/inscriptions/block/:blockNumber/:pageNumber', async (req, res) => {
  const { blockNumber, pageNumber } = req.params;
  try {
    const data = await getBlockInscriptionsPage(parseInt(blockNumber, 10), parseInt(pageNumber, 10));
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

app.get('/blockHeight', async (req, res) => {
  try { 
    const data = await getBlockHeight()
    res.json(data)
  } catch (error) { 
    console.error(error);
    res.status(500).send(error);
  }
});


app.get('/inscription/:inscriptionId', async (req, res) => {
  const { inscriptionId } = req.params;
  try {
    const data = await getInscriptionData(inscriptionId);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// New endpoint for total content length
app.get('/stats/totalContentLength', async (req, res) => {
  try {
    const totalContentLength = await getTotalContentLength();
    res.json({ totalContentLength });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// New endpoint for content types distribution
app.get('/stats/contentTypesDistribution', async (req, res) => {
  try {
    const distribution = await getContentTypesDistribution();
    res.json({ distribution });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});


// New endpoint for content length per genesis height
app.get('/stats/contentLengthPerGenesisHeight', async (req, res) => {
  try {
    const contentLengthPerGenesisHeight = await getContentLengthPerGenesisHeight();
    res.json({ contentLengthPerGenesisHeight });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// New endpoint for total genesis fee
app.get('/stats/totalGenesisFee', async (req, res) => {
  try {
    const totalGenesisFee = await getTotalGenesisFee();
    res.json({ totalGenesisFee });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// New endpoint for genesis fee per genesis height
app.get('/stats/genesisFeePerGenesisHeight', async (req, res) => {
  try {
    const genesisFeePerGenesisHeight = await getGenesisFeePerGenesisHeight();
    res.json({ genesisFeePerGenesisHeight });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// New endpoint for total number of inscriptions
app.get('/stats/totalInscriptions', async (req, res) => {
  try {
    const totalInscriptions = await getTotalInscriptions();
    res.json({ totalInscriptions });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// New endpoint for high/low inscription number
app.get('/stats/inscriptionNumberHighLow', async (req, res) => {
  try {
    const inscriptionNumberHighLow = await getInscriptionNumberHighLow();
    res.json({ inscriptionNumberHighLow });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});