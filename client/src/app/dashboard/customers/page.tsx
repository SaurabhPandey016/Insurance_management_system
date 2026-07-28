'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import {
  Users,
  Plus,
  Activity,
  Calendar,
  AlertCircle,
  CheckCircle,
  Search,
  ChevronRight,
  ClipboardList,
  UserCheck,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  FileCheck,
  Loader2
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000/api';

export default function CustomersPage() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal / details states
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [selectedCustomerDetails, setSelectedCustomerDetails] = useState<any>(null);
  const [fetchingDetails, setFetchingDetails] = useState(false);

  // Register Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [dob, setDob] = useState('');

  // Edit Form states
  const [selectedEditCustomer, setSelectedEditCustomer] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editDob, setEditDob] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCustomers = async (searchQuery = '') => {
    try {
      const query = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
      const res = await fetch(`${API_URL}/customers${query}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) setCustomers(data.customers);
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [user]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    fetchCustomers(e.target.value);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Name, email, and password are required.');
      return;
    }

    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch(`${API_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        setMessage('Customer registered successfully.');
        setShowRegisterForm(false);
        // Reset form
        setName('');
        setEmail('');
        setPhone('');
        setPassword('');
        setAddress('');
        setDob('');
        await fetchCustomers();
      } else {
        setError(data.message || 'Failed to register customer.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEditCustomer) return;
    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/customers/${selectedEditCustomer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          phone: editPhone || undefined,
          address: editAddress || undefined,
          dob: editDob || undefined,
        }),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage('Customer profile updated successfully.');
        setSelectedEditCustomer(null);
        await fetchCustomers();
      } else {
        setError(data.message || 'Failed to update customer details.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewDetails = async (cId: string) => {
    setFetchingDetails(true);
    setSelectedCustomerDetails(null);
    try {
      const res = await fetch(`${API_URL}/customers/${cId}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setSelectedCustomerDetails(data.customer);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Error fetching customer details:', err);
    } finally {
      setFetchingDetails(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Activity className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 border-b border-slate-900 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Customer Registry</h1>
          <p className="text-sm text-slate-400 mt-1">Register new client accounts and inspect history records</p>
        </div>
        <div>
          <button
            onClick={() => {
              setShowRegisterForm(!showRegisterForm);
              setSelectedCustomerDetails(null);
              setError('');
              setMessage('');
            }}
            className="flex items-center space-x-2 rounded-xl bg-indigo-650 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-500 transition active:scale-[0.98]"
          >
            <UserCheck className="h-4 w-4" />
            <span>{showRegisterForm ? 'Close Form' : 'Register Customer'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {message && (
        <div className="flex items-center space-x-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-450">
          <CheckCircle className="h-4.5 w-4.5" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-455">
          <AlertCircle className="h-4.5 w-4.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Edit Customer Form */}
      {selectedEditCustomer && (
        <form onSubmit={handleEditSubmit} className="rounded-2xl border border-slate-900 bg-slate-900/20 p-6 space-y-4 max-w-2xl animate-fadeIn">
          <h3 className="text-base font-bold text-slate-200 border-b border-slate-950 pb-2">Edit Customer: {selectedEditCustomer.email}</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Customer Name *</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
              <input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Date of Birth</label>
              <input
                type="date"
                value={editDob}
                onChange={(e) => setEditDob(e.target.value)}
                className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Residential Address</label>
              <input
                type="text"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-indigo-650 px-5 py-2 text-xs font-bold text-white shadow hover:bg-indigo-500 transition"
            >
              {submitting ? 'Updating...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => setSelectedEditCustomer(null)}
              className="rounded-lg border border-slate-800 bg-slate-950 px-5 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* 1. Detail Panel: Customer History Summary */}
      {selectedCustomerDetails && (
        <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-6 space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-950 pb-2">
            <h3 className="text-base font-bold text-slate-200">History Timeline: {selectedCustomerDetails.name}</h3>
            <button
              onClick={() => setSelectedCustomerDetails(null)}
              className="text-xs text-slate-500 hover:text-white transition"
            >
              Close History Panel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 rounded-xl bg-slate-950 p-5 border border-slate-900">
            {/* Contact Card */}
            <div className="space-y-3.5 text-xs text-slate-400">
              <h4 className="font-bold text-indigo-400 uppercase tracking-widest text-[10px]">Contact Info</h4>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-indigo-500/60" />
                <span className="text-slate-200">{selectedCustomerDetails.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-indigo-500/60" />
                <span className="text-slate-200">{selectedCustomerDetails.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-indigo-500/60" />
                <span className="text-slate-200">{selectedCustomerDetails.address}</span>
              </div>
            </div>

            {/* Issued Policies */}
            <div className="space-y-3 text-xs md:border-l md:border-slate-900 md:pl-6">
              <h4 className="font-bold text-violet-400 uppercase tracking-widest text-[10px]">Active Contracts</h4>
              {selectedCustomerDetails.policies.length === 0 ? (
                <span className="italic text-slate-650 text-[11px] block mt-2">No active policies</span>
              ) : (
                <div className="space-y-2">
                  {selectedCustomerDetails.policies.map((p: any) => (
                    <div key={p.id} className="flex justify-between items-center bg-slate-900/50 rounded-lg p-2 border border-slate-900">
                      <div>
                        <span className="font-semibold text-slate-200 block">{p.policyType?.name}</span>
                        <span className="text-[10px] text-slate-500">{p.policyNumber}</span>
                      </div>
                      <span className="font-bold text-white text-[11px]">${p.premiumAmount.toFixed(2)}/mo</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Claim History */}
            <div className="space-y-3 text-xs md:border-l md:border-slate-900 md:pl-6">
              <h4 className="font-bold text-amber-400 uppercase tracking-widest text-[10px]">Submitted Claims</h4>
              {selectedCustomerDetails.claims.length === 0 ? (
                <span className="italic text-slate-650 text-[11px] block mt-2">No claims filed</span>
              ) : (
                <div className="space-y-2">
                  {selectedCustomerDetails.claims.map((claim: any) => (
                    <div key={claim.id} className="flex justify-between items-center bg-slate-900/50 rounded-lg p-2 border border-slate-900">
                      <div>
                        <span className="font-semibold text-slate-200 block">{claim.claimNumber}</span>
                        <span className="text-[10px] text-slate-500">{claim.policy?.policyType?.name}</span>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full
                        ${claim.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-450' :
                          claim.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-455' :
                          'bg-amber-500/10 text-amber-400'}`}>
                        {claim.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Form: Register Customer by Agent/Admin */}
      {showRegisterForm && (
        <form onSubmit={handleRegister} className="rounded-2xl border border-slate-900 bg-slate-900/20 p-6 space-y-4 max-w-2xl animate-fadeIn">
          <h3 className="text-base font-bold text-slate-200 border-b border-slate-950 pb-2">Register Client Profile</h3>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Customer Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-700 focus:outline-none focus:border-indigo-500 transition"
                placeholder="e.g. Rahul Sharma"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-700 focus:outline-none focus:border-indigo-500 transition"
                placeholder="e.g. rahul@insurance.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-700 focus:outline-none focus:border-indigo-500 transition"
                placeholder="e.g. 9876543210"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-700 focus:outline-none focus:border-indigo-500 transition"
              placeholder="Assign a default login password..."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Residential Address</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition h-20 resize-none"
              placeholder="e.g. Sector 5, Bangalore"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center space-x-1.5 rounded-lg bg-indigo-605 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-500 transition disabled:bg-indigo-700"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                <span>Registering...</span>
              </>
            ) : (
              <span>Register Customer Profile</span>
            )}
          </button>
        </form>
      )}

      {/* 3. Search and List Customers */}
      <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h3 className="text-base font-bold text-slate-200">Registered Customer List</h3>
          
          {/* Search bar */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              className="block w-full rounded-lg border border-slate-800 bg-slate-950 pl-10 pr-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              placeholder="Search by name, email..."
            />
          </div>
        </div>

        {customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3 rounded-xl bg-slate-950/40 border border-slate-900 text-center">
            <Users className="h-10 w-10 text-slate-650" />
            <p className="text-sm font-semibold text-slate-300">No customers registered.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-xs font-semibold uppercase tracking-wider text-slate-450 border-b border-slate-900">
                <tr>
                  <th className="px-4 py-3.5">Customer Name</th>
                  <th className="px-4 py-3.5">Email</th>
                  <th className="px-4 py-3.5">Phone</th>
                  <th className="px-4 py-3.5">Registering Agent</th>
                  <th className="px-4 py-3.5">Date Registered</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/80">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/40 transition">
                    <td className="px-4 py-3.5 font-semibold text-white">{c.name}</td>
                    <td className="px-4 py-3.5 text-slate-350">{c.email}</td>
                    <td className="px-4 py-3.5 text-slate-400">{c.phone || 'N/A'}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-400">
                      <span className="rounded-full bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 border border-indigo-500/20">
                        {c.agentName}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleViewDetails(c.id)}
                        disabled={fetchingDetails}
                        className="rounded bg-indigo-600/20 hover:bg-indigo-600 px-2.5 py-1.5 text-xs font-bold text-indigo-400 hover:text-white transition active:scale-[0.98]"
                      >
                        Inspect History
                      </button>
                      <button
                        onClick={() => {
                          setSelectedEditCustomer(c);
                          setEditName(c.name);
                          setEditPhone(c.phone || '');
                          setEditAddress(c.address || '');
                          setEditDob(c.dob ? new Date(c.dob).toISOString().split('T')[0] : '');
                          setSelectedCustomerDetails(null);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="rounded bg-emerald-600/20 hover:bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-emerald-450 hover:text-white transition active:scale-[0.98]"
                      >
                        Edit Details
                      </button>
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
