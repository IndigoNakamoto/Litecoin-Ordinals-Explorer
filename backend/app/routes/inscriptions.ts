import express from 'express';
import {
    getAllInscriptions,
    getInscriptionById,
    getInscriptionByNumber,
    getInscriptionsByContentType,
    getInscriptionsByContentTypeType
} from '../controllers/inscriptions';

const router = express.Router();

// Route to get a single inscription by its ID
// GET /:inscriptionId
// Example: GET /123
router.get('/:inscriptionId', getInscriptionById);

// Route to get a single inscription by its unique number
// GET /number/:inscriptionNumber
// Example: GET /number/456
router.get('/number/:inscriptionNumber', getInscriptionByNumber);

// Route to get all inscriptions with optional query parameters for sorting and filtering
// GET /
// Query parameters: sortOrder, page, cursed
// Example: GET /?sortOrder=genesis_fee&page=2&cursed=true
router.get('/', getAllInscriptions);

// Route to get inscriptions filtered by [Mime Type/SubType](content_type) with optional sorting and filtering
// GET /content_type/:contentType
// Path variable: contentType (e.g., image, text)
// Query parameters: sortOrder, page, cursed
// Example: GET /content_type/image?sortOrder=content_length&page=1&cursed=false
router.get('/content_type/:contentType', getInscriptionsByContentType);

// Route to get inscriptions filtered by [MIME Type](content_type_type) classification with optional sorting and filtering
// GET /content_type_type/:contentTypeType
// Path variable: contentTypeType (a finer categorization within content types)
// Query parameters: sortOrder, page, cursed
// Example: GET /content_type_type/model?sortOrder=number_asc&page=1&cursed=true
router.get('/content_type_type/:contentTypeType', getInscriptionsByContentTypeType);

export default router;



// List of filter query parameters
// Each endpoint also has sortOrder, page, and cursed query parameters
// sortOrder: string [genesis_fee, content_length, number_desc "newest", number_asc "oldest"]

// Content Type
// image maps to /inscriptions/content_type_type/image
// video maps to /inscriptions/content_type_type/video
// application maps to /inscriptions/content_type_type/application
// audio maps to /inscriptions/content_type_type/audio

// Content Type/Subtype
// pdf maps to /inscriptions/content_type/application%2Fpdf
// json maps to /inscriptions/content_type/application%2Fjson
// svg maps to /inscriptions/content_type/image%2Fsvg
// gif maps to /inscriptions/content_type/image%2Fgif
// 3D maps to /inscriptions/content_type/model
// text maps to /inscriptions/content_type/text
// html maps to /inscriptions/content_type/text%2Fhtml