'use client';

import React, { useEffect, useState } from 'react';
import {
  FileText,
  DollarSign,
  ShieldAlert,
  Loader2,
  Calendar,
  Download,
  AlertCircle,
  CheckCircle2,
  Activity,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000/api';

export default function CustomerDashboard() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { user, refreshUser } = useAuth();

  // Checkout states
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<any>(null);
  const [paymentError, setPaymentError] = useState('');

  // Personal Profile Edit states
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileAddress, setProfileAddress] = useState('');
  const [profileDob, setProfileDob] = useState('');
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');

  const fetchCustomerData = async () => {
    try {
      // 1. Fetch policies
      const policiesRes = await fetch(`${API_URL}/policies`, { credentials: 'include' });
      const policiesData = await policiesRes.json();

      // 2. Fetch payments
      const paymentsRes = await fetch(`${API_URL}/payments`, { credentials: 'include' });
      const paymentsData = await paymentsRes.json();

      // 3. Fetch claims
      const claimsRes = await fetch(`${API_URL}/claims`, { credentials: 'include' });
      const claimsData = await claimsRes.json();

      if (policiesData.success) setPolicies(policiesData.policies);
      if (paymentsData.success) setPayments(paymentsData.payments);
      if (claimsData.success) setClaims(claimsData.claims);
    } catch (err) {
      console.error('Error fetching customer dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, []);

  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfilePhone(user.phone || '');
      setProfileAddress(user.customerProfile?.address || '');
      setProfileDob(user.customerProfile?.dob ? new Date(user.customerProfile.dob).toISOString().split('T')[0] : '');
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSubmitting(true);
    setProfileError('');
    setProfileMessage('');
    try {
      const res = await fetch(`${API_URL}/customers/${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileName,
          phone: profilePhone || undefined,
          address: profileAddress || undefined,
          dob: profileDob || undefined,
        }),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProfileMessage('Your profile updated successfully.');
        setShowProfileEdit(false);
        await refreshUser();
      } else {
        setProfileError(data.message || 'Failed to update profile.');
      }
    } catch (err) {
      console.error(err);
      setProfileError('Connection error.');
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;

    setPaying(true);
    setPaymentError('');
    setPaymentSuccess(null);

    try {
      const res = await fetch(`${API_URL}/payments/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId: selectedPayment.id,
          paymentMethod,
        }),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setPaymentSuccess(data.payment);
        setSelectedPayment(null);
        // Refresh dashboard tables
        await fetchCustomerData();
      } else {
        setPaymentError(data.message || 'Payment processing failed.');
      }
    } catch (err) {
      console.error('Payment checkout error:', err);
      setPaymentError('Connection timed out. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Activity className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  // Derived metrics
  const activeCount = policies.filter(p => p.status === 'ACTIVE').length;
  const pendingPayments = payments.filter(p => p.status === 'PENDING' || p.status === 'OVERDUE');
  const outstandingAmount = pendingPayments.reduce((acc, p) => acc + p.amount, 0);
  const activeClaims = claims.filter(c => c.status === 'PENDING' || c.status === 'UNDER_REVIEW').length;

  const today = new Date();
  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(today.getDate() + 30);

  const expiringPolicies = policies.filter(p => {
    if (p.status !== 'ACTIVE') return false;
    const end = new Date(p.endDate);
    return end >= today && end <= thirtyDaysLater;
  });

  const overduePayments = payments.filter(p => p.status === 'OVERDUE' || (p.status === 'PENDING' && new Date(p.dueDate) < today));

  return (
    <div className="space-y-8 font-sans">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 border-b border-slate-900 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Client Portal</h1>
          <p className="text-sm text-slate-400 mt-1">Review coverage details, verify premium dues, and track claims</p>
        </div>
        <div>
          <Link
            href="/dashboard/claims"
            className="flex items-center space-x-2 rounded-xl bg-indigo-650 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 transition active:scale-[0.98]"
          >
            <ShieldAlert className="h-4 w-4" />
            <span>File New Claim</span>
          </Link>
        </div>
      </div>

      {/* Expiry and Overdue Alerts */}
      {(expiringPolicies.length > 0 || overduePayments.length > 0) && (
        <div className="space-y-3">
          {expiringPolicies.map(p => (
            <div key={p.id} className="flex items-center space-x-3 rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-xs text-amber-400 animate-pulse">
              <ShieldAlert className="h-5 w-5 shrink-0" />
              <div>
                <span className="font-bold">Policy Expiry Alert:</span> Your policy <span className="font-semibold text-white">'{p.policyType?.name}' ({p.policyNumber})</span> is expiring on <span className="font-semibold text-white">{new Date(p.endDate).toLocaleDateString()}</span>! Contact an agent to renew.
              </div>
            </div>
          ))}
          {overduePayments.map(p => (
            <div key={p.id} className="flex items-center space-x-3 rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-455">
              <AlertCircle className="h-5 w-5 shrink-0 animate-bounce" />
              <div>
                <span className="font-bold">Overdue Payment Notice:</span> An installment of <span className="font-bold text-white">${p.amount.toFixed(2)}</span> for policy <span className="font-semibold text-white">'{p.policy?.policyType?.name || 'Active Contract'}'</span> was due on <span className="font-semibold text-white">{new Date(p.dueDate).toLocaleDateString()}</span>. Please settle it to prevent lapse in cover.
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Personal Profile Details Card */}
      <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-950 pb-2">
          <h3 className="text-base font-bold text-slate-200">My Client Profile</h3>
          <button
            onClick={() => {
              setShowProfileEdit(!showProfileEdit);
              setProfileError('');
              setProfileMessage('');
            }}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition"
          >
            {showProfileEdit ? 'Cancel Editing' : 'Edit Profile'}
          </button>
        </div>

        {profileMessage && (
          <div className="flex items-center space-x-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-450">
            <CheckCircle2 className="h-4.5 w-4.5" />
            <span>{profileMessage}</span>
          </div>
        )}

        {profileError && (
          <div className="flex items-center space-x-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-455">
            <AlertCircle className="h-4.5 w-4.5" />
            <span>{profileError}</span>
          </div>
        )}

        {showProfileEdit ? (
          <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-xl animate-fadeIn">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Date of Birth</label>
                <input
                  type="date"
                  value={profileDob}
                  onChange={(e) => setProfileDob(e.target.value)}
                  className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Residential Address</label>
                <input
                  type="text"
                  value={profileAddress}
                  onChange={(e) => setProfileAddress(e.target.value)}
                  className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={profileSubmitting}
              className="rounded-lg bg-indigo-650 px-5 py-2 text-xs font-bold text-white shadow hover:bg-indigo-500 transition disabled:bg-indigo-700"
            >
              {profileSubmitting ? 'Updating...' : 'Save Profile Changes'}
            </button>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs bg-slate-950/40 p-4 border border-slate-900 rounded-xl">
            <div>
              <span className="block text-slate-500 uppercase tracking-wider text-[10px]">Registered Name</span>
              <span className="text-sm font-semibold text-slate-200 mt-1 block">{user?.name}</span>
            </div>
            <div>
              <span className="block text-slate-500 uppercase tracking-wider text-[10px]">Email Address</span>
              <span className="text-sm font-semibold text-slate-200 mt-1 block">{user?.email}</span>
            </div>
            <div>
              <span className="block text-slate-500 uppercase tracking-wider text-[10px]">Mobile Contact</span>
              <span className="text-sm font-semibold text-slate-200 mt-1 block">{user?.phone || '—'}</span>
            </div>
            <div>
              <span className="block text-slate-500 uppercase tracking-wider text-[10px]">Date of Birth</span>
              <span className="text-sm font-semibold text-slate-200 mt-1 block">
                {user?.customerProfile?.dob ? new Date(user.customerProfile.dob).toLocaleDateString() : '—'}
              </span>
            </div>
            {user?.customerProfile?.address && (
              <div className="sm:col-span-2 md:col-span-4 border-t border-slate-900/60 pt-2.5 mt-1.5">
                <span className="block text-slate-500 uppercase tracking-wider text-[10px]">Residential Address</span>
                <span className="text-sm font-medium text-slate-350 mt-1 block">{user.customerProfile.address}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Active Policies */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-6 flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Active Plans</span>
            <div className="text-3xl font-bold text-white">{activeCount}</div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/25 text-violet-400">
            <FileText className="h-6 w-6" />
          </div>
        </div>

        {/* Premium Dues */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-6 flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Pending Premium</span>
            <div className="text-3xl font-bold text-white">${outstandingAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        {/* Active Claims */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-6 flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Submitted Claims</span>
            <div className="text-3xl font-bold text-white">{activeClaims}</div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400">
            <ShieldAlert className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Checkout & Premium Dues & Claims status */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Dues & Checkout Form */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-6 lg:col-span-7 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-200 mb-4">Premium Payment Dues</h3>

            {/* Payment successes */}
            {paymentSuccess && (
              <div className="flex flex-col space-y-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-emerald-400 mb-6">
                <div className="flex items-center space-x-2 text-xs">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                  <span className="font-semibold">Premium paid successfully! Transaction ID: {paymentSuccess.transactionId}</span>
                </div>
                <a
                  href={`${process.env.NEXT_PUBLIC_SERVER_URL}/${paymentSuccess.invoicePdfPath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 hover:text-white px-3.5 py-2 text-xs font-bold text-emerald-400 transition w-fit self-start"
                >
                  <Download className="h-4 w-4" />
                  <span>Download PDF Receipt</span>
                </a>
              </div>
            )}

            {paymentError && (
              <div className="flex items-center space-x-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-450 mb-6">
                <AlertCircle className="h-4.5 w-4.5" />
                <span>{paymentError}</span>
              </div>
            )}

            {/* Checkout Form Modal State */}
            {selectedPayment ? (
              <form onSubmit={handleProcessPayment} className="rounded-xl bg-slate-950 p-5 border border-slate-900 space-y-4 mb-6 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Installment Checkout</span>
                  <button
                    type="button"
                    onClick={() => setSelectedPayment(null)}
                    className="text-xs text-slate-500 hover:text-white transition"
                  >
                    Cancel
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 block">Coverage Package</span>
                    <span className="text-sm font-semibold text-slate-200">{selectedPayment.policy?.policyType?.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 block">Installment Due</span>
                    <span className="text-sm font-bold text-white">${selectedPayment.amount.toFixed(2)}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Select Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                  >
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Bank Transfer">Bank Net Transfer</option>
                    <option value="Stripe">Stripe Secure Pay</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={paying}
                  className="flex w-full items-center justify-center rounded-lg bg-emerald-600 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-500 transition active:scale-[0.98] disabled:bg-emerald-650"
                >
                  {paying ? (
                    <>
                      <Loader2 className="h-4.5 w-4.5 animate-spin mr-2" />
                      <span>Verifying billing info...</span>
                    </>
                  ) : (
                    <span>Authorize Payment of ${selectedPayment.amount.toFixed(2)}</span>
                  )}
                </button>
              </form>
            ) : null}

            {/* List of pending payments */}
            {pendingPayments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-2 rounded-xl bg-slate-950/40 border border-slate-900 text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                <p className="text-sm text-slate-300 font-medium">All premiums paid up. No outstanding dues!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingPayments.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-xl bg-slate-950 p-4 border border-slate-900/80 hover:border-slate-850 transition"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg border font-mono text-xs
                        ${p.status === 'OVERDUE'
                          ? 'bg-rose-500/10 text-rose-455 border-rose-500/20 animate-pulse'
                          : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}`}>
                        $
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">{p.policy?.policyType?.name}</h4>
                        <span className="text-[10px] text-slate-450 flex items-center space-x-1 mt-0.5">
                          <Calendar className="h-3 w-3" />
                          <span>Due: {new Date(p.dueDate).toLocaleDateString()}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-bold text-white">${p.amount.toFixed(2)}</span>
                      <button
                        onClick={() => {
                          setSelectedPayment(p);
                          setPaymentSuccess(null);
                        }}
                        className="rounded-lg bg-indigo-600/20 hover:bg-indigo-600 px-3 py-1.5 text-xs font-bold text-indigo-400 hover:text-white transition active:scale-[0.98]"
                      >
                        Checkout
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Claims tracking progress */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-6 lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-slate-200">Claims Resolution Audit</h3>
              <span className="text-xs text-slate-400">Filed Claims</span>
            </div>

            {claims.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-2 rounded-xl bg-slate-950/40 border border-slate-900 text-center">
                <ShieldAlert className="h-8 w-8 text-slate-650" />
                <p className="text-sm text-slate-450 font-medium">No claims filed yet.</p>
                <Link
                  href="/dashboard/claims"
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline transition mt-1"
                >
                  File your first claim &rarr;
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {claims.slice(0, 4).map((claim) => (
                  <div key={claim.id} className="rounded-xl bg-slate-950 p-4 border border-slate-900 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-white">{claim.claimNumber}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full
                        ${claim.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-450' :
                          claim.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-455' :
                          'bg-amber-500/10 text-amber-400'}`}>
                        {claim.status}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-350">{claim.policy?.policyType?.name}</h4>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{claim.description}</p>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-900 pt-2 text-[10px] text-slate-500">
                      <span>Requested: ${claim.amountRequested.toLocaleString()}</span>
                      <span>Filed: {new Date(claim.dateSubmitted).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {claims.length > 4 && (
            <div className="border-t border-slate-900 mt-6 pt-4 text-center">
              <Link
                href="/dashboard/claims"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline transition"
              >
                View all claim histories &rarr;
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
