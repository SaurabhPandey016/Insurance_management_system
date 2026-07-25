import express from 'express';
import { policyController } from '../controllers/policyController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Templates (Admin Only for creating, all authenticated roles can read)
router.post('/templates', restrictTo('ADMIN'), policyController.createPolicyType);
router.get('/templates', policyController.getPolicyTypesList);

// Issued Policies
router.post('/', restrictTo('AGENT', 'ADMIN'), policyController.issuePolicy);
router.get('/', policyController.getPoliciesList);
router.get('/:id', policyController.getPolicyDetails);
router.post('/:id/renew', restrictTo('AGENT', 'ADMIN'), policyController.renewPolicy);
router.post('/:id/cancel', restrictTo('AGENT', 'ADMIN'), policyController.cancelPolicy);

export default router;
