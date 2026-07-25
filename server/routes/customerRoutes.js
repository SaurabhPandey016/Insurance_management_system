import express from 'express';
import { customerController } from '../controllers/customerController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', restrictTo('AGENT', 'ADMIN'), customerController.registerCustomerByAgent);
router.get('/', restrictTo('AGENT', 'ADMIN'), customerController.getCustomersList);
router.get('/:id', customerController.getCustomerDetails);
router.put('/:id', customerController.updateCustomerProfile);

export default router;
