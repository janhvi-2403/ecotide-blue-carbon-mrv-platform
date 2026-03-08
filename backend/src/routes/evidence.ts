import { Router } from 'express';
import multer from 'multer';
import { uploadEvidence, getEvidenceByProject, deleteEvidence, getAllEvidence } from '../controllers/evidence';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit
});

// All routes require authentication
router.use(authenticateToken);

// Upload evidence (UPLOADER only)
router.post('/upload', requireRole(['UPLOADER']), upload.single('file'), uploadEvidence);

// Get evidence by project
router.get('/project/:projectId', getEvidenceByProject);

// Delete evidence (Uploader or Admin)
router.delete('/:id', deleteEvidence);

// Get all evidence (Map/Admin dashboard)
router.get('/', getAllEvidence);

export default router;
