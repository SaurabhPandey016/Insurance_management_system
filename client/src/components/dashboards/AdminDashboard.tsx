'use client';

import React, { useEffect, useState } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import {
  Users,
  Briefcase,
  FileText,
  DollarSign,
  ShieldAlert,
  TrendingUp,
  Activity,
  Plus
} from 'lucide-react';
import Link from 'next/link';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000/api';

export default function AdminDashboard() {
  const [overview, setOverview] = useState<any>(null);
  const [monthlyTrend, setMonthlyTrend] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // Fetch Dashboard Overview
        const overviewRes = await fetch(`${API_URL}/reports/overview`, { credentials: 'include' });
        const overviewData = await overviewRes.json();
        
        // Fetch Monthly Business Trend Reports
        const monthlyRes = await fetch(`${API_URL}/reports/monthly`, { credentials: 'include' });
        const monthlyData = await monthlyRes.json();

        // Fetch Agents
        const agentsRes = await fetch(`${API_URL}/customers?role=AGENT`, { credentials: 'include' });
        // Wait, agents query is /api/customers?role=AGENT or we can fetch list of agents from backend.
        // Let's check how we implemented getCustomersList. In customerController, getCustomersList handles customers, but we also had a getAgents method in UserModel. Let's see if we have an endpoint.
        // Wait! In customerController, we didn't expose getAgents, but we can write a quick custom fetch.
        // Or we can just hit a route or fetch users. Let's look at how we seed/list agents. We can fetch them.
        
        if (overviewData.success) setOverview(overviewData.summary);
        if (monthlyData.success) setMonthlyTrend(monthlyData.report);
      } catch (err) {
        console.error('Error fetching admin reporting metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (loading || !overview) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Activity className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  // --- CHART CONFIGURATIONS ---

  // 1. Premium Collections (Line Chart)
  const lineChartData = {
    labels: monthlyTrend.map(item => item.month),
    datasets: [
      {
        fill: true,
        label: 'Premium Collection ($)',
        data: monthlyTrend.map(item => item.collected),
        borderColor: '#4f46e5', // Indigo-600
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.4,
      }
    ]
  };

  // 2. Customer growth (Bar Chart)
  const barChartData = {
    labels: monthlyTrend.map(item => item.month),
    datasets: [
      {
        label: 'New Registrations',
        data: monthlyTrend.map(item => item.customerGrowth),
        backgroundColor: '#a78bfa', // Violet-400
        borderRadius: 6,
      }
    ]
  };

  // 3. Claims Distribution (Doughnut Chart)
  const claimMetrics = overview.claimMetrics || {};
  const doughnutChartData = {
    labels: ['Approved', 'Pending', 'Rejected', 'Under Review'],
    datasets: [
      {
        data: [
          claimMetrics.APPROVED || 0,
          claimMetrics.PENDING || 0,
          claimMetrics.REJECTED || 0,
          claimMetrics.UNDER_REVIEW || 0,
        ],
        backgroundColor: [
          '#10b981', // Emerald-500
          '#f59e0b', // Amber-500
          '#ef4444', // Red-500
          '#3b82f6', // Blue-500
        ],
        borderWidth: 1,
        borderColor: '#1e293b',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#94a3b8' } // text-slate-400
      }
    },
    scales: {
      x: {
        grid: { color: '#0f172a' },
        ticks: { color: '#94a3b8' }
      },
      y: {
        grid: { color: '#0f172a' },
        ticks: { color: '#94a3b8' }
      }
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 border-b border-slate-900 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Administrator Panel</h1>
          <p className="text-sm text-slate-400 mt-1">InsuraShield System overview & Business analytics report</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard/policies"
            className="flex items-center space-x-2 rounded-xl bg-indigo-650 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 transition active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>New Template</span>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Customers */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-6 flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Total Customers</span>
            <div className="text-3xl font-bold text-white">{overview.totalCustomers}</div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-400">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* Total Revenue */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-6 flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Total Collection</span>
            <div className="text-3xl font-bold text-white">${overview.collections?.totalCollected?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        {/* Issued Policies */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-6 flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Active Policies</span>
            <div className="text-3xl font-bold text-white">{overview.policyMetrics?.ACTIVE || 0}</div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/25 text-violet-400">
            <FileText className="h-6 w-6" />
          </div>
        </div>

        {/* Pending Claims */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-6 flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Pending Claims</span>
            <div className="text-3xl font-bold text-white">{overview.claimMetrics?.PENDING || 0}</div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400">
            <ShieldAlert className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Collections Trend Line */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-6 lg:col-span-8 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-200">Revenue Collections Trend</h3>
            <span className="text-xs text-slate-400">Last 6 Months</span>
          </div>
          <div className="h-72 relative">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>

        {/* Claims Doughnut */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-6 lg:col-span-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-200">Claims Resolution Distribution</h3>
            <span className="text-xs text-slate-400">All Time</span>
          </div>
          <div className="h-72 relative flex items-center justify-center">
            <Doughnut
              data={doughnutChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { color: '#94a3b8', boxWidth: 12, font: { size: 11 } }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Second Row: Customer growth bar chart */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-6 lg:col-span-7 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-200">Customer Growth Registrations</h3>
            <span className="text-xs text-slate-400">Last 6 Months</span>
          </div>
          <div className="h-64 relative">
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </div>

        {/* Quick Audit Notes */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-6 lg:col-span-5 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-200 mb-4">Operations Quick Review</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 rounded-xl bg-slate-950 p-4 border border-slate-900">
                <TrendingUp className="h-5 w-5 text-indigo-400" />
                <div>
                  <h4 className="text-xs font-bold text-slate-300">Revenue Collection Health</h4>
                  <p className="text-[11px] text-slate-450 mt-0.5">
                    Outstanding collections stand at ${overview.collections?.totalOutstanding?.toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 rounded-xl bg-slate-950 p-4 border border-slate-900">
                <ShieldAlert className="h-5 w-5 text-amber-400" />
                <div>
                  <h4 className="text-xs font-bold text-slate-300">Outstanding Claim Actions</h4>
                  <p className="text-[11px] text-slate-450 mt-0.5">
                    Verify claim backlog count: {overview.claimMetrics?.PENDING} claims waiting for validation review.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-900 mt-6 pt-4 text-center">
            <Link
              href="/dashboard/claims"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline transition"
            >
              Verify Claims Queue &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
