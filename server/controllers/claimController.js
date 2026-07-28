import { ClaimModel } from '../models/Claim.js';
import { PolicyModel } from '../models/Policy.js';
import { fileClaimSchema, reviewClaimSchema } from '../utils/validation.js';

export const claimController = {
  async submitClaim(req, res, next) {
    try {
      const parsedData = fileClaimSchema.parse(req.body);

      // Verify the policy exists and belongs to the customer
      const policy = await PolicyModel.getPolicyById(parsedData.policyId);
      if (!policy) {
        return res.status(404).json({
          success: false,
          message: "Policy record not found.",
        });
      }

      // Check if policy belongs to current user
      if (policy.customer.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "You can only file claims against your own policies.",
        });
      }

      // Check if policy is active
      if (policy.status !== 'ACTIVE') {
        return res.status(400).json({
          success: false,
          message: "You cannot file a claim against an inactive, expired, or cancelled policy.",
        });
      }

      // Generate unique claim number
      const claimNumber = `CLM-${Math.floor(100000 + Math.random() * 900000)}`;

      const claim = await ClaimModel.createClaim({
        claimNumber,
        policyId: parsedData.policyId,
        customerId: req.user.id, // points to User.id
        amountRequested: parsedData.amountRequested,
        description: parsedData.description,
        documentId: parsedData.documentId,
      });

      return res.status(201).json({
        success: true,
        message: "Claim submitted successfully and is pending review.",
        claim,
      });
    } catch (error) {
      next(error);
    }
  },

  async getClaimsList(req, res, next) {
    try {
      const status = req.query.status;
      const customerId = req.query.customerId;

      const filters = {};
      if (status) filters.status = status;
      if (customerId) filters.customerId = customerId;

      // Restrict customer role to only view their own claims
      if (req.user.role === 'CUSTOMER') {
        filters.customerId = req.user.id;
      }

      // Agent filter restriction
      const agentId = req.user.role === 'AGENT' ? req.user.id : null;

      const claims = await ClaimModel.getClaims(filters, agentId);

      return res.json({
        success: true,
        claims,
      });
    } catch (error) {
      next(error);
    }
  },

  async getClaimDetails(req, res, next) {
    try {
      const claimId = req.params.id;
      const claim = await ClaimModel.getClaimById(claimId);

      if (!claim) {
        return res.status(404).json({
          success: false,
          message: "Claim record not found.",
        });
      }

      // Restrict customer role to only view their own claim
      if (req.user.role === 'CUSTOMER' && claim.customerId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to view this claim.",
        });
      }

      return res.json({
        success: true,
        claim,
      });
    } catch (error) {
      next(error);
    }
  },

  async reviewClaim(req, res, next) {
    try {
      const claimId = req.params.id;
      const parsedData = reviewClaimSchema.parse(req.body);

      // Verify claim exists
      const claim = await ClaimModel.getClaimById(claimId);
      if (!claim) {
        return res.status(404).json({
          success: false,
          message: "Claim record not found.",
        });
      }

      // Only Agents and Admins can review claims
      const reviewed = await ClaimModel.reviewClaim(claimId, {
        status: parsedData.status,
        remarks: parsedData.remarks || '',
        reviewedById: req.user.id,
      });

      return res.json({
        success: true,
        message: `Claim status updated to ${parsedData.status}.`,
        claim: reviewed,
      });
    } catch (error) {
      next(error);
    }
  }
};
