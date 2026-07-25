import express from 'express';
import { paymentController } from '../controllers/paymentController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', paymentController.getPaymentsList);
router.get('/:id', paymentController.getPaymentDetails);
router.post('/checkout', restrictTo('CUSTOMER'), paymentController.processPremiumPayment);

export default router;
