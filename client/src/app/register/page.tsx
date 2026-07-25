'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import Link from 'next/link';
import { Shield, AlertCircle, Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000/api';

export default function RegisterPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [dob, setDob] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Name, email, and password are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          phone: phone || undefined,
          password,
          address: address || undefined,
          dob: dob || undefined,
        }),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Refresh AuthContext session and route to dashboard
        await refreshUser();
        router.push('/dashboard');
      } else {
        setError(data.message || 'Registration failed. Please try again.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('An unexpected connection error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-1 items-center justify-center bg-slate-950 px-4 py-12">
      {/* Glow background */}
      <div className="absolute top-1/2 left-1/2 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none"></div>

      <div className="relative w-full max-w-lg border border-slate-900 bg-slate-900/40 backdrop-blur-md rounded-2xl p-8 shadow-2xl">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-3">
            <Shield className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Create Customer Profile</h2>
          <p className="text-xs text-slate-400 mt-1">Get started with automated insurance tracking</p>
        </div>

        {/* Error alert box */}
        {error && (
          <div className="flex items-center space-x-2 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3.5 text-xs text-rose-450 mb-6">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                placeholder="e.g. Saurabh Kumar"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                placeholder="e.g. name@insurance.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                placeholder="e.g. 9876543210"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Password *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Residential Address
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition h-20 resize-none"
              placeholder="e.g. Flat 101, Main Road, Bangalore"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-lg bg-indigo-600 py-3 text-sm font-bold text-white shadow-md hover:bg-indigo-500 transition duration-150 active:scale-[0.98] disabled:bg-indigo-650"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Customer Account</span>
            )}
          </button>
        </form>

        {/* Login redirect link */}
        <div className="text-center mt-6">
          <span className="text-xs text-slate-500">Already registered? </span>
          <Link href="/login" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline transition">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
