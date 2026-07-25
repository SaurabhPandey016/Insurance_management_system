'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  FileText,
  DollarSign,
  FileUp,
  FolderOpen,
  ClipboardList,
  UserCheck
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  // Active link helper
  const isActive = (path: string) => pathname === path;

  const linkClass = (path: string) => `
    flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition duration-200
    ${isActive(path)
      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
      : 'text-slate-400 hover:bg-slate-900 hover:text-white'
    }
  `;

  // Render navigation links based on user role
  const renderLinks = () => {
    switch (user.role) {
      case 'ADMIN':
        return (
          <>
            <Link href="/dashboard" className={linkClass('/dashboard')}>
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            <Link href="/dashboard/policies" className={linkClass('/dashboard/policies')}>
              <ClipboardList className="h-5 w-5" />
              <span>Policy Templates</span>
            </Link>
            <Link href="/dashboard/customers" className={linkClass('/dashboard/customers')}>
              <Users className="h-5 w-5" />
              <span>Customer Base</span>
            </Link>
            <Link href="/dashboard/claims" className={linkClass('/dashboard/claims')}>
              <ShieldAlert className="h-5 w-5" />
              <span>Verify Claims</span>
            </Link>
            <Link href="/dashboard/payments" className={linkClass('/dashboard/payments')}>
              <DollarSign className="h-5 w-5" />
              <span>Revenue Tracking</span>
            </Link>
          </>
        );
      case 'AGENT':
        return (
          <>
            <Link href="/dashboard" className={linkClass('/dashboard')}>
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            <Link href="/dashboard/customers" className={linkClass('/dashboard/customers')}>
              <UserCheck className="h-5 w-5" />
              <span>Register Customer</span>
            </Link>
            <Link href="/dashboard/policies" className={linkClass('/dashboard/policies')}>
              <ClipboardList className="h-5 w-5" />
              <span>Issue Policies</span>
            </Link>
            <Link href="/dashboard/claims" className={linkClass('/dashboard/claims')}>
              <ShieldAlert className="h-5 w-5" />
              <span>Review Claims</span>
            </Link>
            <Link href="/dashboard/payments" className={linkClass('/dashboard/payments')}>
              <DollarSign className="h-5 w-5" />
              <span>Premium Dues</span>
            </Link>
            <Link href="/dashboard/documents" className={linkClass('/dashboard/documents')}>
              <FolderOpen className="h-5 w-5" />
              <span>File Vault</span>
            </Link>
          </>
        );
      case 'CUSTOMER':
        return (
          <>
            <Link href="/dashboard" className={linkClass('/dashboard')}>
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            <Link href="/dashboard/policies" className={linkClass('/dashboard/policies')}>
              <FileText className="h-5 w-5" />
              <span>My Policies</span>
            </Link>
            <Link href="/dashboard/claims" className={linkClass('/dashboard/claims')}>
              <ShieldAlert className="h-5 w-5" />
              <span>Submit Claim</span>
            </Link>
            <Link href="/dashboard/payments" className={linkClass('/dashboard/payments')}>
              <DollarSign className="h-5 w-5" />
              <span>Premium Payments</span>
            </Link>
            <Link href="/dashboard/documents" className={linkClass('/dashboard/documents')}>
              <FileUp className="h-5 w-5" />
              <span>Document Center</span>
            </Link>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <aside className="fixed bottom-0 left-0 top-16 hidden w-64 border-r border-slate-900 bg-slate-950 p-4 md:block">
      <div className="flex flex-col space-y-7">
        {/* Navigation Section */}
        <div>
          <h2 className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
            Navigation Menu
          </h2>
          <nav className="flex flex-col space-y-1.5">
            {renderLinks()}
          </nav>
        </div>

        {/* User Card Info */}
        <div className="mt-auto border-t border-slate-900 pt-4 px-3 flex flex-col">
          <span className="text-xs text-slate-500">Connected as</span>
          <span className="text-sm font-semibold text-slate-200 truncate">{user.name}</span>
          <span className="text-[10px] text-indigo-400 font-mono tracking-widest uppercase mt-0.5">{user.role}</span>
        </div>
      </div>
    </aside>
  );
}
