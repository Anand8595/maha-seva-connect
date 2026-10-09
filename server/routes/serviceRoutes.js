import express from 'express';
import {
  getAllServices,
  getServiceBySlug,
  createService,
  updateService,
} from '../controllers/serviceController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllServices);
router.get('/:slug', getServiceBySlug);
router.post('/', protect, requireRole('admin'), createService);
router.put('/:id', protect, requireRole('admin'), updateService);

export default router;
