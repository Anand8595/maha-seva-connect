import express from 'express';
import {
  createApplication,
  trackApplication,
  getAllApplications,
  updateApplicationStage,
  uploadMissingDocs,
  subscribeApplicationsStream,
  sendDocumentToClient,
} from '../controllers/applicationController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/stream', subscribeApplicationsStream);
router.post('/', createApplication);
router.get('/track', trackApplication);
router.get('/', getAllApplications);
router.get('/all', getAllApplications);
router.put('/:id/stage', updateApplicationStage);
router.post('/:id/upload-missing', uploadMissingDocs);
router.post('/:id/send-document', sendDocumentToClient);

export default router;
