import prisma from '../db.js';

export const DocumentModel = {
  async createDocument({ title, filePath, fileType, mimeType, uploadedById, policyId = null, claimId = null }) {
    return prisma.document.create({
      data: {
        title,
        filePath,
        fileType,
        mimeType,
        uploadedById,
        policyId,
        claimId,
      },
    });
  },

  async getDocuments(filters = {}) {
    const whereClause = {};

    if (filters.uploadedById) {
      whereClause.uploadedById = filters.uploadedById;
    }
    if (filters.policyId) {
      whereClause.policyId = filters.policyId;
    }
    if (filters.claimId) {
      whereClause.claimId = filters.claimId;
    }
    if (filters.fileType) {
      whereClause.fileType = filters.fileType;
    }

    return prisma.document.findMany({
      where: whereClause,
      include: {
        uploadedBy: {
          select: { name: true, role: true }
        },
        policy: {
          include: {
            policyType: true,
          }
        },
        claim: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getDocumentById(id) {
    return prisma.document.findUnique({
      where: { id },
    });
  },

  async deleteDocument(id) {
    return prisma.document.delete({
      where: { id },
    });
  }
};
