import express from 'express';
import { claimController } from '../controllers/claimController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', restrictTo('CUSTOMER'), claimController.submitClaim);
router.get('/', claimController.getClaimsList);
router.get('/:id', claimController.getClaimDetails);
router.post('/:id/review', restrictTo('AGENT', 'ADMIN'), claimController.reviewClaim);

export default router;
