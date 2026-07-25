import prisma from '../db.js';

export const UserModel = {
  async createUser({ email, password, role, name, phone }) {
    return prisma.user.create({
      data: { email, password, role, name, phone },
    });
  },

  async findUserByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        customerProfile: true,
        agentProfile: true,
      },
    });
  },

  async findUserById(id) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        customerProfile: {
          include: {
            agent: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        agentProfile: true,
      },
    });
  },

  async createCustomerProfile({ userId, address, dob, agentId }) {
    return prisma.customerProfile.create({
      data: { userId, address, dob, agentId },
    });
  },

  async updateCustomerInfo(userId, { name, phone, address, dob }) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        name,
        phone,
        customerProfile: {
          update: {
            address,
            dob,
          },
        },
      },
      include: {
        customerProfile: true,
      },
    });
  },

  async searchCustomers(searchQuery = '', agentId = null) {
    const whereClause = {
      role: 'CUSTOMER',
    };

    if (searchQuery) {
      whereClause.OR = [
        { name: { contains: searchQuery, mode: 'insensitive' } },
        { email: { contains: searchQuery, mode: 'insensitive' } },
        { phone: { contains: searchQuery, mode: 'insensitive' } },
      ];
    }

    if (agentId) {
      whereClause.customerProfile = {
        agentId: agentId,
      };
    }

    return prisma.user.findMany({
      where: whereClause,
      include: {
        customerProfile: {
          include: {
            agent: {
              select: { name: true }
            }
          }
        },
      },
      orderBy: { name: 'asc' },
    });
  },

  async getCustomerHistory(customerId) {
    return prisma.user.findUnique({
      where: { id: customerId },
      include: {
        customerProfile: {
          include: {
            policies: {
              include: {
                policyType: true,
              },
              orderBy: { startDate: 'desc' },
            },
          },
        },
        claimsSubmitted: {
          include: {
            policy: {
              include: {
                policyType: true,
              },
            },
          },
          orderBy: { dateSubmitted: 'desc' },
        },
        documents: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  },

  async getAgents() {
    return prisma.user.findMany({
      where: { role: 'AGENT' },
      include: {
        agentProfile: true,
      },
    });
  },

  async getAdminStats() {
    const totalCustomers = await prisma.user.count({ where: { role: 'CUSTOMER' } });
    const totalAgents = await prisma.user.count({ where: { role: 'AGENT' } });
    const totalPolicies = await prisma.policy.count();
    const activePolicies = await prisma.policy.count({ where: { status: 'ACTIVE' } });
    const pendingClaims = await prisma.claim.count({ where: { status: 'PENDING' } });
    
    // Revenue collection sum
    const totalRevenueSum = await prisma.payment.aggregate({
      where: { status: 'PAID' },
      _sum: { amount: true },
    });

    return {
      totalCustomers,
      totalAgents,
      totalPolicies,
      activePolicies,
      pendingClaims,
      totalRevenue: totalRevenueSum._sum.amount || 0,
    };
  }
};
