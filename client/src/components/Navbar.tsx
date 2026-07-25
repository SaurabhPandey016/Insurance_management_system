'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from './AuthContext';
import { Shield, Menu, X, LogOut, User, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 text-indigo-400">
              <Shield className="h-8 w-8 text-indigo-500 fill-indigo-500/10" />
              <span className="text-xl font-bold tracking-tight text-white font-sans">
                Insura<span className="text-indigo-400">Shield</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-6">
              <Link href="/" className="text-sm font-medium text-slate-300 hover:text-indigo-450 hover:text-white transition">
                Home
              </Link>
              {user ? (
                <>
                  <Link href="/dashboard" className="flex items-center space-x-1.5 text-sm font-medium text-slate-300 hover:text-white transition">
                    <LayoutDashboard className="h-4 w-4 text-indigo-400" />
                    <span>Dashboard</span>
                  </Link>
                  <div className="flex items-center space-x-4 border-l border-slate-800 pl-6">
                    <div className="flex items-center space-x-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/25 text-indigo-400 font-bold border border-indigo-500/30">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-white leading-tight">{user.name}</span>
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider leading-none">{user.role}</span>
                      </div>
                    </div>
                    <button
                      onClick={logout}
                      className="rounded-full p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Log Out"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition">
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 hover:shadow-indigo-500/10 transition active:scale-[0.98]"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-slate-400 hover:bg-slate-900 hover:text-white transition focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950 px-2 pt-2 pb-4 space-y-1">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="block rounded-md px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-900 hover:text-white transition"
          >
            Home
          </Link>
          {user ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="block rounded-md px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-900 hover:text-white transition"
              >
                Dashboard
              </Link>
              <div className="border-t border-slate-800 my-2 pt-2 px-3">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/25 text-indigo-400 font-bold border border-indigo-500/30">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{user.name}</div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider">{user.role}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center justify-center space-x-2 rounded-md bg-rose-600/20 py-2.5 text-sm font-semibold text-rose-450 hover:bg-rose-600 hover:text-white transition"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2 mt-4 px-3">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center rounded-md border border-slate-800 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-900 hover:text-white transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center rounded-md bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 transition"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
