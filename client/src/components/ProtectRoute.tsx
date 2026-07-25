'use client';

import React, { useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useRouter } from 'next/navigation';

interface ProtectRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('ADMIN' | 'AGENT' | 'CUSTOMER')[];
}

export default function ProtectRoute({ children, allowedRoles }: ProtectRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, router, allowedRoles]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center space-y-4">
          {/* Custom premium glowing loading spinner */}
          <div className="relative h-12 w-12">
            <div className="absolute h-full w-full rounded-full border-4 border-slate-800"></div>
            <div className="absolute h-full w-full rounded-full border-t-4 border-indigo-500 animate-spin"></div>
          </div>
          <p className="text-sm font-medium tracking-wide text-slate-400 animate-pulse">
            Verifying your credentials...
          </p>
        </div>
      </div>
    );
  }

  // If user is authenticated and has allowed role, render the children
  if (user && (!allowedRoles || allowedRoles.includes(user.role))) {
    return <>{children}</>;
  }

  return null;
}
