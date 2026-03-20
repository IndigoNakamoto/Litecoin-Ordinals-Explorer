import express from 'express';
import {
    getAllInscriptions,
    getInscriptionById,
    getInscriptionByNumber,
    getInscriptionsByContentType,
    getInscriptionsByContentTypeType,
} from '../controllers/inscriptions';

const router = express.Router();

// Static paths first so they are not captured by /:inscriptionId
router.get('/', getAllInscriptions);
router.get('/number/:inscriptionNumber', getInscriptionByNumber);
router.get('/content_type/:contentType', getInscriptionsByContentType);
router.get('/content_type_type/:contentTypeType', getInscriptionsByContentTypeType);
router.get('/:inscriptionId', getInscriptionById);

export default router;
