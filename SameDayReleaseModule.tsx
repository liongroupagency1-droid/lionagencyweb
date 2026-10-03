import React, { useState, useMemo } from 'react';
import {
  Zap,
  CheckCircle2,
  CarFront,
  Receipt,
  CircleDollarSign,
  Fuel,
  ArrowRight,
  ShieldCheck,
  Printer,
  Calendar,
  Clock,
  Building2,
  Phone,
} from 'lucide-react';
import { storage } from '../services/storage';
import { CaseRecord, FinanceCompany } from '../types';
import { ReceiptPrintModal } from '../components/ReceiptPrintModal';

export const SameDayReleaseModule: React.FC = () => {
  const companies = useMemo(() => storage.getFinanceCompanies(), []);
  const cases = useMemo(() => storage.getCases(), []);
  const settings = storage.getSettings();

  const todayStr = new Date().toISOString().split('T')[0];
  const currentTimeStr = new Date().toTimeString().substring(0, 5);

  const [selectedCaseId, setSelectedCaseId] = useState('');

  const [form, setForm] = useState({
    caseId: '',
    financeCompanyId: companies[0]?.id || '',
    financeCompanyName: companies[0]?.shortName || '',
    vehicleNumber: '',
    customerName: '',
    loanAgreementNumber: '',
    vehicleMake: '',
    model: '',
    repoDate: todayStr,
    repoTime: '10:30',
    releaseDate: todayStr,
    releaseTime: currentTimeStr,
    yardName: settings.yardNames[0] || 'Dahod Central Yard',
    yardTime: '11:15',
    customerReleasePayment: 15000,
    paymentMode: 'Cash',
    repoAgentName: 'Vikram Chauhan',
    repoAgentMobile: '9723045678',
    repoAgentCharge: 1500,
    otherCharges: 300,
    remarks: 'Customer settled overdue amount at office within 3 hours of repossession.',
  });

  const [completedResult, setCompletedResult] = useState<{
    repoRelease: any;
    collection: any;
    vehicleYard: any;
  } | null>(null);

  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCaseSelect = (caseId: string) => {
    setSelectedCaseId(caseId);
    const c = cases.find((item) => item.id === caseId);
    if (c) {
      setForm((prev) => ({
        ...prev,
        caseId: c.id,
        financeCompanyId: c.financeCompanyId,
        financeCompanyName: c.financeCompanyName,
        loanAgreementNumber: c.loanAgreementNumber,
        customerName: c.customerName,
        vehicleNumber: c.registrationNumber || '',
        vehicleMake: c.assetMake || '',
        model: c.model || '',
        customerReleasePayment: c.tos || 15000,
      }));
    }
  };

  const handleExecuteSameDayRelease = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!form.vehicleNumber || !form.customerName || !form.customerReleasePayment) {
      setErrorMessage('Vehicle Number, Customer Name and Payment Amount are required.');
      return;
    }

    try {
      const co = companies.find((c) => c.id === form.financeCompanyId);

      // Execute single atomic transaction
      const result = storage.processSameDayRelease({
        ...form,
        financeCompanyName: co?.shortName || form.financeCompanyName,
      });

      setCompletedResult(result);
    } catch (err: any) {
      setErrorMessage(`Error during Same-Day Release execution: ${err.message}`);
    }
  };

  const handleReset = () => {
    setCompletedResult(null);
    setSelectedCaseId('');
    setForm({
      caseId: '',
      financeCompanyId: companies[0]?.id || '',
      financeCompanyName: companies[0]?.shortName || '',
      vehicleNumber: '',
      customerName: '',
      loanAgreementNumber: '',
      vehicleMake: '',
      model: '',
      repoDate: todayStr,
      repoTime: '10:30',
      releaseDate: todayStr,
      releaseTime: currentTimeStr,
      yardName: settings.yardNames[0] || 'Dahod Central Yard',
      yardTime: '11:15',
      customerReleasePayment: 15000,
      paymentMode: 'Cash',
      repoAgentName: 'Vikram Chauhan',
      repoAgentMobile: '9723045678',
      repoAgentCharge: 1500,
      otherCharges: 300,
      remarks: 'Customer settled overdue amount at office within 3 hours of repossession.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border border-amber-500/40 rounded-xl p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold shadow-md">
              <Zap className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">Same-Day Release (1-Step Atomic Execution)</h1>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
                Guaranteed Single Multi-Module Transaction
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2 max-w-3xl">
            Repossessed today and customer settled payment today. Automatically posts Repo entry, Vehicle Yard entry, Official Collection Receipt, Daily Hisab cash ledger, and closes case status without duplicate steps.
          </p>
        </div>
      </div>

      {!completedResult ? (
        <form onSubmit={handleExecuteSameDayRelease} className="space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center justify-between">
              <span>{errorMessage}</span>
              <button type="button" onClick={() => setErrorMessage('')} className="p-1 text-red-400 hover:text-white">
                ✕
              </button>
            </div>
          )}
          {/* Quick Select Case */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
            <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>Select Active Delinquent Case</span>
            </label>
            <select
              value={selectedCaseId}
              onChange={(e) => handleCaseSelect(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="">-- Choose Existing Case or Fill Below Manually --</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.loanAgreementNumber} — {c.customerName} ({c.financeCompanyName}, Reg: {c.registrationNumber || 'N/A'}, Overdue: ₹{c.tos})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Step 1: Vehicle & Repossession Details */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-lg">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                  Vehicle &amp; Repo Custody
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-300">
                    Vehicle Registration Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GJ-20-AB-1234"
                    value={form.vehicleNumber}
                    onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300">Loan Agreement Number</label>
                  <input
                    type="text"
                    value={form.loanAgreementNumber}
                    onChange={(e) => setForm({ ...form, loanAgreementNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300">Finance Company</label>
                  <select
                    value={form.financeCompanyId}
                    onChange={(e) => setForm({ ...form, financeCompanyId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.shortName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-300">Asset Make</label>
                    <input
                      type="text"
                      placeholder="e.g. TVS"
                      value={form.vehicleMake}
                      onChange={(e) => setForm({ ...form, vehicleMake: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-300">Model</label>
                    <input
                      type="text"
                      placeholder="e.g. Apache RTR"
                      value={form.model}
                      onChange={(e) => setForm({ ...form, model: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Repo Timing & Agent Details */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-lg">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                  2
                </span>
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                  Repo Logistics &amp; Yard Details
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-300">Repo Date</label>
                    <input
                      type="date"
                      value={form.repoDate}
                      onChange={(e) => setForm({ ...form, repoDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-300">Repo Time</label>
                    <input
                      type="time"
                      value={form.repoTime}
                      onChange={(e) => setForm({ ...form, repoTime: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-300">Yard Name</label>
                  <select
                    value={form.yardName}
                    onChange={(e) => setForm({ ...form, yardName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                  >
                    {settings.yardNames.map((yard) => (
                      <option key={yard} value={yard}>
                        {yard}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300">Repo Agent Name</label>
                  <input
                    type="text"
                    value={form.repoAgentName}
                    onChange={(e) => setForm({ ...form, repoAgentName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300">Repo Agent Mobile</label>
                  <input
                    type="tel"
                    value={form.repoAgentMobile}
                    onChange={(e) => setForm({ ...form, repoAgentMobile: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-300">Repo Charge (₹)</label>
                    <input
                      type="number"
                      value={form.repoAgentCharge}
                      onChange={(e) => setForm({ ...form, repoAgentCharge: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-300">Yard / Misc (₹)</label>
                    <input
                      type="number"
                      value={form.otherCharges}
                      onChange={(e) => setForm({ ...form, otherCharges: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Customer Payment & Release Authorization */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    3
                  </span>
                  <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                    Customer Payment &amp; Release
                  </h3>
                </div>

                <div className="space-y-3 text-xs mt-3">
                  <div>
                    <label className="font-semibold text-emerald-400">
                      Customer Release Payment (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={form.customerReleasePayment}
                      onChange={(e) => setForm({ ...form, customerReleasePayment: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-emerald-500/60 text-lg font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300">Payment Mode</label>
                    <select
                      value={form.paymentMode}
                      onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                    >
                      {settings.paymentModes.map((mode) => (
                        <option key={mode} value={mode}>
                          {mode}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-slate-300">Release Date</label>
                      <input
                        type="date"
                        value={form.releaseDate}
                        onChange={(e) => setForm({ ...form, releaseDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-300">Release Time</label>
                      <input
                        type="time"
                        value={form.releaseTime}
                        onChange={(e) => setForm({ ...form, releaseTime: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300">Release Settlement Remarks</label>
                    <textarea
                      rows={2}
                      value={form.remarks}
                      onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-800">
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                >
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>Execute 1-Step Same-Day Release</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        /* Success Screen */
        <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-8 shadow-2xl space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center gap-4 border-b border-slate-800 pb-5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                Transaction Completed
              </span>
              <h2 className="text-xl font-bold text-white mt-1">
                Same-Day Release Executed for {completedResult.vehicleYard.vehicleNumber}
              </h2>
              <p className="text-xs text-slate-400">
                Status set to <strong className="text-emerald-400">RELEASED SAME DAY</strong>. All linked financial and yard ledgers updated.
              </p>
            </div>
          </div>

          {/* Atomic Updates Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">1. Collection Ledger</span>
              <div className="text-emerald-400 font-mono font-bold text-base">
                +₹{completedResult.collection.collectionAmount?.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400">
                Receipt: {completedResult.collection.receiptNumber}
              </div>
            </div>

            <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">2. Daily Hisab</span>
              <div className="text-amber-400 font-mono font-bold text-base">
                Auto-Tallied
              </div>
              <div className="text-[10px] text-slate-400">
                Opening + Collection - Agent fee
              </div>
            </div>

            <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">3. Yard Custody</span>
              <div className="text-white font-mono font-bold text-base">
                RELEASED
              </div>
              <div className="text-[10px] text-slate-400">
                Custody cleared from {completedResult.vehicleYard.yardName}
              </div>
            </div>

            <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">4. Audit Trail</span>
              <div className="text-cyan-400 font-mono font-bold text-base">
                Logged
              </div>
              <div className="text-[10px] text-slate-400">
                Immutable event recorded
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => setShowReceiptModal(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Customer Money Receipt</span>
            </button>

            <button
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              Process Another Same-Day Release
            </button>
          </div>
        </div>
      )}

      {/* Printable Receipt Preview Modal */}
      {showReceiptModal && completedResult && (
        <ReceiptPrintModal
          receipt={completedResult.collection}
          onClose={() => setShowReceiptModal(false)}
        />
      )}
    </div>
  );
};
