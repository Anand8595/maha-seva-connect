import express from 'express';
import {
  createApplication,
  trackApplication,
  getAllApplications,
  updateApplicationStage,
  uploadMissingDocs,
} from '../controllers/applicationController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/', createApplication);
router.get('/track', trackApplication);
router.get('/', protect, requireRole('admin'), getAllApplications);
router.put('/:id/stage', protect, requireRole('admin'), updateApplicationStage);
router.post('/:id/upload-missing', uploadMissingDocs);

export default router;
