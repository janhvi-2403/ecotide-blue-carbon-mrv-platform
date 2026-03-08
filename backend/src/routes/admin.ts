import { Router } from 'express';
import { verifyReport, getUsers, toggleUserStatus, getAuditLogs, getAnalytics } from '../controllers/admin';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Secure all admin routes
router.use(authenticateToken, requireRole(['ADMIN']));

// User Management
router.get('/users', getUsers);
router.put('/users/:id/toggle', toggleUserStatus);

// Verification & Management
router.post('/verify-report/:reportId', verifyReport);

// Logs & Analytics
router.get('/audit-logs', getAuditLogs);
router.get('/analytics', getAnalytics);

export default router;
