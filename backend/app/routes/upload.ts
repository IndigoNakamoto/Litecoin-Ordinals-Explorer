import express, { Request, Response } from 'express';
import multer from 'multer';
const router = express.Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: function (req, file, cb) {
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
  
  
  router.post('/upload', upload.array('files', 20), (req: Request, res) => {
  
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
  