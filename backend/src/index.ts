// working on cache. Not working for content_length total or content distribution. 

// backend/src/index.ts
import express from 'express';
import { getBlockInscriptionsPage, getInscriptionData, getBlockHeight, getInscriptionContent } from '../util/ord-litecoin';

import { ContentTypeType, ContentType } from '../util/types';

// import {
//   getInscriptionByNumber2, getInscriptionById2, filterAndSortInscriptions2, getMainTotals
// } from '../util/prismaInscriptionQueries';

import { filterAndSortInscriptions, getInscriptionContentType, getInscriptionById, getInscriptionByNumber } from '../util/inscriptionQueries'
import cors from 'cors';
import multer from 'multer';
import * as mimeTypes from 'mime-types'; // Import mime-types package
import fs from 'fs'
import NodeCache from 'node-cache';
import { Request } from 'express';

const app = express();
const port = 3005;
const cache = new NodeCache({ stdTTL: 300, checkperiod: 120 });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Default route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

let isRefreshing = false;
const refreshCooldownInSeconds = 45; // Cooldown period before allowing another refresh

const refreshCache = async (key: string, fetchData: () => Promise<any>, ttl: number = 150) => {
  if (isRefreshing) {
    console.log('A refresh operation is already in progress. Skipping...');
    return;
  }
  isRefreshing = true;
  try {
    const data = await fetchData();
    cache.set(key, data, ttl);
    setTimeout(() => {
      isRefreshing = false;
    }, refreshCooldownInSeconds * 1000); // Reset the flag after the cooldown period
  } catch (error) {
    console.error(`Failed to refresh cache for key ${key}: `, error);
    isRefreshing = false; // Ensure the flag is reset even if an error occurs
  }
};

app.get('/stats/totals', async (req, res) => {
  try {
    let cachedData = cache.get('totals');
    if (!cachedData) {
      // Cache miss, fetch data synchronously this time
      console.log('Cache miss, fetching data...');
      cachedData = await getMainTotals();
      cache.set('totals', cachedData); // Populate cache for the first time
    } else {
      // Cache hit, but let's refresh the cache asynchronously
      console.log('Cache hit, refreshing data in the background...');
      refreshCache('totals', getMainTotals);
    }
    res.json(cachedData);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while fetching totals');
  }
});

app.get('/inscriptions', async (req, res) => {
  try {
    const {
      contentTypeType,
      contentType,
      sortBy = 'newest',
      page = '1', // Default to '1' as a string, to match types
      cursed = 'false',
      inscriptionNumberStart,
      inscriptionNumberEnd,
    } = req.query;

    const pageNumerical = parseInt(page.toString(), 10);
    const cursedBoolean = cursed === 'true';
    console.log('cursed boolean: ', cursedBoolean)
    let inscriptionNumberRange: [number, number] | undefined;

    // if (inscriptionNumberStart && inscriptionNumberEnd) {
    //   inscriptionNumberRange = [
    //     parseInt(inscriptionNumberStart, 10),
    //     parseInt(inscriptionNumberEnd, 10),
    //   ];
    // }

    // Validate and translate contentType
    let actualContentType: ContentType | undefined;
    if (typeof contentType === 'string' && contentType in ContentType) {
      actualContentType = ContentType[contentType as keyof typeof ContentType];
    }

    // Validate and translate contentTypeType
    let actualContentTypeType: ContentTypeType | undefined;
    if (typeof contentTypeType === 'string' && contentTypeType in ContentTypeType) {
      actualContentTypeType = ContentTypeType[contentTypeType as keyof typeof ContentTypeType];
    }

    const inscriptions = await filterAndSortInscriptions2(
      actualContentTypeType, // Use translated and validated contentTypeType
      actualContentType, // Use translated and validated contentType
      sortBy as 'newest' | 'oldest' | 'largestfile' | 'largestfee',
      pageNumerical,
      cursedBoolean,
      // inscriptionNumberRange
    );

    // Convert BigInt fields to strings
    const convertedInscriptions = inscriptions.map((inscription: { output_value: { toString: () => any; }; }) => ({
      ...inscription,
      output_value: inscription.output_value ? inscription.output_value.toString() : '0', // Convert BigInt to string or return empty string if null
      // Add any other BigInt fields here if necessary
    }));

    res.json(convertedInscriptions);
  } catch (error: any) {
    res.status(500).send(error.message);
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

// // Set up multer for file uploads
// const storage = multer.diskStorage({
//   destination: 'uploads/',
//   filename: function (req, file, cb) {
//     // Generate a unique filename
//     const fileExtension = file.originalname.split('.').pop();
//     const fileName = file.originalname.split('.')[0]
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, `${file.fieldname}-${fileName}-${Date.now()}.${fileExtension}`);
//   }
// });

// // Set up multer for file uploads with size limit
// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 399 * 1000, // 400 KB in bytes
//   }
// });


// app.post('/upload', upload.array('files', 20), (req: Request, res) => {

//   const files = req.files as Express.Multer.File[];
//   files.forEach((file: any) => {
//     console.log('Uploaded file:', file);
//     // validate file size
//     // validate file type
//     // validate fees 

//     // If validation fails for a file
//     // update invoice metadata for file to status 'error' message 'validation failed' file size or file type
//     // remove file from upload folder and return error message to client
//   });

//   // Create invoice
//   // send invoice to client

//   // Inscribe manager will poll for new invoices every 5 seconds

//   // Extract and log other form fields data
//   const { user_id } = req.body;

//   console.log("user_id: ", user_id);
//   console.log("IP Address: ", req.ip);

//   // Assuming all validations pass, send a success response
//   res.send(`Files uploaded successfully: ${files.map(file => file.originalname).join(', ')}`);
// });




// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: function(req, file, cb) {
    // Generate a unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});

// Set up multer for file uploads with size limit
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 399 * 1024, // 400 KB in bytes
  }
});

// File upload endpoint with metadata and size validation
app.post('/upload', upload.single('file'), (req, res) => {
  // Check if req.file exists
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }

  // Access uploaded file via req.file
  const uploadedFile = req.file;
  console.log('Uploaded file:', uploadedFile);

  // Check file size
  if (uploadedFile.size > 399 * 1024) {
    return res.status(400).send('File size exceeds the limit of 399KB');
  }

  //IP address
  const ipAddress = req.ip;

  // request body
  const { username, order_id, inscription_fee, service_fee, payment_address, receiving_address } = req.body

  // MIME type
  const mimeType = mimeTypes.lookup(uploadedFile.originalname);
  

  // Respond with success message
  res.send('File uploaded successfully');
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
    // Convert BigInt fields to strings
    let modifyData = data;
    modifyData!.output_value = Number(data!.output_value.toString()); // Convert BigInt to string

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});



app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
