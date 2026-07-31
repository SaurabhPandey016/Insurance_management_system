import prisma from '../db.js';
import bcrypt from 'bcrypt';

export const adminController = {
  // GET /api/admin/employees
  async getEmployees(req, res, next) {
    try {
      const employees = await prisma.user.findMany({
        where: {
          role: {
            in: ['AGENT', 'ADMIN'],
          },
        },
        include: {
          agentProfile: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return res.json({
        success: true,
        employees,
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/admin/employees
  async createEmployee(req, res, next) {
    try {
      const { name, email, password, role, phone, department, agentCode } = req.body;

      if (!name || !email || !password || !role) {
        return res.status(400).json({
          success: false,
          message: 'Please provide all required fields (name, email, password, role).',
        });
      }

      if (role !== 'AGENT' && role !== 'ADMIN') {
        return res.status(400).json({
          success: false,
          message: 'Invalid role. Role must be either AGENT or ADMIN.',
        });
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'An employee with this email is already registered.',
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      let createdUser;

      if (role === 'AGENT') {
        const code = agentCode || `AGT-${Math.floor(100000 + Math.random() * 900000)}`;
        
        // Check if agentCode is unique
        const existingProfile = await prisma.agentProfile.findUnique({
          where: { agentCode: code },
        });

        if (existingProfile) {
          return res.status(400).json({
            success: false,
            message: `Agent code ${code} is already in use.`,
          });
        }

        createdUser = await prisma.$transaction(async (tx) => {
          const user = await tx.user.create({
            data: {
              name,
              email,
              password: hashedPassword,
              role,
              phone: phone || null,
            },
          });

          await tx.agentProfile.create({
            data: {
              userId: user.id,
              agentCode: code,
              department: department || 'General Insurance',
              status: 'ACTIVE',
            },
          });

          return tx.user.findUnique({
            where: { id: user.id },
            include: { agentProfile: true },
          });
        });
      } else {
        // ADMIN role
        createdUser = await prisma.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            role,
            phone: phone || null,
          },
        });
      }

      return res.status(201).json({
        success: true,
        message: `${role} account registered successfully.`,
        employee: {
          id: createdUser.id,
          name: createdUser.name,
          email: createdUser.email,
          role: createdUser.role,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // PUT /api/admin/employees/:id
  async updateEmployee(req, res, next) {
    try {
      const { id } = req.params;
      const { name, phone, department, agentCode, status } = req.body;

      const user = await prisma.user.findUnique({
        where: { id },
        include: { agentProfile: true },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found.',
        });
      }

      // Perform update
      const updatedUser = await prisma.$transaction(async (tx) => {
        const u = await tx.user.update({
          where: { id },
          data: {
            name: name !== undefined ? name : undefined,
            phone: phone !== undefined ? phone : undefined,
          },
        });

        if (user.role === 'AGENT' && user.agentProfile) {
          await tx.agentProfile.update({
            where: { userId: id },
            data: {
              department: department !== undefined ? department : undefined,
              agentCode: agentCode !== undefined ? agentCode : undefined,
              status: status !== undefined ? status : undefined,
            },
          });
        }

        return tx.user.findUnique({
          where: { id },
          include: { agentProfile: true },
        });
      });

      return res.json({
        success: true,
        message: 'Employee details updated successfully.',
        employee: updatedUser,
      });
    } catch (err) {
      next(err);
    }
  },

  // DELETE /api/admin/employees/:id
  async deleteEmployee(req, res, next) {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found.',
        });
      }

      // Prevent admin from deleting themselves
      if (user.id === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Self-deletion of an active administrative account is blocked.',
        });
      }

      await prisma.user.delete({
        where: { id },
      });

      return res.json({
        success: true,
        message: 'Employee account deleted successfully.',
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/admin/settings
  async getSettings(req, res, next) {
    try {
      const dbSettings = await prisma.systemSetting.findMany();
      
      const settingsObj = {};
      dbSettings.forEach((item) => {
        settingsObj[item.key] = item.value;
      });

      // Default system parameters if empty
      const defaults = {
        systemName: 'InsuraShield',
        supportPhone: '+91 8720026790',
        supportEmail: 'developersaurabh04@gmail.com',
        gracePeriodDays: '15',
        currencySymbol: '$',
      };

      const finalSettings = { ...defaults, ...settingsObj };

      return res.json({
        success: true,
        settings: finalSettings,
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/admin/settings
  async updateSettings(req, res, next) {
    try {
      const settings = req.body;

      if (!settings || typeof settings !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Invalid settings body payload.',
        });
      }

      // Run upserts for each key in transaction
      await prisma.$transaction(
        Object.entries(settings).map(([key, value]) => {
          return prisma.systemSetting.upsert({
            where: { key },
            update: { value: String(value) },
            create: { key, value: String(value) },
          });
        })
      );

      return res.json({
        success: true,
        message: 'System settings updated successfully.',
      });
    } catch (err) {
      next(err);
    }
  },
};
