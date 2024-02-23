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
import { filterAndSortInscriptions } from '../util/inscriptionQueries'
import cors from 'cors';
import multer from 'multer';
import * as mimeTypes from 'mime-types'; // Import mime-types package

const app = express();
const port = 3005;

app.use(cors());

// Default route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});



app.get('/inscriptions', async (req, res) => {
  let contentType = typeof req.query.contentType === 'string' ? req.query.contentType : 'All';
  if (contentType === "SVG") contentType = 'image/svg+xml'
  else if (contentType === "GIF") contentType = 'image/gif'
  else if (contentType === "HTML") contentType = 'text/html;charset=utf-8'
  else if (contentType === "JavaScript") contentType = 'text/javascript'
  else if (contentType === "PDF") contentType = 'application/pdf'
  else if (contentType === "JSON") contentType = 'application/json'
  
  const sortByOptions: ('newest' | 'oldest' | 'largestfile' | 'largestfee')[] = ['newest', 'oldest', 'largestfile', 'largestfee'];
  let sortBy: 'newest' | 'oldest' | 'largestfile' | 'largestfee' = 'newest';
  if (typeof req.query.sortBy === 'string' && sortByOptions.includes(req.query.sortBy as any)) {
    sortBy = req.query.sortBy as 'newest' | 'oldest' | 'largestfile' | 'largestfee';
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