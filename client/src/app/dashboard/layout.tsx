'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import ProtectRoute from '@/components/ProtectRoute';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectRoute>
      <div className="flex min-h-screen bg-slate-950 text-slate-100">
        {/* Left navigation sidebar */}
        <Sidebar />
        
        {/* Main Content Area */}
        <main className="flex-1 md:pl-64 min-h-screen">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </ProtectRoute>
  );
}
