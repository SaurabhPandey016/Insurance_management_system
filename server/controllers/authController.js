import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User.js';
import { loginSchema, customerRegisterSchema } from '../utils/validation.js';

export const authController = {
  async registerCustomer(req, res, next) {
    try {
      // Validate input
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

      // Create user
      const user = await UserModel.createUser({
        email: parsedData.email,
        password: hashedPassword,
        role: 'CUSTOMER',
        name: parsedData.name,
        phone: parsedData.phone,
      });

      // Create customer profile
      await UserModel.createCustomerProfile({
        userId: user.id,
        address: parsedData.address,
        dob: parsedData.dob,
        agentId: null, // Self-registered customer has no registering agent initially
      });

      // Create JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: false, // Set to true in production if running on HTTPS
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      return res.status(201).json({
        success: true,
        message: "Customer registered successfully.",
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      // Validate input
      const parsedData = loginSchema.parse(req.body);

      // Find user
      const user = await UserModel.findUserByEmail(parsedData.email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password.",
        });
      }

      // Check password
      const isMatch = await bcrypt.compare(parsedData.password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password.",
        });
      }

      // Check if user is active (applicable for agents/profiles if wanted)
      if (user.role === 'AGENT' && user.agentProfile?.status !== 'ACTIVE') {
        return res.status(403).json({
          success: false,
          message: "Your agent account has been suspended or deactivated.",
        });
      }

      // Create JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: false, // Set to true in production
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      return res.json({
        success: true,
        message: "Logged in successfully.",
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async logout(req, res, next) {
    try {
      res.clearCookie('token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
      });
      return res.json({
        success: true,
        message: "Logged out successfully.",
      });
    } catch (error) {
      next(error);
    }
  },

  async getMe(req, res, next) {
    try {
      // req.user is set by the protect middleware
      const user = await UserModel.findUserById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User profile not found.",
        });
      }

      return res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
          phone: user.phone,
          customerProfile: user.customerProfile,
          agentProfile: user.agentProfile,
        },
      });
    } catch (error) {
      next(error);
    }
  }
};
