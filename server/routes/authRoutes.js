import express from 'express';
import { authController } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', authController.registerCustomer);
router.post('/login', authController.login);
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);

export default router;
