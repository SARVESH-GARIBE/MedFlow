import express from 'express';
import {
  getLabTests,
  getLabTestById,
  getLabTestsByCategory,
  searchLabTests
} from '../controllers/labTestController.js';

const router = express.Router();

// Public routes
router.get('/', getLabTests);
router.get('/search', searchLabTests);
router.get('/category/:category', getLabTestsByCategory);
router.get('/:id', getLabTestById);

export default router;