import { z } from 'zod';

// Authentication & Users
export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
});

export const customerRegisterSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  phone: z.string().optional(),
  address: z.string().optional(),
  dob: z.string().transform((val) => new Date(val)).optional(),
});

export const agentRegisterSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  phone: z.string().min(10, { message: "Phone must be at least 10 digits" }),
  agentCode: z.string().min(3, { message: "Agent Code is required" }),
  department: z.string().optional(),
});

// Policies
export const policyTypeSchema = z.object({
  name: z.string().min(3, { message: "Policy name must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  basePremium: z.number().positive({ message: "Base premium must be positive" }),
  coverageLimit: z.number().positive({ message: "Coverage limit must be positive" }),
  termsMonths: z.number().int().positive({ message: "Terms in months must be a positive integer" }),
});

export const issuePolicySchema = z.object({
  customerId: z.string().uuid({ message: "Invalid customer user ID" }),
  policyTypeId: z.string().uuid({ message: "Invalid policy type ID" }),
  premiumAmount: z.number().positive({ message: "Premium amount must be positive" }).optional(),
  coverageAmount: z.number().positive({ message: "Coverage amount must be positive" }).optional(),
  startDate: z.string().transform((val) => new Date(val)),
  endDate: z.string().transform((val) => new Date(val)),
});

// Claims
export const fileClaimSchema = z.object({
  policyId: z.string().uuid({ message: "Invalid policy ID" }),
  amountRequested: z.number().positive({ message: "Claim amount must be positive" }),
  description: z.string().min(10, { message: "Please provide a detailed description of the claim" }),
});

export const reviewClaimSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'UNDER_REVIEW'], { message: "Invalid claim status" }),
  remarks: z.string().optional(),
});

// Payments
export const createPaymentSchema = z.object({
  policyId: z.string().uuid({ message: "Invalid policy ID" }),
  amount: z.number().positive({ message: "Payment amount must be positive" }),
  dueDate: z.string().transform((val) => new Date(val)),
});

export const processPaymentSchema = z.object({
  paymentId: z.string().uuid({ message: "Invalid payment record ID" }),
  paymentMethod: z.string().min(2, { message: "Payment method is required" }),
});
