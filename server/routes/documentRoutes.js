import express from 'express';
import { documentController } from '../controllers/documentController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/upload', upload.single('file'), documentController.uploadDocument);
router.get('/', documentController.getDocumentsList);
router.get('/:id/download', documentController.downloadDocument);
router.delete('/:id', documentController.deleteDocument);

export default router;
