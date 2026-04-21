import express from 'express';
import {
  getPackages,
  getPackageById,
  getPackagesByCategory,
  getPopularPackages
} from '../controllers/packageController.js';

const router = express.Router();

// Public routes
router.get('/', getPackages);
router.get('/popular', getPopularPackages);
router.get('/category/:category', getPackagesByCategory);
router.get('/:id', getPackageById);

export default router;