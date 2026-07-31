'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import Link from 'next/link';
import { Shield, User, Briefcase, Settings, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login, user, loading: authLoading } = useAuth();
  const [roleTab, setRoleTab] = useState<'CUSTOMER' | 'AGENT' | 'ADMIN'>('CUSTOMER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Pre-fill credentials based on role tab for quick testing
  useEffect(() => {
    if (roleTab === 'CUSTOMER') {
      setEmail('');
      setPassword('');
    } else if (roleTab === 'AGENT') {
      setEmail('');
      setPassword('');
    } else if (roleTab === 'ADMIN') {
      setEmail('');
      setPassword('');
    }

    // if (roleTab === 'CUSTOMER') {
    //   setEmail('customer@insurance.com');
    //   setPassword('Customer@123');
    // } else if (roleTab === 'AGENT') {
    //   setEmail('agent@insurance.com');
    //   setPassword('Agent@123');
    // } else if (roleTab === 'ADMIN') {
    //   setEmail('admin@insurance.com');
    //   setPassword('Admin@123');
    // }

    setError('');
  }, [roleTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    const result = await login(email, password);
    if (!result?.success) {
      setError(result?.message || 'Invalid credentials. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-1 items-center justify-center bg-slate-950 px-4 py-12">
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none"></div>

      <div className="relative w-full max-w-md border border-slate-900 bg-slate-900/40 backdrop-blur-md rounded-2xl p-8 shadow-2xl">
        {/* Title Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-3">
            <Shield className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Sign In to Portal</h2>
          <p className="text-xs text-slate-400 mt-1">Select your access role and input credentials</p>
        </div>

        {/* Role Selection Tabs */}
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-950 p-1 border border-slate-900 mb-6">
          <button
            type="button"
            onClick={() => setRoleTab('CUSTOMER')}
            className={`flex flex-col items-center justify-center py-2 rounded-lg text-xs font-semibold tracking-wide transition duration-150
              ${roleTab === 'CUSTOMER' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <User className="h-4 w-4 mb-1" />
            <span>Customer</span>
          </button>
          <button
            type="button"
            onClick={() => setRoleTab('AGENT')}
            className={`flex flex-col items-center justify-center py-2 rounded-lg text-xs font-semibold tracking-wide transition duration-150
              ${roleTab === 'AGENT' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Briefcase className="h-4 w-4 mb-1" />
            <span>Agent</span>
          </button>
          <button
            type="button"
            onClick={() => setRoleTab('ADMIN')}
            className={`flex flex-col items-center justify-center py-2 rounded-lg text-xs font-semibold tracking-wide transition duration-150
              ${roleTab === 'ADMIN' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Settings className="h-4 w-4 mb-1" />
            <span>Admin</span>
          </button>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="flex items-center space-x-2 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3.5 text-xs text-rose-450 mb-6">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-650 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
              placeholder="e.g. name@insurance.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-650 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-lg bg-indigo-600 py-3 text-sm font-bold text-white shadow-md hover:bg-indigo-500 transition duration-150 active:scale-[0.98] disabled:bg-indigo-650 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Logging in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Registration Link */}
        {roleTab === 'CUSTOMER' && (
          <div className="text-center mt-6">
            <span className="text-xs text-slate-500">Don't have a customer profile? </span>
            <Link href="/register" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline transition">
              Create Account
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
