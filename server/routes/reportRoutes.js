import express from 'express';
import { reportController } from '../controllers/reportController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('AGENT', 'ADMIN')); // Restricted to administrative or agent analytics

router.get('/overview', reportController.getDashboardOverview);
router.get('/monthly', reportController.getMonthlyBusinessReport);

export default router;
