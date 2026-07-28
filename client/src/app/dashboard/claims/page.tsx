'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import {
  ShieldAlert,
  Plus,
  Activity,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Check,
  X,
  FileCheck,
  DollarSign,
  Download
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000/api';

export default function ClaimsPage() {
  const { user } = useAuth();
  const [claims, setClaims] = useState<any[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms states
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [selectedReviewClaim, setSelectedReviewClaim] = useState<any>(null);

  // Submit claim parameters
  const [policyId, setPolicyId] = useState('');
  const [amountRequested, setAmountRequested] = useState('');
  const [description, setDescription] = useState('');
  const [claimFile, setClaimFile] = useState<File | null>(null);

  // Review claim parameters
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      // 1. Fetch claims
      const claimsRes = await fetch(`${API_URL}/claims`, { credentials: 'include' });
      const claimsData = await claimsRes.json();
      if (claimsData.success) setClaims(claimsData.claims);

      // 2. Fetch active policies (only relevant for customer filing a claim)
      if (user && user.role === 'CUSTOMER') {
        const policiesRes = await fetch(`${API_URL}/policies?status=ACTIVE`, { credentials: 'include' });
        const policiesData = await policiesRes.json();
        if (policiesData.success) setPolicies(policiesData.policies);
      }
    } catch (err) {
      console.error('Error fetching claims:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyId || !amountRequested || !description) {
      setError('Please fill in all fields.');
      return;
    }

    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      let documentId: string | undefined = undefined;

      // Upload file first if selected
      if (claimFile) {
        const formData = new FormData();
        formData.append('title', `Claim Proof - ${new Date().toLocaleDateString()}`);
        formData.append('fileType', 'CLAIM_SUPPORT');
        formData.append('file', claimFile);
        formData.append('policyId', policyId);

        const uploadRes = await fetch(`${API_URL}/documents/upload`, {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });

        const uploadData = await uploadRes.json();
        if (uploadRes.ok && uploadData.success) {
          documentId = uploadData.document.id;
        } else {
          setError(uploadData.message || 'Supporting document upload failed. Max file size: 5MB.');
          setSubmitting(false);
          return;
        }
      }

      // Submit the claim
      const res = await fetch(`${API_URL}/claims`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policyId,
          amountRequested: parseFloat(amountRequested),
          description,
          documentId,
        }),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage('Claim submitted successfully. Pending agent verification.');
        setShowSubmitForm(false);
        setPolicyId('');
        setAmountRequested('');
        setDescription('');
        setClaimFile(null);
        await fetchData();
      } else {
        setError(data.message || 'Failed to submit claim.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewClaim = async (status: 'APPROVED' | 'REJECTED') => {
    if (!selectedReviewClaim) return;

    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch(`${API_URL}/claims/${selectedReviewClaim.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          remarks: reviewRemarks,
        }),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage(`Claim ${status === 'APPROVED' ? 'Approved' : 'Rejected'} successfully.`);
        setSelectedReviewClaim(null);
        setReviewRemarks('');
        await fetchData();
      } else {
        setError(data.message || 'Failed to submit review.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Activity className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const isCustomer = user?.role === 'CUSTOMER';
  const isAgent = user?.role === 'AGENT';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="space-y-8 font-sans">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 border-b border-slate-900 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Claims Center</h1>
          <p className="text-sm text-slate-400 mt-1">
            {isCustomer ? 'Submit claims and track their review status' : 'Review claims and log decisions'}
          </p>
        </div>
        {isCustomer && (
          <button
            onClick={() => {
              setShowSubmitForm(!showSubmitForm);
              setError('');
              setMessage('');
            }}
            className="flex items-center space-x-2 rounded-xl bg-indigo-650 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-500 transition active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>{showSubmitForm ? 'Cancel Filing' : 'File Claim'}</span>
          </button>
        )}
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

      {/* 1. Form: Submit Claim (Customer Only) */}
      {showSubmitForm && isCustomer && (
        <form onSubmit={handleSubmitClaim} className="rounded-2xl border border-slate-900 bg-slate-900/20 p-6 space-y-4 max-w-2xl animate-fadeIn">
          <h3 className="text-base font-bold text-slate-200 border-b border-slate-950 pb-2">Submit Insurance Claim</h3>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Select Active Policy *</label>
              <select
                value={policyId}
                onChange={(e) => setPolicyId(e.target.value)}
                className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                required
              >
                <option value="">-- Choose Policy --</option>
                {policies.map((p) => (
                  <option key={p.id} value={p.id}>{p.policyType?.name} ({p.policyNumber})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Claim Amount Requested ($) *</label>
              <input
                type="number"
                step="0.01"
                value={amountRequested}
                onChange={(e) => setAmountRequested(e.target.value)}
                className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                placeholder="e.g. 500.00"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description / Accident Details *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition h-24 resize-none"
              placeholder="Describe what happened, where, and damage severity..."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Upload Supporting Document (Optional)</label>
            <input
              type="file"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setClaimFile(e.target.files[0]);
                }
              }}
              className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20 file:cursor-pointer cursor-pointer border border-slate-800 bg-slate-950 rounded-lg p-1.5 focus:outline-none"
            />
            <p className="text-[10px] text-slate-550 mt-1">Provide receipts, invoices, or photos supporting this claim. Max file size: 5MB.</p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-indigo-650 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-500 transition disabled:bg-indigo-700"
          >
            {submitting ? 'Submitting...' : 'Submit Claim Request'}
          </button>
        </form>
      )}

      {/* 2. Review Claim Action Panel (Agent/Admin Only) */}
      {selectedReviewClaim && (isAgent || isAdmin) && (
        <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-6 space-y-4 max-w-2xl animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-950 pb-2">
            <h3 className="text-base font-bold text-slate-200">Review Claim: {selectedReviewClaim.claimNumber}</h3>
            <button
              onClick={() => {
                setSelectedReviewClaim(null);
                setReviewRemarks('');
              }}
              className="text-xs text-slate-500 hover:text-white transition"
            >
              Cancel
            </button>
          </div>
          
          <div className="rounded-xl bg-slate-950 p-4 border border-slate-900 space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-4 border-b border-slate-900 pb-3 text-slate-400">
              <div>
                <span className="block text-[10px] uppercase">Customer</span>
                <span className="text-sm font-semibold text-white mt-0.5">{selectedReviewClaim.customer?.name}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase">Policy Type</span>
                <span className="text-sm font-semibold text-white mt-0.5">{selectedReviewClaim.policy?.policyType?.name}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b border-slate-900 pb-3 text-slate-400">
              <div>
                <span className="block text-[10px] uppercase">Claim Amount</span>
                <span className="text-sm font-bold text-white mt-0.5">${selectedReviewClaim.amountRequested.toLocaleString()}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase">Policy Coverage Limit</span>
                <span className="text-sm font-bold text-white mt-0.5">${selectedReviewClaim.policy?.coverageAmount.toLocaleString()}</span>
              </div>
            </div>

            <div>
              <span className="block text-[10px] uppercase text-slate-400 mb-1">Claim Reason</span>
              <p className="text-slate-300 leading-relaxed font-sans">{selectedReviewClaim.description}</p>
            </div>

            {selectedReviewClaim.documents && selectedReviewClaim.documents.length > 0 && (
              <div className="border-t border-slate-905/65 pt-3 text-slate-400">
                <span className="block text-[10px] uppercase mb-1.5">Supporting Documents</span>
                <div className="flex flex-col space-y-1.5">
                  {selectedReviewClaim.documents.map((doc: any) => (
                    <a
                      key={doc.id}
                      href={`${API_URL}/documents/${doc.id}/download`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:underline transition w-fit"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>{doc.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Review Remarks / Decision Notes</label>
            <textarea
              value={reviewRemarks}
              onChange={(e) => setReviewRemarks(e.target.value)}
              className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition h-20 resize-none"
              placeholder="Provide comments for approval or reasons for rejection..."
            />
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button
              onClick={() => handleReviewClaim('APPROVED')}
              disabled={submitting}
              className="flex items-center space-x-1.5 rounded-lg bg-emerald-650 hover:bg-emerald-655 px-4 py-2.5 text-xs font-bold text-white shadow transition"
            >
              <Check className="h-4 w-4" />
              <span>Approve Claim</span>
            </button>
            <button
              onClick={() => handleReviewClaim('REJECTED')}
              disabled={submitting}
              className="flex items-center space-x-1.5 rounded-lg bg-rose-650 hover:bg-rose-655 px-4 py-2.5 text-xs font-bold text-white shadow transition"
            >
              <X className="h-4 w-4" />
              <span>Reject Claim</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. List of Claims */}
      <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-6">
        <h3 className="text-base font-bold text-slate-200 mb-6">Claims Registers</h3>
        
        {claims.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3 rounded-xl bg-slate-950/40 border border-slate-900 text-center">
            <ShieldAlert className="h-10 w-10 text-slate-650" />
            <div>
              <p className="text-sm font-semibold text-slate-300">No claims found.</p>
              <p className="text-xs text-slate-500 mt-0.5">Claims filed against policies will be listed here.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-xs font-semibold uppercase tracking-wider text-slate-450 border-b border-slate-900">
                <tr>
                  <th className="px-4 py-3.5">Claim Number</th>
                  <th className="px-4 py-3.5">Coverage Type</th>
                  {!isCustomer && <th className="px-4 py-3.5">Customer</th>}
                  <th className="px-4 py-3.5 text-right">Requested</th>
                  <th className="px-4 py-3.5">Date Filed</th>
                  <th className="px-4 py-3.5">Decision Note</th>
                  <th className="px-4 py-3.5">Status</th>
                  {!isCustomer && <th className="px-4 py-3.5 text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/80">
                {claims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-slate-900/40 transition">
                    <td className="px-4 py-3.5 font-mono text-xs text-white font-bold">{claim.claimNumber}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-350">
                      <div>{claim.policy?.policyType?.name}</div>
                      {claim.documents && claim.documents.length > 0 && (
                        <span className="inline-flex items-center text-[10px] text-indigo-455 mt-0.5 font-bold uppercase tracking-wider">
                          <Download className="h-2.5 w-2.5 mr-1" /> Attachment
                        </span>
                      )}
                    </td>
                    {!isCustomer && <td className="px-4 py-3.5 font-medium">{claim.customer?.name}</td>}
                    <td className="px-4 py-3.5 text-right text-slate-200 font-bold">${claim.amountRequested.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-400">{new Date(claim.dateSubmitted).toLocaleDateString()}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-450 truncate max-w-[200px]" title={claim.remarks || 'No notes'}>
                      {claim.remarks || <span className="italic text-slate-650">Pending Review</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full
                        ${claim.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-450' :
                          claim.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-455' :
                          'bg-amber-500/10 text-amber-400'}`}>
                        {claim.status}
                      </span>
                    </td>
                    {!isCustomer && (
                      <td className="px-4 py-3.5 text-right">
                        {claim.status === 'PENDING' ? (
                          <button
                            onClick={() => {
                              setSelectedReviewClaim(claim);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="rounded bg-indigo-600/20 hover:bg-indigo-600 px-2.5 py-1.5 text-xs font-bold text-indigo-400 hover:text-white transition active:scale-[0.98]"
                          >
                            Verify
                          </button>
                        ) : (
                          <span className="text-xs text-slate-600 flex items-center justify-end space-x-1 font-semibold">
                            <FileCheck className="h-3.5 w-3.5" />
                            <span>Audited</span>
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
