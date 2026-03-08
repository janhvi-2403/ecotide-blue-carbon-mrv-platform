import { Router } from 'express';
import { createProject, getProjects, getProjectById, updateProjectStatus, updateProject, deleteProject } from '../controllers/projects';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Routes for both Uploader and Admin
router.get('/', authenticateToken, getProjects);
router.get('/:id', authenticateToken, getProjectById);

// Routes specific to Uploader
router.post('/', authenticateToken, requireRole(['UPLOADER']), createProject);
router.put('/:id', authenticateToken, requireRole(['UPLOADER', 'ADMIN']), updateProject);
router.delete('/:id', authenticateToken, requireRole(['UPLOADER']), deleteProject);
router.patch('/:id/status', authenticateToken, requireRole(['UPLOADER']), updateProjectStatus);

export default router;
