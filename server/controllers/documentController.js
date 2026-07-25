import { DocumentModel } from '../models/Document.js';
import path from 'path';
import fs from 'fs';

export const documentController = {
  async uploadDocument(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file was uploaded.",
        });
      }

      const { title, fileType, policyId, claimId } = req.body;

      if (!title || !fileType) {
        // Cleanup file if metadata is missing to prevent storage leaks
        fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: "Title and fileType are required.",
        });
      }

      // Format relative path for static serving
      const relativePath = path.join('uploads', req.file.filename);

      const document = await DocumentModel.createDocument({
        title,
        filePath: relativePath,
        fileType,
        mimeType: req.file.mimetype,
        uploadedById: req.user.id, // logged in user ID
        policyId: policyId || null,
        claimId: claimId || null,
      });

      return res.status(201).json({
        success: true,
        message: "Document uploaded successfully.",
        document,
      });
    } catch (error) {
      next(error);
    }
  },

  async getDocumentsList(req, res, next) {
    try {
      const { fileType, policyId, claimId } = req.query;

      const filters = {};
      if (fileType) filters.fileType = fileType;
      if (policyId) filters.policyId = policyId;
      if (claimId) filters.claimId = claimId;

      // Restrict customer role to only view their uploaded documents or documents linked to their policies
      if (req.user.role === 'CUSTOMER') {
        filters.uploadedById = req.user.id;
      }

      const documents = await DocumentModel.getDocuments(filters);

      return res.json({
        success: true,
        documents,
      });
    } catch (error) {
      next(error);
    }
  },

  async downloadDocument(req, res, next) {
    try {
      const docId = req.params.id;
      const docRecord = await DocumentModel.getDocumentById(docId);

      if (!docRecord) {
        return res.status(404).json({
          success: false,
          message: "Document record not found.",
        });
      }

      // Restrict customer role
      if (req.user.role === 'CUSTOMER' && docRecord.uploadedById !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to download this file.",
        });
      }

      const absolutePath = path.join(process.cwd(), docRecord.filePath);
      
      if (!fs.existsSync(absolutePath)) {
        return res.status(404).json({
          success: false,
          message: "Physical file was not found on the server storage.",
        });
      }

      // Force file download in browser
      res.setHeader('Content-Type', docRecord.mimeType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${path.basename(docRecord.filePath)}"`);
      
      const fileStream = fs.createReadStream(absolutePath);
      fileStream.pipe(res);
    } catch (error) {
      next(error);
    }
  },

  async deleteDocument(req, res, next) {
    try {
      const docId = req.params.id;
      const docRecord = await DocumentModel.getDocumentById(docId);

      if (!docRecord) {
        return res.status(404).json({
          success: false,
          message: "Document not found.",
        });
      }

      // Restrict customer role
      if (req.user.role === 'CUSTOMER' && docRecord.uploadedById !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to delete this document.",
        });
      }

      // Delete physical file from uploads folder
      const absolutePath = path.join(process.cwd(), docRecord.filePath);
      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
      }

      // Delete metadata record from database
      await DocumentModel.deleteDocument(docId);

      return res.json({
        success: true,
        message: "Document deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  }
};
