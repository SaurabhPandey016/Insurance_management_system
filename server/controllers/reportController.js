import prisma from '../db.js';

export const reportController = {
  async getDashboardOverview(req, res, next) {
    try {
      const isAgent = req.user.role === 'AGENT';
      const agentId = req.user.id;

      // 1. Policy Metrics (Active vs Expired vs Cancelled)
      const policyCounts = await prisma.policy.groupBy({
        by: ['status'],
        where: isAgent ? {
          OR: [
            { createdById: agentId },
            { customer: { agentId: agentId } }
          ]
        } : {},
        _count: { _all: true },
      });

      const policyMetrics = {
        ACTIVE: 0,
        EXPIRED: 0,
        CANCELLED: 0,
        RENEWING: 0,
      };

      policyCounts.forEach((group) => {
        policyMetrics[group.status] = group._count._all;
      });

      // 2. Claim Metrics (Approved, Pending, Rejected, Under Review)
      const claimCounts = await prisma.claim.groupBy({
        by: ['status'],
        where: isAgent ? {
          OR: [
            { policy: { createdById: agentId } },
            { policy: { customer: { agentId: agentId } } }
          ]
        } : {},
        _count: { _all: true },
      });

      const claimMetrics = {
        PENDING: 0,
        UNDER_REVIEW: 0,
        APPROVED: 0,
        REJECTED: 0,
      };

      claimCounts.forEach((group) => {
        claimMetrics[group.status] = group._count._all;
      });

      // 3. Premium Revenue Metrics
      const totalRevenuePaid = await prisma.payment.aggregate({
        where: {
          status: 'PAID',
          ...(isAgent ? {
            policy: {
              OR: [
                { createdById: agentId },
                { customer: { agentId: agentId } }
              ]
            }
          } : {})
        },
        _sum: { amount: true },
        _count: { _all: true },
      });

      const totalRevenueUnpaid = await prisma.payment.aggregate({
        where: {
          status: { in: ['PENDING', 'OVERDUE'] },
          ...(isAgent ? {
            policy: {
              OR: [
                { createdById: agentId },
                { customer: { agentId: agentId } }
              ]
            }
          } : {})
        },
        _sum: { amount: true },
      });

      const collections = {
        totalCollected: totalRevenuePaid._sum.amount || 0,
        totalOutstanding: totalRevenueUnpaid._sum.amount || 0,
        paymentCount: totalRevenuePaid._count._all,
      };

      // 4. Customer growth (New customers registered)
      const customerCount = await prisma.user.count({
        where: {
          role: 'CUSTOMER',
          ...(isAgent ? {
            customerProfile: { agentId: agentId }
          } : {})
        }
      });

      return res.json({
        success: true,
        summary: {
          policyMetrics,
          claimMetrics,
          collections,
          totalCustomers: customerCount,
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async getMonthlyBusinessReport(req, res, next) {
    try {
      const isAgent = req.user.role === 'AGENT';
      const agentId = req.user.id;

      // Compile monthly trend analytics for the last 6 months
      const monthsData = [];
      const today = new Date();

      for (let i = 5; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const nextMonthDate = new Date(today.getFullYear(), today.getMonth() - i + 1, 1);

        const monthName = date.toLocaleString('default', { month: 'short', year: '2-digit' });

        // A. Sum premium collections in this month range
        const premiumSum = await prisma.payment.aggregate({
          where: {
            status: 'PAID',
            paymentDate: {
              gte: date,
              lt: nextMonthDate,
            },
            ...(isAgent ? {
              policy: {
                OR: [
                  { createdById: agentId },
                  { customer: { agentId: agentId } }
                ]
              }
            } : {})
          },
          _sum: { amount: true },
        });

        // B. Total policies issued in this month range
        const policyCount = await prisma.policy.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextMonthDate,
            },
            ...(isAgent ? {
              OR: [
                { createdById: agentId },
                { customer: { agentId: agentId } }
              ]
            } : {})
          },
        });

        // C. Customer growth registered in this month
        const customerGrowth = await prisma.user.count({
          where: {
            role: 'CUSTOMER',
            createdAt: {
              gte: date,
              lt: nextMonthDate,
            },
            ...(isAgent ? {
              customerProfile: { agentId: agentId }
            } : {})
          },
        });

        // D. Claims submitted in this month
        const claimCount = await prisma.claim.count({
          where: {
            dateSubmitted: {
              gte: date,
              lt: nextMonthDate,
            },
            ...(isAgent ? {
              OR: [
                { policy: { createdById: agentId } },
                { policy: { customer: { agentId: agentId } } }
              ]
            } : {})
          },
        });

        monthsData.push({
          month: monthName,
          collected: premiumSum._sum.amount || 0,
          policiesIssued: policyCount,
          customerGrowth,
          claimsSubmitted: claimCount,
        });
      }

      return res.json({
        success: true,
        report: monthsData,
      });
    } catch (error) {
      next(error);
    }
  }
};
