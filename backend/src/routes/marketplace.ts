import { Router } from 'express';
import { getAvailableProjects, purchaseCredits, getBuyerPortfolio } from '../controllers/marketplace';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Publicly or generally accessible to authenticated users (even UPLOADERS can browse)
router.get('/projects', authenticateToken, getAvailableProjects);

// Strictly BUYER actions
router.post('/purchase', authenticateToken, requireRole(['BUYER']), purchaseCredits);
router.get('/portfolio', authenticateToken, requireRole(['BUYER']), getBuyerPortfolio);

export default router;
