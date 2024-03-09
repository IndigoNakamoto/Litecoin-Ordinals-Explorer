// working on cache. Not working for content_length total or content distribution. 

// backend/src/index.ts
import express from 'express';
import { getBlockInscriptionsPage, getInscriptionData, getBlockHeight, getInscriptionContent } from '../util/ord-litecoin';
import {
  getTotalContentLength,
  getContentLengthPerGenesisHeight,
  getTotalGenesisFee,
  getGenesisFeePerGenesisHeight,
  getTotalInscriptions,
  getInscriptionNumberHighLow,
  getContentTypesDistribution
} from '../util/inscriptionStats';

import { 
  getInscriptionByNumber2, getInscriptionById2, filterAndSortInscriptions2
} from '../util/prismaInscriptionQueries';

import { filterAndSortInscriptions, getInscriptionContentType, getInscriptionById, getInscriptionByNumber } from '../util/inscriptionQueries'
import cors from 'cors';
import multer from 'multer';
import * as mimeTypes from 'mime-types'; // Import mime-types package
import fs from 'fs'
import NodeCache from 'node-cache';
import { Request } from 'express';

const cache = new NodeCache({ stdTTL: 300 });

const app = express();
const port = 3005;

app.use(cors());

// Default route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// app.get('/inscriptions', async (req, res) => {
//   let contentType = typeof req.query.contentType === 'string' ? req.query.contentType : 'All';
//   if (contentType === "SVG") contentType = 'image/svg+xml'
//   else if (contentType === "GIF") contentType = 'image/gif'
//   else if (contentType === "HTML") contentType = 'text/html;charset=utf-8'
//   else if (contentType === "JavaScript") contentType = 'text/javascript'
//   else if (contentType === "PDF") contentType = 'application/pdf'
//   else if (contentType === "JSON") contentType = 'application/json'
  
//   const sortByOptions: ('newest' | 'oldest' | 'largestfile' | 'largestfee')[] = ['newest', 'oldest', 'largestfile', 'largestfee'];
//   let sortBy: 'newest' | 'oldest' | 'largestfile' | 'largestfee' = 'newest';
//   if (typeof req.query.sortBy === 'string' && sortByOptions.includes(req.query.sortBy as any)) {
//     sortBy = req.query.sortBy as 'newest' | 'oldest' | 'largestfile' | 'largestfee';
//   }

//   const limit = parseInt(req.query.limit as string, 10) || 200;
//   const lastInscriptionNumber = req.query.lastInscriptionNumber ? parseInt(req.query.lastInscriptionNumber as string, 10) : undefined;
//   const cursed = req.query.cursed === 'true'; // Check if 'cursed' query parameter is true

//   try {
//     const inscriptions = await filterAndSortInscriptions(contentType, sortBy, limit, lastInscriptionNumber, cursed);
//     res.json(inscriptions);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Server error');
//   }
// });

const PAGE_SIZE = 200; // Define page size constant

app.get('/inscriptions', async (req, res) => {
  let contentTypeType = typeof req.query.contentTypeType === 'string' ? req.query.contentTypeType : undefined;
  let contentType = typeof req.query.contentType === 'string' ? req.query.contentType : undefined;
  if (contentType) {
    // Map short content types to full content types
    const contentTypeMap: { [key: string]: string } = {
      "SVG": 'image/svg+xml',
      "GIF": 'image/gif',
      "HTML": 'text/html;charset=utf-8',
      "JavaScript": 'text/javascript',
      "PDF": 'application/pdf',
      "JSON": 'application/json'
    };
    contentType = contentTypeMap[contentType] || contentType;
  }

  const sortByOptions: ('newest' | 'oldest' | 'largestfile' | 'largestfee')[] = ['newest', 'oldest', 'largestfile', 'largestfee'];
  let sortBy: 'newest' | 'oldest' | 'largestfile' | 'largestfee' = 'newest';
  if (typeof req.query.sortBy === 'string' && sortByOptions.includes(req.query.sortBy as any)) {
    sortBy = req.query.sortBy as 'newest' | 'oldest' | 'largestfile' | 'largestfee';
  }

  const page = parseInt(req.query.page as string, 10) || 1; // Parse page number
  const cursed = req.query.cursed === 'true'; // Check if 'cursed' query parameter is true

  try {
    // Query inscriptions
    const inscriptions = await filterAndSortInscriptions2(contentTypeType, contentType, sortBy, page, cursed, undefined);

    // Convert BigInt values to strings or numbers
    const serializedInscriptions = inscriptions.map(inscription => ({
      ...inscription,
      genesis_fee: Number(inscription.genesis_fee),
      output_value: Number(inscription.output_value),
      inscription_number: Number(inscription.inscription_number)
    }));

    res.json(serializedInscriptions);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});



app.get('/media/:inscription_id', async (req, res) => {
  const { inscription_id } = req.params;
  const mediaPath = `app/backend/media/${inscription_id}`;

  try {
    const contentType = await getInscriptionContentType(inscription_id);
    
    // Check if 'contentType' is not null
    if (!contentType) {
      return res.status(404).send('Content type not found or media not found');
    }

    const extension = contentType.startsWith('image/') ? '.webp' : '.webm';
    const filePath = `${mediaPath}${extension}`;

    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).send('File not found');
    }
  } catch (error) {
    console.error('Error serving media file:', error);
    res.status(500).send('Server error');
  }
});


app.get('/content', async (req, res) => {
  // Ensure that content_type and inscription_id are treated as strings even if they are arrays or ParsedQs
  const content_type = typeof req.query.content_type === 'string' ? req.query.content_type : undefined;
  const inscription_id = typeof req.query.inscription_id === 'string' ? req.query.inscription_id : undefined;

  if (!content_type || !inscription_id) {
    return res.status(400).json({ error: 'Missing or invalid content_type or inscription_id query parameter' });
  }

  try {
    const data = await getInscriptionContent(inscription_id, content_type);

    // Content-Type check should be safe now since we ensured they are not undefined
    if (content_type.includes('application/json')) {
      // Send JSON content
      res.json(data);
    } else if (content_type.includes('text')) {
      // Send text content
      res.type('text').send(data);
    } else if (content_type.includes('image') || content_type.includes('application/octet-stream')) {
      // For binary data like images or files
      res.type(content_type).send(data);
    } else {
      // Handle other content types as needed
      res.status(415).send('Unsupported Media Type');
    }
  } catch (error) {
    console.error('Error fetching inscription content:', error);
    res.status(500).send('Server error');
  }
});







// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: function(req, file, cb) {
    // Generate a unique filename
    const fileExtension = file.originalname.split('.').pop();
    const fileName = file.originalname.split('.')[0]
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${fileName}-${Date.now()}.${fileExtension}`);
  }
});

// Set up multer for file uploads with size limit
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 399 * 1000, // 400 KB in bytes
  }
});




app.post('/upload', upload.array('files', 20), (req: Request, res) => {

  const files = req.files as Express.Multer.File[];
  files.forEach((file: any) => {
      console.log('Uploaded file:', file);
      // validate file size
      // validate file type
      // validate fees 

      // If validation fails for a file
        // update invoice metadata for file to status 'error' message 'validation failed' file size or file type
        // remove file from upload folder and return error message to client
  });

  // Create invoice
  // https://www.payment.ordlite.io/api/v1/stores/{storeId}/invoices
  // send invoice to client

  // Inscribe manager will poll for new invoices every 5 seconds

  // Extract and log other form fields data
  const { user_id } = req.body;

  console.log("user_id: ", user_id);
  console.log("IP Address: ", req.ip);

  // Assuming all validations pass, send a success response
  res.send(`Files uploaded successfully: ${files.map(file => file.originalname).join(', ')}`);
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
    // const data = await getInscriptionData(inscriptionId);
    const data = await getInscriptionById2(inscriptionId);
    
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

app.get('/inscription_number/:inscription_number', async (req, res) => {
  const { inscription_number } = req.params;
  try {
    // const data = await getInscriptionData(inscription_number);
    const data = await getInscriptionByNumber2(Number(inscription_number));
    
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// New endpoint for total content length
app.get('/stats/totalContentLength', async (req, res) => {
  try {
    const cachedData = cache.get('totalContentLength');
    if (cachedData) {
      // console.log("Returning cached total content length: ", cachedData)
      return res.json(cachedData);
    }

    const totalContentLength = await getTotalContentLength();
    cache.set('totalContentLength', totalContentLength); // Cache without explicit TTL (default 150 seconds)
    res.json({ totalContentLength });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// New endpoint for content types distribution
app.get('/stats/contentTypesDistribution', async (req, res) => {
  try {
    let cachedData = cache.get('contentTypesDistribution');
    if (cachedData) {
      // If cached data exists, send it immediately
      return res.json(cachedData);
    }

    // Fetch the data asynchronously
    getContentTypesDistribution().then(distribution => {
      // Update the cache with the new data
      cache.set('contentTypesDistribution', distribution);
      // Send the response to the client
      res.json({ distribution });
    }).catch(error => {
      console.error(error);
      res.status(500).send(error);
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// Schedule periodic cache updates every 2.5 minutes
setInterval(async () => {
  try {
    const distribution = await getContentTypesDistribution();
    // Update the cache with the new data
    cache.set('contentTypesDistribution', distribution);
    console.log('Cache updated for contentTypesDistribution');
  } catch (error) {
    console.error('Error updating cache:', error);
  }
}, 2.5 * 60 * 1000); // Run every 2.5 minutes


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
    const cachedData = cache.get('totalGenesisFee');
    if (cachedData) {
      return res.json(cachedData);
    }
    const totalGenesisFee = await getTotalGenesisFee();
    cache.set('totalGenesisFee', totalGenesisFee); // Cache without explicit TTL (default 150 seconds)
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
    const cachedData = cache.get('totalInscriptions');
    if (cachedData) {
      return res.json(cachedData);
    }

    const totalInscriptions = await getTotalInscriptions();
    cache.set('totalInscriptions', totalInscriptions); // Cache without explicit TTL (default 150 seconds)
  
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