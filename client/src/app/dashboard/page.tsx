'use client';

import React from 'react';
import { useAuth } from '@/components/AuthContext';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import AgentDashboard from '@/components/dashboards/AgentDashboard';
import CustomerDashboard from '@/components/dashboards/CustomerDashboard';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  // Mount corresponding dashboard dynamically based on authenticated role
  switch (user.role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'AGENT':
      return <AgentDashboard />;
    case 'CUSTOMER':
      return <CustomerDashboard />;
    default:
      return (
        <div className="flex h-[60vh] flex-col items-center justify-center space-y-2 text-center bg-slate-950">
          <h2 className="text-xl font-bold text-rose-455">Invalid Role Configuration</h2>
          <p className="text-sm text-slate-400">Please contact support or log in again with correct credentials.</p>
        </div>
      );
  }
}
