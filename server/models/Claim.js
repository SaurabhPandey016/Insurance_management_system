import prisma from '../db.js';

export const ClaimModel = {
  async createClaim({ claimNumber, policyId, customerId, amountRequested, description }) {
    return prisma.claim.create({
      data: {
        claimNumber,
        policyId,
        customerId, // points to User.id
        amountRequested,
        description,
        status: 'PENDING',
      },
      include: {
        policy: {
          include: {
            policyType: true,
          },
        },
      },
    });
  },

  async getClaims(filters = {}, agentId = null) {
    const whereClause = {};

    if (filters.status) {
      whereClause.status = filters.status;
    }
    if (filters.customerId) {
      whereClause.customerId = filters.customerId;
    }
    if (agentId) {
      // If agent is checking, show claims for policies they manage, or claims they reviewed
      whereClause.OR = [
        { policy: { createdById: agentId } },
        { policy: { customer: { agentId: agentId } } },
        { reviewedById: agentId }
      ];
    }

    return prisma.claim.findMany({
      where: whereClause,
      include: {
        policy: {
          include: {
            policyType: true,
            customer: {
              include: {
                user: {
                  select: { name: true, email: true }
                }
              }
            }
          },
        },
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        reviewedBy: {
          select: { name: true },
        },
        documents: true,
      },
      orderBy: { dateSubmitted: 'desc' },
    });
  },

  async getClaimById(id) {
    return prisma.claim.findUnique({
      where: { id },
      include: {
        policy: {
          include: {
            policyType: true,
            customer: {
              include: {
                user: {
                  select: { name: true, email: true, phone: true }
                }
              }
            }
          },
        },
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        reviewedBy: {
          select: { name: true },
        },
        documents: true,
      },
    });
  },

  async reviewClaim(id, { status, remarks, reviewedById }) {
    return prisma.claim.update({
      where: { id },
      data: {
        status,
        remarks,
        reviewedById,
        dateProcessed: new Date(),
      },
      include: {
        policy: {
          include: {
            policyType: true,
            customer: {
              include: {
                user: {
                  select: { name: true, email: true }
                }
              }
            }
          }
        }
      }
    });
  }
};
