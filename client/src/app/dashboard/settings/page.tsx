'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import {
  Settings,
  Activity,
  Loader2,
  AlertCircle,
  CheckCircle,
  ShieldAlert,
  Save,
  RefreshCw
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000/api';

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // System parameters state variables
  const [systemName, setSystemName] = useState('InsuraShield');
  const [supportPhone, setSupportPhone] = useState('+91 8720026790');
  const [supportEmail, setSupportEmail] = useState('developersaurabh04@gmail.com');
  const [gracePeriodDays, setGracePeriodDays] = useState('15');
  const [currencySymbol, setCurrencySymbol] = useState('$');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/settings`, { credentials: 'include' });
      const data = await res.json();
      if (data.success && data.settings) {
        setSystemName(data.settings.systemName || 'InsuraShield');
        setSupportPhone(data.settings.supportPhone || '+91 8720026790');
        setSupportEmail(data.settings.supportEmail || 'developersaurabh04@gmail.com');
        setGracePeriodDays(data.settings.gracePeriodDays || '15');
        setCurrencySymbol(data.settings.currencySymbol || '$');
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to fetch system configurations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchSettings();
    }
  }, [user]);

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch(`${API_URL}/admin/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemName,
          supportPhone,
          supportEmail,
          gracePeriodDays,
          currencySymbol,
        }),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage('System settings overrides stored successfully.');
        await fetchSettings();
      } else {
        setError(data.message || 'Failed to update system settings.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error occurred.');
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

  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <ShieldAlert className="h-12 w-12 text-rose-500 animate-bounce" />
        <h2 className="text-xl font-bold text-white">Access Forbidden</h2>
        <p className="text-sm text-slate-500">Only system administrators can modify application configurations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans max-w-4xl">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 border-b border-slate-900 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans flex items-center space-x-2">
            <Settings className="h-8 w-8 text-indigo-400 mr-2" />
            <span>System Settings</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">Configure global application variables, grace periods, and support contacts</p>
        </div>
        <button
          onClick={fetchSettings}
          className="flex items-center space-x-1.5 rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-350 transition"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Reload Configs</span>
        </button>
      </div>

      {/* Alerts */}
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

      {/* Main Settings Card */}
      <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-8">
        <form onSubmit={handleUpdateSettings} className="space-y-6">
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Application Title</label>
              <input
                type="text"
                value={systemName}
                onChange={(e) => setSystemName(e.target.value)}
                className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                required
              />
              <p className="text-[10px] text-slate-500 mt-1.5">Branded name displayed on the client headers and page titles.</p>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Currency Symbol</label>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                required
              />
              <p className="text-[10px] text-slate-500 mt-1.5">Prefix sign used inside billing ledgers and coverage lists (e.g. $, €, £).</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 border-t border-slate-900 pt-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Support Helpline Phone</label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                required
              />
              <p className="text-[10px] text-slate-500 mt-1.5">Helpline displayed on client invoices and footer support links.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Support Email Address</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                required
              />
              <p className="text-[10px] text-slate-500 mt-1.5">Customer service inbox reference for support inquiries.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 border-t border-slate-900 pt-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Payment Grace Period (Days)</label>
              <input
                type="number"
                min="0"
                max="90"
                value={gracePeriodDays}
                onChange={(e) => setGracePeriodDays(e.target.value)}
                className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                required
              />
              <p className="text-[10px] text-slate-500 mt-1.5">Number of days allowed past the due date before premiums are marked OVERDUE.</p>
            </div>
          </div>

          <div className="border-t border-slate-900 pt-6 flex items-center justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center space-x-2 rounded-xl bg-indigo-650 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-indigo-500 transition active:scale-[0.98] disabled:bg-indigo-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  <span>Save Global Configuration</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
