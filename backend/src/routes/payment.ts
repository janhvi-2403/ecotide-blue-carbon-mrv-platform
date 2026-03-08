import { Router } from 'express';
import { createPayPalOrder, capturePayPalPayment, verifyCryptoPayment } from '../controllers/payment';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Strictly BUYER actions
router.post('/paypal/create-order', authenticateToken, requireRole(['BUYER']), createPayPalOrder);
router.post('/paypal/capture', authenticateToken, requireRole(['BUYER']), capturePayPalPayment);
router.post('/crypto/verify', authenticateToken, requireRole(['BUYER']), verifyCryptoPayment);

export default router;
