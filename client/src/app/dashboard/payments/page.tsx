'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import {
  DollarSign,
  Download,
  Calendar,
  CheckCircle,
  AlertCircle,
  Activity,
  CreditCard,
  Loader2,
  CheckCircle2
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000/api';

export default function PaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Checkout states
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<any>(null);
  const [paymentError, setPaymentError] = useState('');

  const fetchPayments = async () => {
    try {
      const res = await fetch(`${API_URL}/payments`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) setPayments(data.payments);
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [user]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;

    setPaying(true);
    setPaymentError('');
    setPaymentSuccess(null);

    try {
      const res = await fetch(`${API_URL}/payments/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: selectedPayment.id,
          paymentMethod,
        }),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setPaymentSuccess(data.payment);
        setSelectedPayment(null);
        await fetchPayments();
      } else {
        setPaymentError(data.message || 'Payment processing failed.');
      }
    } catch (err) {
      console.error(err);
      setPaymentError('Connection timed out.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Activity className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const isCustomer = user?.role === 'CUSTOMER';
  
  // Metrics
  const paidPayments = payments.filter(p => p.status === 'PAID');
  const unpaidPayments = payments.filter(p => p.status === 'PENDING' || p.status === 'OVERDUE');
  const totalCollected = paidPayments.reduce((acc, p) => acc + p.amount, 0);
  const totalOutstanding = unpaidPayments.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-8 font-sans">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 border-b border-slate-900 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Billing & Payments</h1>
          <p className="text-sm text-slate-400 mt-1">
            {isCustomer ? 'Pay your policy premiums and download payment receipts' : 'Track and manage policy collections'}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Collected */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-6 flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              {isCustomer ? 'Total Paid' : 'Total Revenue Collected'}
            </span>
            <div className="text-2xl font-bold text-white">${totalCollected.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        {/* Total Outstanding */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-6 flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Outstanding Balance</span>
            <div className="text-2xl font-bold text-white">${totalOutstanding.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-455">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        {/* Total Dues Count */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-6 flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Unpaid Installments</span>
            <div className="text-2xl font-bold text-white">{unpaidPayments.length} dues</div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400">
            <Calendar className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Notifications */}
      {paymentSuccess && (
        <div className="flex flex-col space-y-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-emerald-450">
          <div className="flex items-center space-x-2 text-xs">
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
            <span className="font-semibold">Premium paid successfully! Transaction ID: {paymentSuccess.transactionId}</span>
          </div>
          <a
            href={`${process.env.NEXT_PUBLIC_SERVER_URL}/${paymentSuccess.invoicePdfPath}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-650 hover:text-white px-3.5 py-2 text-xs font-bold text-emerald-450 transition w-fit"
          >
            <Download className="h-4 w-4" />
            <span>Download Invoice PDF</span>
          </a>
        </div>
      )}

      {paymentError && (
        <div className="flex items-center space-x-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-455">
          <AlertCircle className="h-4.5 w-4.5" />
          <span>{paymentError}</span>
        </div>
      )}

      {/* Checkout Form Container (Customer Only) */}
      {selectedPayment && isCustomer && (
        <form onSubmit={handleCheckout} className="rounded-2xl border border-slate-900 bg-slate-900/20 p-6 space-y-4 max-w-xl animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-950 pb-2">
            <h3 className="text-base font-bold text-slate-200">Checkout Installment</h3>
            <button
              type="button"
              onClick={() => setSelectedPayment(null)}
              className="text-xs text-slate-500 hover:text-white transition"
            >
              Cancel
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-950 p-4 border border-slate-900 text-xs">
            <div>
              <span className="block text-slate-500 uppercase tracking-wider text-[10px]">Policy Package</span>
              <span className="text-sm font-semibold text-white mt-0.5">{selectedPayment.policy?.policyType?.name}</span>
            </div>
            <div>
              <span className="block text-slate-500 uppercase tracking-wider text-[10px]">Installment Due</span>
              <span className="text-sm font-bold text-white mt-0.5">${selectedPayment.amount.toFixed(2)}</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Select Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="block w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
            >
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Stripe">Stripe Secure Pay</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={paying}
            className="flex items-center justify-center space-x-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-500 transition active:scale-[0.98] disabled:bg-emerald-650"
          >
            {paying ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin mr-2" />
                <span>Processing Transaction...</span>
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                <span>Pay Premium of ${selectedPayment.amount.toFixed(2)}</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* Payments History List */}
      <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-6">
        <h3 className="text-base font-bold text-slate-200 mb-6">Payment Ledger</h3>
        {payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3 rounded-xl bg-slate-950/40 border border-slate-900 text-center">
            <DollarSign className="h-10 w-10 text-slate-650" />
            <p className="text-sm font-semibold text-slate-350">No payments logs found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-xs font-semibold uppercase tracking-wider text-slate-450 border-b border-slate-900">
                <tr>
                  <th className="px-4 py-3.5">Policy Number</th>
                  <th className="px-4 py-3.5">Policy Type</th>
                  {!isCustomer && <th className="px-4 py-3.5">Customer</th>}
                  <th className="px-4 py-3.5 text-right">Amount</th>
                  <th className="px-4 py-3.5">Due Date</th>
                  <th className="px-4 py-3.5">Payment Date</th>
                  <th className="px-4 py-3.5">Transaction ID</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/80">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-900/40 transition">
                    <td className="px-4 py-3.5 font-mono text-xs text-white">{p.policy?.policyNumber}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-350">{p.policy?.policyType?.name}</td>
                    {!isCustomer && <td className="px-4 py-3.5 font-medium">{p.policy?.customer?.user?.name}</td>}
                    <td className="px-4 py-3.5 text-right text-slate-250 font-semibold">${p.amount.toFixed(2)}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-400">{new Date(p.dueDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-400">
                      {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : <span className="italic text-slate-650">N/A</span>}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-350">{p.transactionId || '—'}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full
                        ${p.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-450' :
                          p.status === 'OVERDUE' ? 'bg-rose-500/10 text-rose-455 border border-rose-500/10' :
                          'bg-slate-800 text-slate-400'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {p.status === 'PAID' && p.invoicePdfPath ? (
                        <a
                          href={`${process.env.NEXT_PUBLIC_SERVER_URL}/${p.invoicePdfPath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition"
                          title="Download Receipt"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Receipt</span>
                        </a>
                      ) : p.status !== 'PAID' && isCustomer ? (
                        <button
                          onClick={() => {
                            setSelectedPayment(p);
                            setPaymentSuccess(null);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="rounded bg-indigo-600/20 hover:bg-indigo-650 px-2.5 py-1.5 text-xs font-bold text-indigo-400 hover:text-white transition active:scale-[0.98]"
                        >
                          Pay
                        </button>
                      ) : (
                        <span className="text-xs text-slate-600 italic">Unpaid</span>
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
