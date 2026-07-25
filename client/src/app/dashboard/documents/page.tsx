'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import {
  FolderOpen,
  Plus,
  Activity,
  Calendar,
  AlertCircle,
  CheckCircle,
  Upload,
  Download,
  Trash2,
  FileCode,
  FileCheck,
  Loader2
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000/api';

export default function DocumentsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload Form states
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [title, setTitle] = useState('');
  const [fileType, setFileType] = useState('IDENTITY');
  const [file, setFile] = useState<File | null>(null);
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${API_URL}/documents`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) setDocuments(data.documents);
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !fileType || !file) {
      setError('Please provide a title, select a file type, and select a file.');
      return;
    }

    setSubmitting(true);
    setError('');
    setMessage('');

    // Prepare multipart form data
    const formData = new FormData();
    formData.append('title', title);
    formData.append('fileType', fileType);
    formData.append('file', file);

    try {
      const res = await fetch(`${API_URL}/documents/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        // Note: Fetch handles multipart boundary headers automatically if Content-Type is omitted!
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage('Document uploaded successfully to the vault.');
        setShowUploadForm(false);
        setTitle('');
        setFileType('IDENTITY');
        setFile(null);
        await fetchDocuments();
      } else {
        setError(data.message || 'File upload failed. Allowed formats: PDF, DOC, DOCX, JPG, PNG');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('Are you sure you want to permanently delete this document from the vault?')) return;
    setError('');
    setMessage('');

    try {
      const res = await fetch(`${API_URL}/documents/${docId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setMessage('Document deleted successfully.');
        await fetchDocuments();
      } else {
        setError(data.message || 'Failed to delete document.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Activity className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 border-b border-slate-900 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Document Vault</h1>
          <p className="text-sm text-slate-400 mt-1">Upload and manage identity papers or policy attachments securely</p>
        </div>
        <div>
          <button
            onClick={() => {
              setShowUploadForm(!showUploadForm);
              setError('');
              setMessage('');
            }}
            className="flex items-center space-x-2 rounded-xl bg-indigo-650 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-500 transition active:scale-[0.98]"
          >
            <Upload className="h-4 w-4" />
            <span>{showUploadForm ? 'Cancel Upload' : 'Upload File'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {message && (
        <div className="flex items-center space-x-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-450">
          <CheckCircle className="h-4.5 w-4.5" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-455">
          <AlertCircle className="h-4.5 w-4.5" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Upload Form */}
      {showUploadForm && (
        <form onSubmit={handleUpload} className="rounded-2xl border border-slate-900 bg-slate-900/20 p-6 space-y-4 max-w-xl animate-fadeIn">
          <h3 className="text-base font-bold text-slate-200 border-b border-slate-950 pb-2">Upload Vault File</h3>
          
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Document Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-700 focus:outline-none focus:border-indigo-500 transition"
              placeholder="e.g. Driver's License Copy"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">File Category *</label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
                className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                required
              >
                <option value="IDENTITY">Identity Verification</option>
                <option value="POLICY_DOC">Signed Contract Copy</option>
                <option value="CLAIM_SUPPORT">Claim Proof Support</option>
                <option value="OTHER">Other Miscellaneous</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Select File *</label>
              <input
                type="file"
                onChange={handleFileChange}
                className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20 file:cursor-pointer cursor-pointer border border-slate-800 bg-slate-950 rounded-lg p-1.5 focus:outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center space-x-1.5 rounded-lg bg-indigo-650 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-500 transition disabled:bg-indigo-700"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                <span>Uploading Vault File...</span>
              </>
            ) : (
              <>
                <Upload className="h-4.5 w-4.5" />
                <span>Upload Document</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* 2. Documents Grid */}
      <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-6 font-sans">
        <h3 className="text-base font-bold text-slate-200 mb-6">Vault Files</h3>
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3 rounded-xl bg-slate-950/40 border border-slate-900 text-center">
            <FolderOpen className="h-10 w-10 text-slate-650" />
            <p className="text-sm font-semibold text-slate-350">No files stored in this vault yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="rounded-xl bg-slate-950 p-5 border border-slate-900 flex flex-col justify-between space-y-4 hover:border-slate-800 transition duration-150"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                      {doc.fileType}
                    </span>
                    <span className="text-[10px] text-slate-500">{new Date(doc.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-100 truncate">{doc.title}</h4>
                  <p className="text-[11px] text-slate-500">Mime: {doc.mimeType || 'unknown'}</p>
                </div>

                <div className="border-t border-slate-900 pt-3 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">By: {doc.uploadedBy?.name} ({doc.uploadedBy?.role})</span>
                  <div className="flex items-center space-x-2">
                    <a
                      href={`${API_URL}/documents/${doc.id}/download`}
                      className="rounded-lg p-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition"
                      title="Download File"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </a>
                    {/* Delete available to customer (for their own files) or agent/admin */}
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="rounded-lg p-1.5 bg-rose-500/10 border border-rose-500/10 hover:border-rose-500 hover:bg-rose-500/20 text-rose-455 hover:text-rose-400 transition"
                      title="Delete File"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
