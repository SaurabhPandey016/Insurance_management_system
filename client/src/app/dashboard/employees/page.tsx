'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import {
  Users,
  UserCheck,
  Shield,
  Activity,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle,
  Mail,
  Phone,
  Trash2,
  Edit,
  ShieldAlert
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000/api';

export default function EmployeesPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms visibility
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedEditEmployee, setSelectedEditEmployee] = useState<any>(null);

  // Create form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('AGENT');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('General Insurance');
  const [agentCode, setAgentCode] = useState('');

  // Edit form inputs
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editAgentCode, setEditAgentCode] = useState('');
  const [editStatus, setEditStatus] = useState('ACTIVE');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/employees`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setEmployees(data.employees);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchEmployees();
    }
  }, [user]);

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch(`${API_URL}/admin/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          phone: phone || undefined,
          department: role === 'AGENT' ? department : undefined,
          agentCode: role === 'AGENT' ? agentCode || undefined : undefined,
        }),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage(data.message || 'Staff profile registered successfully.');
        setShowCreateForm(false);
        // Reset form
        setName('');
        setEmail('');
        setPassword('');
        setRole('AGENT');
        setPhone('');
        setDepartment('General Insurance');
        setAgentCode('');
        await fetchEmployees();
      } else {
        setError(data.message || 'Failed to register employee.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEditEmployee) return;

    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch(`${API_URL}/admin/employees/${selectedEditEmployee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          phone: editPhone || undefined,
          department: selectedEditEmployee.role === 'AGENT' ? editDepartment : undefined,
          agentCode: selectedEditEmployee.role === 'AGENT' ? editAgentCode : undefined,
          status: selectedEditEmployee.role === 'AGENT' ? editStatus : undefined,
        }),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage('Employee details updated successfully.');
        setSelectedEditEmployee(null);
        await fetchEmployees();
      } else {
        setError(data.message || 'Failed to update employee details.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEmployee = async (empId: string) => {
    if (!confirm('Are you sure you want to permanently delete this employee account? This action is irreversible.')) return;

    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch(`${API_URL}/admin/employees/${empId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage('Employee account deleted successfully.');
        await fetchEmployees();
      } else {
        setError(data.message || 'Failed to delete employee account.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error.');
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
        <p className="text-sm text-slate-500">Only system administrators can inspect or manage staff directories.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 border-b border-slate-900 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Staff Directory</h1>
          <p className="text-sm text-slate-400 mt-1">Manage system administrators, employee accounts, and agent profiles</p>
        </div>
        <button
          onClick={() => {
            setShowCreateForm(!showCreateForm);
            setSelectedEditEmployee(null);
            setError('');
            setMessage('');
          }}
          className="flex items-center space-x-2 rounded-xl bg-indigo-650 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 transition active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          <span>{showCreateForm ? 'Cancel Registration' : 'Register Staff'}</span>
        </button>
      </div>

      {/* Notifications */}
      {message && (
        <div className="flex items-center space-x-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-450">
          <CheckCircle className="h-4.5 w-4.5 animate-pulse" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-455">
          <AlertCircle className="h-4.5 w-4.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Form: Register Staff */}
      {showCreateForm && (
        <form onSubmit={handleCreateEmployee} className="rounded-2xl border border-slate-900 bg-slate-900/20 p-6 space-y-4 max-w-2xl animate-fadeIn">
          <h3 className="text-base font-bold text-slate-200 border-b border-slate-950 pb-2">Register New Staff Account</h3>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Role Type *</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:outline-none"
              >
                <option value="AGENT">Agent / Employee</option>
                <option value="ADMIN">System Administrator</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Account Password *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Contact Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
            {role === 'AGENT' && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Agent License Code (Optional)</label>
                <input
                  type="text"
                  value={agentCode}
                  onChange={(e) => setAgentCode(e.target.value)}
                  placeholder="e.g. AGT-100223 (Autogenerated if empty)"
                  className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            )}
          </div>

          {role === 'AGENT' && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Assigned Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center space-x-1.5 rounded-lg bg-indigo-650 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-500 transition disabled:bg-indigo-700"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                <span>Registering...</span>
              </>
            ) : (
              <span>Register Staff Profile</span>
            )}
          </button>
        </form>
      )}

      {/* Form: Edit Staff Profile */}
      {selectedEditEmployee && (
        <form onSubmit={handleUpdateEmployee} className="rounded-2xl border border-slate-900 bg-slate-900/20 p-6 space-y-4 max-w-2xl animate-fadeIn">
          <h3 className="text-base font-bold text-slate-200 border-b border-slate-950 pb-2">Edit Staff Profile: {selectedEditEmployee.email}</h3>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name *</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Contact Phone</label>
              <input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {selectedEditEmployee.role === 'AGENT' && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Agent License Code</label>
                <input
                  type="text"
                  value={editAgentCode}
                  onChange={(e) => setEditAgentCode(e.target.value)}
                  className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Assigned Department</label>
                <input
                  type="text"
                  value={editDepartment}
                  onChange={(e) => setEditDepartment(e.target.value)}
                  className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Profile Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:outline-none"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-indigo-650 px-5 py-2 text-xs font-bold text-white shadow hover:bg-indigo-500 transition disabled:bg-indigo-700"
            >
              {submitting ? 'Saving...' : 'Save Profile Changes'}
            </button>
            <button
              type="button"
              onClick={() => setSelectedEditEmployee(null)}
              className="rounded-lg border border-slate-800 bg-slate-950 px-5 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Staff List Table */}
      <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-6">
        <h3 className="text-base font-bold text-slate-200 mb-6">Active System Staff</h3>
        
        {employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3 rounded-xl bg-slate-950/40 border border-slate-900 text-center">
            <Users className="h-10 w-10 text-slate-650" />
            <p className="text-sm font-semibold text-slate-300">No employees registered.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-xs font-semibold uppercase tracking-wider text-slate-450 border-b border-slate-900">
                <tr>
                  <th className="px-4 py-3.5">Name</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">Email</th>
                  <th className="px-4 py-3.5">Phone</th>
                  <th className="px-4 py-3.5">Dept/Code</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/80">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-900/40 transition">
                    <td className="px-4 py-3.5 font-semibold text-white">{emp.name}</td>
                    <td className="px-4 py-3.5 text-xs">
                      <span className={`inline-flex items-center space-x-1 rounded-full px-2 py-0.5 border font-mono tracking-wider uppercase text-[9px]
                        ${emp.role === 'ADMIN' 
                          ? 'bg-rose-500/10 text-rose-455 border-rose-500/20' 
                          : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}`}>
                        {emp.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-450 text-xs">{emp.email}</td>
                    <td className="px-4 py-3.5 text-slate-400 text-xs">{emp.phone || '—'}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-350">
                      {emp.role === 'AGENT' && emp.agentProfile ? (
                        <div>
                          <div className="font-semibold">{emp.agentProfile.agentCode}</div>
                          <div className="text-[10px] text-slate-500">{emp.agentProfile.department}</div>
                        </div>
                      ) : (
                        <span className="italic text-slate-650">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center text-xs">
                      {emp.role === 'AGENT' && emp.agentProfile ? (
                        <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase
                          ${emp.agentProfile.status === 'ACTIVE' 
                            ? 'bg-emerald-500/10 text-emerald-450' 
                            : 'bg-rose-500/10 text-rose-455'}`}>
                          {emp.agentProfile.status}
                        </span>
                      ) : (
                        <span className="bg-emerald-500/10 text-emerald-450 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase">
                          ACTIVE
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedEditEmployee(emp);
                          setEditName(emp.name);
                          setEditPhone(emp.phone || '');
                          setEditDepartment(emp.agentProfile?.department || '');
                          setEditAgentCode(emp.agentProfile?.agentCode || '');
                          setEditStatus(emp.agentProfile?.status || 'ACTIVE');
                          setShowCreateForm(false);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="p-1.5 rounded bg-slate-900 hover:bg-slate-850 hover:text-white transition"
                        title="Edit Details"
                      >
                        <Edit className="h-3.5 w-3.5 text-slate-400" />
                      </button>
                      
                      {emp.id !== user?.id && (
                        <button
                          onClick={() => handleDeleteEmployee(emp.id)}
                          className="p-1.5 rounded bg-rose-500/10 hover:bg-rose-600 hover:text-white transition"
                          title="Delete Employee"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-rose-450" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
