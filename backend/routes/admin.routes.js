import express from 'express';
import {
  getUsers,
  getUserById,
  updateUserRole,
  verifyUser,
  rejectUser,
  getDashboardStats,
  createAdmin,
  getDoctors,
  approveDoctor,
  rejectDoctor
} from '../controllers/adminController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Dashboard Stats
// GET /api/v1/admin/dashboard
router.get('/dashboard', protect, authorize('super_admin', 'admin'), getDashboardStats);

// User Management
// GET /api/v1/admin/users
router.get('/users', protect, authorize('super_admin', 'admin'), getUsers);

// GET /api/v1/admin/users/:id
router.get('/users/:id', protect, authorize('super_admin', 'admin'), getUserById);

// POST /api/v1/admin/users
router.post('/users', protect, authorize('super_admin'), createAdmin);

// PUT /api/v1/admin/users/:id/role
router.put('/users/:id/role', protect, authorize('super_admin'), updateUserRole);

// PUT /api/v1/admin/users/:id/verify
router.put('/users/:id/verify', protect, authorize('super_admin', 'admin'), verifyUser);

// PUT /api/v1/admin/users/:id/reject
router.put('/users/:id/reject', protect, authorize('super_admin', 'admin'), rejectUser);

// Doctor Management
// GET /api/v1/admin/doctors
router.get('/doctors', protect, authorize('super_admin', 'admin'), getDoctors);

// PATCH /api/v1/admin/doctors/:id/verify
router.patch('/doctors/:id/verify', protect, authorize('super_admin', 'admin'), approveDoctor);

// PATCH /api/v1/admin/doctors/:id/reject
router.patch('/doctors/:id/reject', protect, authorize('super_admin', 'admin'), rejectDoctor);

export default router;