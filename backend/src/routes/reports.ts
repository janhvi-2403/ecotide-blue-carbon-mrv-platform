import { Router } from 'express';
import { submitMRVReport, getReports } from '../controllers/reports';
import { authenticateToken, requireRole } from '../middleware/auth';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Submit a new MRV report (Uploaders only)
router.post('/mrv', authenticateToken, requireRole(['UPLOADER']), upload.single('file'), submitMRVReport);

// Get reports
router.get('/', authenticateToken, getReports);

export default router;
