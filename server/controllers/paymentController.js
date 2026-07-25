import { PaymentModel } from '../models/Payment.js';
import { PolicyModel } from '../models/Policy.js';
import { UserModel } from '../models/User.js';
import { generatePremiumReceipt } from '../utils/pdfGenerator.js';
import { processPaymentSchema } from '../utils/validation.js';

export const paymentController = {
  async getPaymentsList(req, res, next) {
    try {
      // Dynamic routine to sync overdue payment states on load
      await PaymentModel.checkOverduePayments();

      const status = req.query.status;
      const customerId = req.query.customerId;

      const filters = {};
      if (status) filters.status = status;
      if (customerId) filters.customerId = customerId;

      // Restrict customer role to only view their own payments
      if (req.user.role === 'CUSTOMER') {
        filters.customerId = req.user.id;
      }

      // Restrict agent role to view payments of policies they manage
      const agentId = req.user.role === 'AGENT' ? req.user.id : null;

      const payments = await PaymentModel.getPayments(filters, agentId);

      return res.json({
        success: true,
        payments,
      });
    } catch (error) {
      next(error);
    }
  },

  async getPaymentDetails(req, res, next) {
    try {
      const paymentId = req.params.id;
      const payment = await PaymentModel.getPaymentById(paymentId);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Payment record not found.",
        });
      }

      // Restrict customer to only view their own payments
      if (req.user.role === 'CUSTOMER' && payment.policy.customer.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to view this payment record.",
        });
      }

      return res.json({
        success: true,
        payment,
      });
    } catch (error) {
      next(error);
    }
  },

  async processPremiumPayment(req, res, next) {
    try {
      const parsedData = processPaymentSchema.parse(req.body);

      // Verify payment installment exists and is pending
      const payment = await PaymentModel.getPaymentById(parsedData.paymentId);
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Payment installment record not found.",
        });
      }

      if (payment.status === 'PAID') {
        return res.status(400).json({
          success: false,
          message: "This premium installment has already been paid.",
        });
      }

      // Restrict: customer can only pay their own premium
      if (req.user.role === 'CUSTOMER' && payment.policy.customer.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to pay this policy premium.",
        });
      }

      // Generate random transaction ID
      const transactionId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;

      // Construct temporary payment object for PDF receipt generation
      const updatedPaymentPlaceholder = {
        ...payment,
        transactionId,
        paymentMethod: parsedData.paymentMethod,
        paymentDate: new Date(),
      };

      // Generate Invoice/Receipt PDF
      // We load the full customer user data to print names on receipt
      const customerUser = await UserModel.findUserById(payment.policy.customer.userId);

      const receiptPath = await generatePremiumReceipt(
        updatedPaymentPlaceholder,
        payment.policy,
        customerUser
      );

      // Record payment transaction in db with the generated receipt path
      const paidRecord = await PaymentModel.recordPayment(parsedData.paymentId, {
        transactionId,
        paymentMethod: parsedData.paymentMethod,
        invoicePdfPath: receiptPath,
      });

      return res.json({
        success: true,
        message: "Premium payment processed successfully, and receipt is available for download.",
        payment: paidRecord,
      });
    } catch (error) {
      next(error);
    }
  }
};
