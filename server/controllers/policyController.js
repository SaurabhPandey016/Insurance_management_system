import { PolicyModel } from '../models/Policy.js';
import { PaymentModel } from '../models/Payment.js';
import { UserModel } from '../models/User.js';
import { policyTypeSchema, issuePolicySchema } from '../utils/validation.js';

export const policyController = {
  // Policy Templates
  async createPolicyType(req, res, next) {
    try {
      const parsedData = policyTypeSchema.parse(req.body);

      const template = await PolicyModel.createPolicyType(parsedData);

      return res.status(201).json({
        success: true,
        message: "Policy template created successfully.",
        template,
      });
    } catch (error) {
      next(error);
    }
  },

  async getPolicyTypesList(req, res, next) {
    try {
      const templates = await PolicyModel.getPolicyTypes();
      return res.json({
        success: true,
        templates,
      });
    } catch (error) {
      next(error);
    }
  },

  // Issued Policies
  async issuePolicy(req, res, next) {
    try {
      const parsedData = issuePolicySchema.parse(req.body);

      // Verify policy type template exists
      const template = await PolicyModel.getPolicyTypeById(parsedData.policyTypeId);
      if (!template) {
        return res.status(404).json({
          success: false,
          message: "Policy template not found.",
        });
      }

      // Check if start date is before end date
      if (parsedData.startDate >= parsedData.endDate) {
        return res.status(400).json({
          success: false,
          message: "Start date must be earlier than end date.",
        });
      }

      // Populate premium and coverage defaults if not specified
      const premiumAmount = parsedData.premiumAmount ?? template.basePremium;
      const coverageAmount = parsedData.coverageAmount ?? template.coverageLimit;

      // Generate unique policy number
      const policyNumber = `POL-${Math.floor(100000 + Math.random() * 900000)}`;

      const policy = await PolicyModel.issueCustomerPolicy({
        policyNumber,
        customerId: parsedData.customerId, // points to User.id
        policyTypeId: parsedData.policyTypeId,
        premiumAmount,
        coverageAmount,
        startDate: parsedData.startDate,
        endDate: parsedData.endDate,
        createdById: req.user.id,
      });

      // Automatically generate monthly payments based on policy terms
      const months = template.termsMonths;
      const monthlyAmount = premiumAmount / months;
      const startDateObj = new Date(parsedData.startDate);

      for (let i = 0; i < months; i++) {
        // Calculate due date (each month from start date)
        const dueDate = new Date(startDateObj);
        dueDate.setMonth(startDateObj.getMonth() + i);

        await PaymentModel.createPayment({
          policyId: policy.id,
          amount: parseFloat(monthlyAmount.toFixed(2)),
          dueDate,
        });
      }

      return res.status(201).json({
        success: true,
        message: "Policy issued successfully, and payment installments generated.",
        policy,
      });
    } catch (error) {
      next(error);
    }
  },

  async getPoliciesList(req, res, next) {
    try {
      const status = req.query.status;
      const customerId = req.query.customerId;
      
      // Filter options
      const filters = {};
      if (status) filters.status = status;
      if (customerId) filters.customerId = customerId;

      // Restrict customer role from viewing others' policies
      if (req.user.role === 'CUSTOMER') {
        filters.customerId = req.user.id;
      }

      // If agent is logged in, they can view policies they created or policies of customers they registered
      const agentId = req.user.role === 'AGENT' ? req.user.id : null;

      const policies = await PolicyModel.getPolicies(filters, agentId);

      return res.json({
        success: true,
        policies,
      });
    } catch (error) {
      next(error);
    }
  },

  async getPolicyDetails(req, res, next) {
    try {
      const policyId = req.params.id;
      const policy = await PolicyModel.getPolicyById(policyId);

      if (!policy) {
        return res.status(404).json({
          success: false,
          message: "Policy record not found.",
        });
      }

      // Restrict: Customer can only view their own policy
      if (req.user.role === 'CUSTOMER' && policy.customer.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to view this policy details.",
        });
      }

      return res.json({
        success: true,
        policy,
      });
    } catch (error) {
      next(error);
    }
  },

  async renewPolicy(req, res, next) {
    try {
      const policyId = req.params.id;
      const { premiumAmount, durationMonths } = req.body;

      const policy = await PolicyModel.getPolicyById(policyId);
      if (!policy) {
        return res.status(404).json({
          success: false,
          message: "Policy not found.",
        });
      }

      const months = durationMonths ?? policy.policyType.termsMonths;
      const premium = premiumAmount ?? policy.premiumAmount;

      const newEndDate = new Date(policy.endDate);
      newEndDate.setMonth(newEndDate.getMonth() + months);

      const renewed = await PolicyModel.renewPolicy(policyId, {
        premiumAmount: premium,
        endDate: newEndDate,
      });

      // Generate new payment installments for the renewal duration
      const monthlyAmount = premium / months;
      const currentEndDateObj = new Date(policy.endDate);

      for (let i = 0; i < months; i++) {
        const dueDate = new Date(currentEndDateObj);
        dueDate.setMonth(currentEndDateObj.getMonth() + i);

        await PaymentModel.createPayment({
          policyId: policyId,
          amount: parseFloat(monthlyAmount.toFixed(2)),
          dueDate,
        });
      }

      return res.json({
        success: true,
        message: "Policy renewed successfully, and renewal payment installments generated.",
        policy: renewed,
      });
    } catch (error) {
      next(error);
    }
  },

  async cancelPolicy(req, res, next) {
    try {
      const policyId = req.params.id;
      
      const policy = await PolicyModel.getPolicyById(policyId);
      if (!policy) {
        return res.status(404).json({
          success: false,
          message: "Policy not found.",
        });
      }

      const updated = await PolicyModel.updatePolicyStatus(policyId, 'CANCELLED');

      return res.json({
        success: true,
        message: "Policy cancelled successfully.",
        policy: updated,
      });
    } catch (error) {
      next(error);
    }
  }
};
