'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import {
  Shield,
  FileCheck,
  TrendingUp,
  FileLock,
  Layers,
  CheckCircle2,
  ArrowRight,
  ClipboardList,
  Users,
  DollarSign
} from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="relative flex-1 bg-slate-950 overflow-hidden text-slate-100 font-sans">
      {/* Background Decorative Gradients & Radial Glows */}
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35 pointer-events-none"></div>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 pt-20 pb-16 sm:px-6 lg:px-8 text-center sm:text-left">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 items-center">
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            {/* Tagline */}
            <div className="inline-flex self-center sm:self-start items-center space-x-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold tracking-wide text-indigo-400">
              <Shield className="h-3.5 w-3.5" />
              <span>Next-Gen Enterprise Insurance Portal</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl font-sans leading-[1.15]">
              Secure Insurance Operations, <br />
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-500 bg-clip-text text-transparent">
                Digitized and Simplified.
              </span>
            </h1>

            {/* Description */}
            <p className="max-w-xl text-lg text-slate-400 leading-relaxed">
              InsuraShield coordinates policies creation, claim validation workflows, and real-time premium payments in a crash-free, centralized framework for admins, agents, and customers.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 justify-center sm:justify-start">
              {user ? (
                <Link
                  href="/dashboard"
                  className="group inline-flex items-center space-x-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 hover:shadow-indigo-500/35 transition active:scale-[0.98] w-full sm:w-auto justify-center"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="group inline-flex items-center space-x-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 hover:shadow-indigo-500/35 transition active:scale-[0.98] w-full sm:w-auto justify-center"
                  >
                    <span>Access Portal</span>
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur px-6 py-3.5 text-base font-bold text-slate-300 hover:border-slate-700 hover:text-white hover:bg-slate-900 transition w-full sm:w-auto"
                  >
                    Register as Customer
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Interactive Hero Decoration */}
          <div className="lg:col-span-5 relative hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-violet-500/20 blur-2xl rounded-3xl"></div>
            <div className="relative border border-slate-850 bg-slate-900/50 backdrop-blur rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                <div className="flex items-center space-x-2 text-indigo-400">
                  <Shield className="h-6 w-6 text-indigo-500" />
                  <span className="font-bold text-sm tracking-widest text-slate-300">INSURASHIELD STATUS</span>
                </div>
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-slate-950/60 p-4 border border-slate-900">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-450" />
                    <span className="text-sm font-semibold text-slate-200">Database Connection</span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-450 bg-emerald-500/10 px-2.5 py-1 rounded-full">ACTIVE</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-950/60 p-4 border border-slate-900">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-450" />
                    <span className="text-sm font-semibold text-slate-200">Prisma Driver Adapter</span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-450 bg-emerald-500/10 px-2.5 py-1 rounded-full">CONNECTED</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-950/60 p-4 border border-slate-900">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-450" />
                    <span className="text-sm font-semibold text-slate-200">Security Architecture</span>
                  </div>
                  <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full">HttpOnly JWT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Modules Grid */}
      <section className="border-t border-slate-900 bg-slate-950/50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Fully Integrated Operations
            </h2>
            <p className="text-lg text-slate-400">
              Everything required to run, check, and monitor insurance policies and claims in a standardized environment.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-8 hover:border-slate-800 transition duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 mb-6 border border-indigo-500/20">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Customer Management</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Maintain comprehensive customer histories, update info fields, track active statuses, and register new customers with link references.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-8 hover:border-slate-800 transition duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 mb-6 border border-indigo-500/20">
                <ClipboardList className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Policy Administration</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Configure policy templates (Health, Auto, Life, Home), issue plans with custom premium parameters, process renewals, and manage cancellations.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-8 hover:border-slate-800 transition duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 mb-6 border border-indigo-500/20">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Claims Verification</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Submit claims with coverage associations, upload supporting files, review documents, and log decisions (Approve/Reject) with audit notes.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-8 hover:border-slate-800 transition duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 mb-6 border border-indigo-500/20">
                <DollarSign className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Premium Billing</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Track monthly premium payments installments, receive automatic overdue flags, execute checkout transactions, and generate PDF invoices dynamically.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-8 hover:border-slate-800 transition duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 mb-6 border border-indigo-500/20">
                <FileLock className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Document Vault</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Upload identity papers, policy details, or claim proof files. Encapsulate download assets via attachment streaming in controllers.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-8 hover:border-slate-800 transition duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 mb-6 border border-indigo-500/20">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Interactive Analytics</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Visualize monthly collections, policy counts, and customer registration trends through charts powered by Chart.js.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      {/*
      <footer className="border-t border-slate-900 bg-slate-950 py-10 text-center">
        <p className="text-xs text-slate-500">
          &copy; {new Date().getFullYear()} InsuraShield Operations Platform. All rights reserved.
        </p>
      </footer>
      */}
    </div>
  );
}
