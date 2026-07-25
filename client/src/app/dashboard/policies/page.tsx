'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import {
  FileText,
  Plus,
  Activity,
  Calendar,
  AlertCircle,
  CheckCircle,
  Search,
  ChevronRight,
  ClipboardCheck,
  UserCheck,
  DollarSign
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000/api';

export default function PoliciesPage() {
  const { user } = useAuth();
  const [policies, setPolicies] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms states
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);

  // Issue policy parameters
  const [customerId, setCustomerId] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [customPremium, setCustomPremium] = useState('');
  const [customCoverage, setCustomCoverage] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Template parameters
  const [templateName, setTemplateName] = useState('');
  const [templateDesc, setTemplateDesc] = useState('');
  const [basePremium, setBasePremium] = useState('');
  const [coverageLimit, setCoverageLimit] = useState('');
  const [termsMonths, setTermsMonths] = useState('12');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      // 1. Fetch policies
      const policiesRes = await fetch(`${API_URL}/policies`, { credentials: 'include' });
      const policiesData = await policiesRes.json();
      if (policiesData.success) setPolicies(policiesData.policies);

      // 2. Fetch templates
      const templatesRes = await fetch(`${API_URL}/policies/templates`, { credentials: 'include' });
      const templatesData = await templatesRes.json();
      if (templatesData.success) setTemplates(templatesData.templates);

      // 3. Fetch customers list (only for agent/admin to assign policies)
      if (user && (user.role === 'AGENT' || user.role === 'ADMIN')) {
        const customersRes = await fetch(`${API_URL}/customers`, { credentials: 'include' });
        const customersData = await customersRes.json();
        if (customersData.success) setCustomers(customersData.customers);
      }
    } catch (err) {
      console.error('Error fetching policies data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Autofill custom inputs based on selected template template values
  useEffect(() => {
    if (templateId) {
      const selected = templates.find((t) => t.id === templateId);
      if (selected) {
        setCustomPremium(selected.basePremium.toString());
        setCustomCoverage(selected.coverageLimit.toString());
        
        // Auto set end date to start date + term months
        if (startDate) {
          const sDate = new Date(startDate);
          sDate.setMonth(sDate.getMonth() + selected.termsMonths);
          setEndDate(sDate.toISOString().split('T')[0]);
        }
      }
    }
  }, [templateId, startDate, templates]);

  const handleIssuePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !templateId || !startDate || !endDate) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch(`${API_URL}/policies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          policyTypeId: templateId,
          premiumAmount: parseFloat(customPremium) || undefined,
          coverageAmount: parseFloat(customCoverage) || undefined,
          startDate,
          endDate,
        }),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage('Policy issued successfully, and payment installments generated.');
        setShowIssueForm(false);
        // Reset form
        setCustomerId('');
        setTemplateId('');
        setCustomPremium('');
        setCustomCoverage('');
        setStartDate('');
        setEndDate('');
        await fetchData();
      } else {
        setError(data.message || 'Failed to issue policy.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName || !templateDesc || !basePremium || !coverageLimit) {
      setError('Please fill in all fields.');
      return;
    }

    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch(`${API_URL}/policies/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: templateName,
          description: templateDesc,
          basePremium: parseFloat(basePremium),
          coverageLimit: parseFloat(coverageLimit),
          termsMonths: parseInt(termsMonths),
        }),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage('Policy type template created successfully.');
        setShowTemplateForm(false);
        // Reset form
        setTemplateName('');
        setTemplateDesc('');
        setBasePremium('');
        setCoverageLimit('');
        setTermsMonths('12');
        await fetchData();
      } else {
        setError(data.message || 'Failed to create template.');
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
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Policy Center</h1>
          <p className="text-sm text-slate-400 mt-1">
            {isCustomer ? 'View your active policies and plans' : 'Manage policy templates and issue customer policies'}
          </p>
        </div>
        
        {/* Buttons based on role */}
        <div className="flex items-center space-x-3">
          {isAdmin && (
            <button
              onClick={() => {
                setShowTemplateForm(!showTemplateForm);
                setShowIssueForm(false);
                setError('');
                setMessage('');
              }}
              className="flex items-center space-x-2 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-300 transition active:scale-[0.98]"
            >
              <span>{showTemplateForm ? 'Close Form' : 'New Template'}</span>
            </button>
          )}

          {(isAgent || isAdmin) && (
            <button
              onClick={() => {
                setShowIssueForm(!showIssueForm);
                setShowTemplateForm(false);
                setError('');
                setMessage('');
              }}
              className="flex items-center space-x-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              <span>{showIssueForm ? 'Close Form' : 'Issue Policy'}</span>
            </button>
          )}
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

      {/* 1. Form: Define Policy Template (Admin) */}
      {showTemplateForm && isAdmin && (
        <form onSubmit={handleCreateTemplate} className="rounded-2xl border border-slate-900 bg-slate-900/20 p-6 space-y-4 max-w-2xl animate-fadeIn">
          <h3 className="text-base font-bold text-slate-200 border-b border-slate-950 pb-2">Create Policy Template</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Policy Name</label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                placeholder="e.g., Extended Auto Cover"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Terms (Duration in Months)</label>
              <select
                value={termsMonths}
                onChange={(e) => setTermsMonths(e.target.value)}
                className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              >
                <option value="6">6 Months</option>
                <option value="12">12 Months (1 Year)</option>
                <option value="24">24 Months (2 Years)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Base Premium ($)</label>
              <input
                type="number"
                step="0.01"
                value={basePremium}
                onChange={(e) => setBasePremium(e.target.value)}
                className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                placeholder="e.g. 100.00"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Base Coverage Limit ($)</label>
              <input
                type="number"
                step="0.01"
                value={coverageLimit}
                onChange={(e) => setCoverageLimit(e.target.value)}
                className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                placeholder="e.g. 50000.00"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</label>
            <textarea
              value={templateDesc}
              onChange={(e) => setTemplateDesc(e.target.value)}
              className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition h-20 resize-none"
              placeholder="Provide policy coverage details and target requirements..."
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-indigo-650 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-500 transition disabled:bg-indigo-700"
          >
            {submitting ? 'Creating Template...' : 'Save Template'}
          </button>
        </form>
      )}

      {/* 2. Form: Issue Policy (Agent/Admin) */}
      {showIssueForm && (isAgent || isAdmin) && (
        <form onSubmit={handleIssuePolicy} className="rounded-2xl border border-slate-900 bg-slate-900/20 p-6 space-y-4 max-w-2xl animate-fadeIn">
          <h3 className="text-base font-bold text-slate-200 border-b border-slate-950 pb-2">Issue New Customer Policy</h3>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Select Customer *</label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                required
              >
                <option value="">-- Choose Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Select Policy Type Template *</label>
              <select
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                required
              >
                <option value="">-- Choose Template --</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} ({t.termsMonths}m)</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Premium Amount ($)</label>
              <input
                type="number"
                step="0.01"
                value={customPremium}
                onChange={(e) => setCustomPremium(e.target.value)}
                className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                placeholder="Autofilled from template"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Coverage Limit ($)</label>
              <input
                type="number"
                step="0.01"
                value={customCoverage}
                onChange={(e) => setCustomCoverage(e.target.value)}
                className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                placeholder="Autofilled from template"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Start Date *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">End Date *</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-500 transition disabled:bg-indigo-650"
          >
            {submitting ? 'Issuing Policy & Invoicing...' : 'Issue Customer Policy'}
          </button>
        </form>
      )}

      {/* 3. List of Active Policies */}
      <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-6">
        <h3 className="text-base font-bold text-slate-200 mb-6">Active Policy Registries</h3>
        
        {policies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3 rounded-xl bg-slate-950/40 border border-slate-900 text-center">
            <FileText className="h-10 w-10 text-slate-650" />
            <div>
              <p className="text-sm font-semibold text-slate-300">No policies found.</p>
              <p className="text-xs text-slate-500 mt-0.5">All issued customer contracts will be listed here.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-xs font-semibold uppercase tracking-wider text-slate-450 border-b border-slate-900">
                <tr>
                  <th className="px-4 py-3.5">Policy Number</th>
                  <th className="px-4 py-3.5">Coverage Type</th>
                  {!isCustomer && <th className="px-4 py-3.5">Customer Name</th>}
                  <th className="px-4 py-3.5 text-right">Premium Rate</th>
                  <th className="px-4 py-3.5 text-right">Coverage Limit</th>
                  <th className="px-4 py-3.5">Term Dates</th>
                  <th className="px-4 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/80">
                {policies.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-900/40 transition">
                    <td className="px-4 py-3.5 font-mono text-xs text-white font-bold">{p.policyNumber}</td>
                    <td className="px-4 py-3.5">{p.policyType?.name}</td>
                    {!isCustomer && <td className="px-4 py-3.5 font-medium">{p.customer?.user?.name}</td>}
                    <td className="px-4 py-3.5 text-right text-indigo-400 font-semibold">${p.premiumAmount.toFixed(2)}</td>
                    <td className="px-4 py-3.5 text-right text-slate-200 font-bold">${p.coverageAmount.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-400">
                      <span>{new Date(p.startDate).toLocaleDateString()}</span>
                      <ChevronRight className="inline h-3 w-3 mx-1 text-slate-600" />
                      <span>{new Date(p.endDate).toLocaleDateString()}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full
                        ${p.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-450' :
                          p.status === 'CANCELLED' ? 'bg-rose-500/10 text-rose-455' :
                          'bg-slate-800 text-slate-400'}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Display of Base Templates (Only for Agents/Admins) */}
      {!isCustomer && (
        <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-6">
          <h3 className="text-base font-bold text-slate-200 mb-6">Base Policy Templates</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {templates.map((t) => (
              <div key={t.id} className="rounded-xl bg-slate-950 p-5 border border-slate-900 flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-white">{t.name}</h4>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">{t.description}</p>
                </div>
                <div className="border-t border-slate-900 pt-3 space-y-1.5 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Base Premium:</span>
                    <span className="font-semibold text-white">${t.basePremium.toFixed(2)} / mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Coverage Max:</span>
                    <span className="font-semibold text-white">${t.coverageLimit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-semibold text-white">{t.termsMonths} Months</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
