import prisma from '../db.js';

export const PaymentModel = {
  async createPayment({ policyId, amount, dueDate }) {
    return prisma.payment.create({
      data: {
        policyId,
        amount,
        dueDate,
        status: 'PENDING',
      },
    });
  },

  async getPayments(filters = {}, agentId = null) {
    const whereClause = {};

    if (filters.status) {
      whereClause.status = filters.status;
    }
    if (filters.customerId) {
      whereClause.policy = {
        customer: {
          userId: filters.customerId,
        },
      };
    }
    if (agentId) {
      whereClause.policy = {
        OR: [
          { createdById: agentId },
          { customer: { agentId: agentId } }
        ]
      };
    }

    return prisma.payment.findMany({
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
      },
      orderBy: [
        { status: 'asc' }, // show PENDING/OVERDUE first
        { dueDate: 'asc' }
      ],
    });
  },

  async getPaymentById(id) {
    return prisma.payment.findUnique({
      where: { id },
      include: {
        policy: {
          include: {
            policyType: true,
            customer: {
              include: {
                user: {
                  select: { id: true, name: true, email: true, phone: true }
                }
              }
            }
          },
        },
      },
    });
  },

  async recordPayment(id, { transactionId, paymentMethod, invoicePdfPath }) {
    return prisma.payment.update({
      where: { id },
      data: {
        transactionId,
        paymentMethod,
        invoicePdfPath,
        paymentDate: new Date(),
        status: 'PAID',
      },
      include: {
        policy: {
          include: {
            policyType: true,
            customer: {
              include: {
                user: {
                  select: { id: true, name: true, email: true, phone: true }
                }
              }
            }
          },
        },
      },
    });
  },

  async checkOverduePayments() {
    const today = new Date();
    // Update all PENDING payments where dueDate < today to OVERDUE
    return prisma.payment.updateMany({
      where: {
        status: 'PENDING',
        dueDate: { lt: today },
      },
      data: {
        status: 'OVERDUE',
      },
    });
  }
};
