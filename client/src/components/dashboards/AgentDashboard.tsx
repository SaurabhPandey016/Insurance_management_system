'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  FileText,
  DollarSign,
  ShieldAlert,
  Plus,
  FileUp,
  Activity,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000/api';

export default function AgentDashboard() {
  const [overview, setOverview] = useState<any>(null);
  const [recentClaims, setRecentClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        // Fetch Agent Dashboard Overview
        const overviewRes = await fetch(`${API_URL}/reports/overview`, { credentials: 'include' });
        const overviewData = await overviewRes.json();
        
        // Fetch claims list
        const claimsRes = await fetch(`${API_URL}/claims?status=PENDING`, { credentials: 'include' });
        const claimsData = await claimsRes.json();

        if (overviewData.success) setOverview(overviewData.summary);
        if (claimsData.success) setRecentClaims(claimsData.claims.slice(0, 5));
      } catch (err) {
        console.error('Error fetching agent dashboard details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgentData();
  }, []);

  if (loading || !overview) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Activity className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 border-b border-slate-900 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Agent Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Manage policies, register customers, and review claims</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {/* Managed Customers */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-5 flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">My Customers</span>
            <div className="text-3xl font-bold text-white">{overview.totalCustomers}</div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-400">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* Collections */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-5 flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Premium Collected</span>
            <div className="text-3xl font-bold text-white">${overview.collections?.totalCollected?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        {/* Issued Policies */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-5 flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">My Active Policies</span>
            <div className="text-3xl font-bold text-white">{overview.policyMetrics?.ACTIVE || 0}</div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/25 text-violet-400">
            <FileText className="h-5 w-5" />
          </div>
        </div>

        {/* Expired Policies */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-5 flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Expired Policies</span>
            <div className="text-3xl font-bold text-white text-slate-400">{overview.policyMetrics?.EXPIRED || 0}</div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-455">
            <FileText className="h-5 w-5" />
          </div>
        </div>

        {/* Claims Pending */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-5 flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Claims Pending</span>
            <div className="text-3xl font-bold text-white">{overview.claimMetrics?.PENDING || 0}</div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400">
            <ShieldAlert className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Action shortcuts & Claims queue */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Quick actions panel */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-6 lg:col-span-4 space-y-6">
          <h3 className="text-base font-bold text-slate-200">Fast Operations</h3>
          <div className="flex flex-col space-y-3.5">
            <Link
              href="/dashboard/customers"
              className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4 hover:border-slate-700 hover:bg-slate-900 transition duration-150"
            >
              <div className="flex items-center space-x-3 text-indigo-400">
                <Plus className="h-5 w-5" />
                <span className="text-sm font-semibold text-slate-200">Register Customer</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500" />
            </Link>

            <Link
              href="/dashboard/policies"
              className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4 hover:border-slate-700 hover:bg-slate-900 transition duration-150"
            >
              <div className="flex items-center space-x-3 text-violet-400">
                <FileText className="h-5 w-5" />
                <span className="text-sm font-semibold text-slate-200">Issue Policy</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500" />
            </Link>

            <Link
              href="/dashboard/documents"
              className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4 hover:border-slate-700 hover:bg-slate-900 transition duration-150"
            >
              <div className="flex items-center space-x-3 text-emerald-400">
                <FileUp className="h-5 w-5" />
                <span className="text-sm font-semibold text-slate-200">Upload Files Vault</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500" />
            </Link>
          </div>
        </div>

        {/* Claims verify queue */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-6 lg:col-span-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-slate-200">Claims Waiting Verification</h3>
              <span className="text-xs text-slate-400">Pending Review</span>
            </div>
            
            {recentClaims.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-2 rounded-xl bg-slate-950/40 border border-slate-900">
                <Clock className="h-8 w-8 text-slate-650" />
                <p className="text-sm text-slate-450 font-medium">Claims queue is currently clear.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950 text-xs font-semibold uppercase tracking-wider text-slate-450 border-b border-slate-900">
                    <tr>
                      <th className="px-4 py-3.5">Claim Number</th>
                      <th className="px-4 py-3.5">Customer</th>
                      <th className="px-4 py-3.5">Coverage Type</th>
                      <th className="px-4 py-3.5 text-right">Requested</th>
                      <th className="px-4 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/80">
                    {recentClaims.map((claim) => (
                      <tr key={claim.id} className="hover:bg-slate-900/40 transition">
                        <td className="px-4 py-3.5 font-mono text-xs text-white">{claim.claimNumber}</td>
                        <td className="px-4 py-3.5 font-medium">{claim.customer?.name}</td>
                        <td className="px-4 py-3.5 text-xs text-slate-400">{claim.policy?.policyType?.name}</td>
                        <td className="px-4 py-3.5 text-right text-white font-semibold">${claim.amountRequested.toLocaleString()}</td>
                        <td className="px-4 py-3.5 text-right">
                          <Link
                            href="/dashboard/claims"
                            className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition"
                          >
                            <span>Verify</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {recentClaims.length > 0 && (
            <div className="border-t border-slate-900 mt-6 pt-4 text-center">
              <Link
                href="/dashboard/claims"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline transition"
              >
                View Complete Claims Backlog &rarr;
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
