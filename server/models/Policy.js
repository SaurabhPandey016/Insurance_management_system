import prisma from '../db.js';

export const PolicyModel = {
  // Policy Templates (PolicyType)
  async createPolicyType(data) {
    return prisma.policyType.create({ data });
  },

  async getPolicyTypes() {
    return prisma.policyType.findMany({
      orderBy: { name: 'asc' },
    });
  },

  async getPolicyTypeById(id) {
    return prisma.policyType.findUnique({
      where: { id },
    });
  },

  // Issued Customer Policies (Policy)
  async issueCustomerPolicy({
    policyNumber,
    customerId,
    policyTypeId,
    premiumAmount,
    coverageAmount,
    startDate,
    endDate,
    createdById,
  }) {
    // Note: customerId points to CustomerProfile ID, so we need to find the CustomerProfile first or use user's userId
    // Let's resolve the customerProfile first to query it
    const profile = await prisma.customerProfile.findUnique({
      where: { userId: customerId },
    });

    if (!profile) {
      throw new Error(`No customer profile found for user ID: ${customerId}`);
    }

    return prisma.policy.create({
      data: {
        policyNumber,
        customerId: profile.id, // Linked to CustomerProfile.id
        policyTypeId,
        premiumAmount,
        coverageAmount,
        startDate,
        endDate,
        createdById,
      },
      include: {
        policyType: true,
        customer: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });
  },

  async getPolicies(filters = {}, agentId = null) {
    const whereClause = {};

    if (filters.status) {
      whereClause.status = filters.status;
    }
    if (filters.customerId) {
      const profile = await prisma.customerProfile.findUnique({
        where: { userId: filters.customerId },
      });
      if (profile) {
        whereClause.customerId = profile.id;
      } else {
        return []; // customer doesn't exist, return empty
      }
    }
    if (agentId) {
      // If agent is logged in, show policies created by them, OR policies belonging to customers they manage
      whereClause.OR = [
        { createdById: agentId },
        { customer: { agentId: agentId } }
      ];
    }

    return prisma.policy.findMany({
      where: whereClause,
      include: {
        policyType: true,
        customer: {
          include: {
            user: {
              select: { id: true, name: true, email: true, phone: true }
            }
          }
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getPolicyById(id) {
    return prisma.policy.findUnique({
      where: { id },
      include: {
        policyType: true,
        customer: {
          include: {
            user: {
              select: { id: true, name: true, email: true, phone: true }
            }
          }
        },
        payments: {
          orderBy: { dueDate: 'asc' },
        },
        claims: {
          orderBy: { dateSubmitted: 'desc' },
        },
        documents: true,
      },
    });
  },

  async updatePolicyStatus(id, status) {
    return prisma.policy.update({
      where: { id },
      data: { status },
      include: { policyType: true },
    });
  },

  async renewPolicy(id, { premiumAmount, endDate }) {
    return prisma.policy.update({
      where: { id },
      data: {
        premiumAmount,
        endDate,
        status: 'ACTIVE',
      },
      include: { policyType: true },
    });
  }
};
