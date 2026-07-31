import express from 'express';
import { adminController } from '../controllers/adminController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protect all admin endpoints and restrict to users with role ADMIN
router.use(protect);
router.use(restrictTo('ADMIN'));

// Staff/Employee Management
router.get('/employees', adminController.getEmployees);
router.post('/employees', adminController.createEmployee);
router.put('/employees/:id', adminController.updateEmployee);
router.delete('/employees/:id', adminController.deleteEmployee);

// System Settings Configuration
router.get('/settings', adminController.getSettings);
router.post('/settings', adminController.updateSettings);

export default router;
