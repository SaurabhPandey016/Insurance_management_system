import bcrypt from 'bcrypt';
import { UserModel } from '../models/User.js';
import { customerRegisterSchema } from '../utils/validation.js';

export const customerController = {
  async registerCustomerByAgent(req, res, next) {
    try {
      // Validate customer details
      const parsedData = customerRegisterSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await UserModel.findUserByEmail(parsedData.email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email is already registered.",
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(parsedData.password, 10);

      // Create User with CUSTOMER role
      const user = await UserModel.createUser({
        email: parsedData.email,
        password: hashedPassword,
        role: 'CUSTOMER',
        name: parsedData.name,
        phone: parsedData.phone,
      });

      // Create Customer Profile with registering agent Id
      // Registering agentId is req.user.id (either AGENT or ADMIN)
      const agentId = req.user.role === 'AGENT' ? req.user.id : null;

      const profile = await UserModel.createCustomerProfile({
        userId: user.id,
        address: parsedData.address,
        dob: parsedData.dob,
        agentId,
      });

      return res.status(201).json({
        success: true,
        message: "Customer registered successfully.",
        customer: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          profileId: profile.id,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async getCustomersList(req, res, next) {
    try {
      const search = req.query.search || '';
      // If agent is logged in, restrict customer listing to agent's customers or show all?
      // Let's show all but highlight them, or restrict depending on role if desired.
      // Admin gets all. Agent gets all or just their registered customers. Let's allow agents to see all customers so they can search and manage them, but restrict if specified.
      // We can pass agentId to searchCustomers only if agent wants to view "My Customers". Let's use a query parameter `myCustomers=true`.
      const agentId = (req.user.role === 'AGENT' && req.query.myCustomers === 'true') ? req.user.id : null;

      const customers = await UserModel.searchCustomers(search, agentId);

      return res.json({
        success: true,
        customers: customers.map((c) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone || 'N/A',
          address: c.customerProfile?.address || 'N/A',
          dob: c.customerProfile?.dob || null,
          agentName: c.customerProfile?.agent?.name || 'Self Registered',
          createdAt: c.createdAt,
        })),
      });
    } catch (error) {
      next(error);
    }
  },

  async getCustomerDetails(req, res, next) {
    try {
      const customerId = req.params.id;

      // Restrict customers from viewing other customers' profiles
      if (req.user.role === 'CUSTOMER' && req.user.id !== customerId) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to view this customer's profile.",
        });
      }

      const history = await UserModel.getCustomerHistory(customerId);
      if (!history) {
        return res.status(404).json({
          success: false,
          message: "Customer not found.",
        });
      }

      return res.json({
        success: true,
        customer: {
          id: history.id,
          name: history.name,
          email: history.email,
          phone: history.phone || 'N/A',
          address: history.customerProfile?.address || 'N/A',
          dob: history.customerProfile?.dob || null,
          policies: history.customerProfile?.policies || [],
          claims: history.claimsSubmitted || [],
          documents: history.documents || [],
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async updateCustomerProfile(req, res, next) {
    try {
      const customerId = req.params.id;

      // Restrict: Customer can only update their own profile. Agent/Admin can update any.
      if (req.user.role === 'CUSTOMER' && req.user.id !== customerId) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to update this customer's profile.",
        });
      }

      const { name, phone, address, dob } = req.body;

      const updated = await UserModel.updateCustomerInfo(customerId, {
        name,
        phone,
        address,
        dob: dob ? new Date(dob) : undefined,
      });

      return res.json({
        success: true,
        message: "Profile updated successfully.",
        customer: {
          id: updated.id,
          name: updated.name,
          email: updated.email,
          phone: updated.phone,
          address: updated.customerProfile?.address,
          dob: updated.customerProfile?.dob,
        },
      });
    } catch (error) {
      next(error);
    }
  }
};
