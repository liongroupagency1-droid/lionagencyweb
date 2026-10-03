import React, { useState, useMemo } from 'react';
import {
  HandCoins,
  Plus,
  Percent,
  Receipt,
  Download,
  CheckCircle,
  Building2,
  User as UserIcon,
  X,
  Save,
  Sliders,
} from 'lucide-react';
import { storage } from '../services/storage';
import { PayoutRule, PayoutRecord } from '../types';
import { ExcelService } from '../services/excelService';

export const PayoutModule: React.FC = () => {
  const [rules, setRules] = useState<PayoutRule[]>(() => storage.getPayoutRules());
  const [payouts, setPayouts] = useState<PayoutRecord[]>(() => storage.getPayouts());
  const officers = useMemo(() => storage.getOfficers(), []);
  const companies = useMemo(() => storage.getFinanceCompanies(), []);
  const settings = storage.getSettings();

  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [ruleError, setRuleError] = useState('');
  const [ruleForm, setRuleForm] = useState<Partial<PayoutRule>>({
    title: '',
    method: 'PERCENTAGE',
    rate: 2,
    officerId: '',
    financeCompanyId: '',
    collectionType: '',
    status: 'ACTIVE',
  });

  const refreshData = () => {
    setRules([...storage.getPayoutRules()]);
    setPayouts([...storage.getPayouts()]);
  };

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    setRuleError('');
    if (!ruleForm.title || !ruleForm.rate) {
      setRuleError('Please enter title and rate.');
      return;
    }

    storage.savePayoutRule({
      id: 'rule-' + Date.now(),
      title: ruleForm.title,
      method: ruleForm.method || 'PERCENTAGE',
      rate: Number(ruleForm.rate) || 0,
      officerId: ruleForm.officerId || undefined,
      financeCompanyId: ruleForm.financeCompanyId || undefined,
      collectionType: ruleForm.collectionType || undefined,
      status: 'ACTIVE',
    });

    setIsRuleModalOpen(false);
    refreshData();
  };

  const handleToggleRuleStatus = (rule: PayoutRule) => {
    const updated = {
      ...rule,
      status: (rule.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE') as any,
    };
    storage.savePayoutRule(updated);
    refreshData();
  };

  const handleApprovePayout = (id: string) => {
    storage.updatePayoutStatus(id, 'PAID');
    refreshData();
  };

  const handleExport = () => {
    ExcelService.exportToExcel(payouts, 'Lion_Group_Agency_Payouts', 'Payouts');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <HandCoins className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white">Officer Payout &amp; Incentive Engine</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Rules engine supporting Per-Receipt (e.g. ₹100/slip) or Percentage (e.g. 2%) by Officer, Financier &amp; Collection Type
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Export Payouts
          </button>
          <button
            onClick={() => {
              setRuleForm({
                title: '',
                method: 'PERCENTAGE',
                rate: 2,
                officerId: '',
                financeCompanyId: '',
                collectionType: '',
                status: 'ACTIVE',
              });
              setIsRuleModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md"
          >
            <Plus className="w-4 h-4" />
            Add Payout Rule
          </button>
        </div>
      </div>

      {/* Configured Rules Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-4 h-4 text-amber-400" />
          Active Payout Commission Rules
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {rules.map((rule) => {
            const officer = officers.find((o) => o.id === rule.officerId);
            const co = companies.find((c) => c.id === rule.financeCompanyId);

            return (
              <div
                key={rule.id}
                className="p-4 rounded-xl bg-slate-850 border border-slate-800 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-white text-xs">{rule.title}</span>
                    <button
                      onClick={() => handleToggleRuleStatus(rule)}
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        rule.status === 'ACTIVE'
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {rule.status}
                    </button>
                  </div>

                  <div className="mt-2 text-lg font-black font-mono text-amber-400 flex items-center gap-1">
                    {rule.method === 'PER_RECEIPT' ? (
                      <>
                        <Receipt className="w-4 h-4 text-slate-400" />
                        <span>₹{rule.rate} / Receipt</span>
                      </>
                    ) : (
                      <>
                        <Percent className="w-4 h-4 text-slate-400" />
                        <span>{rule.rate}% of Collected Amount</span>
                      </>
                    )}
                  </div>

                  <div className="mt-2 space-y-1 text-[11px] text-slate-400">
                    <div>
                      Officer: <strong className="text-slate-300">{officer?.name || 'All Officers'}</strong>
                    </div>
                    <div>
                      Financier: <strong className="text-slate-300">{co?.shortName || 'All Companies'}</strong>
                    </div>
                    <div>
                      Type: <strong className="text-slate-300">{rule.collectionType || 'All Types'}</strong>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payouts Disbursal Ledger */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Payout Settlements Ledger ({payouts.length})
          </h3>
          <span className="text-xs text-slate-400">
            Total Commission:{' '}
            <strong className="text-amber-400 font-mono text-sm">
              ₹{payouts.reduce((a, b) => a + b.payoutAmount, 0).toLocaleString()}
            </strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Officer</th>
                <th className="py-2.5 px-3">Financier</th>
                <th className="py-2.5 px-3">Collection Amount</th>
                <th className="py-2.5 px-3">Rule Applied</th>
                <th className="py-2.5 px-3 text-right">Payout Amount</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {payouts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 font-sans text-xs">
                    No payouts evaluated yet. New collections automatically trigger payout rules.
                  </td>
                </tr>
              ) : (
                payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 text-slate-400">{p.date}</td>
                    <td className="py-2.5 px-3 font-sans font-semibold text-white">{p.officerName}</td>
                    <td className="py-2.5 px-3 text-slate-300">{p.financeCompanyName}</td>
                    <td className="py-2.5 px-3 text-slate-300">₹{p.collectionAmount?.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-400 font-sans">
                      {p.payoutMethod === 'PER_RECEIPT' ? `₹${p.payoutRate} flat` : `${p.payoutRate}% comm.`}
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-amber-400">
                      ₹{p.payoutAmount?.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-center font-sans">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.status === 'PAID'
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                            : 'bg-amber-950/60 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-sans">
                      {p.status !== 'PAID' && (
                        <button
                          onClick={() => handleApprovePayout(p.id)}
                          className="px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] shadow-sm"
                        >
                          Disburse
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Payout Rule Modal */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in duration-150">
            <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <HandCoins className="w-4 h-4 text-amber-400" />
                Configure Payout Rule
              </h2>
              <button
                onClick={() => setIsRuleModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="p-6 space-y-4 text-xs">
              {ruleError && (
                <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs">
                  {ruleError}
                </div>
              )}
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Rule Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2% General Collection Payout"
                  value={ruleForm.title}
                  onChange={(e) => setRuleForm({ ...ruleForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Method</label>
                  <select
                    value={ruleForm.method}
                    onChange={(e) => setRuleForm({ ...ruleForm, method: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="PERCENTAGE">PERCENTAGE (%)</option>
                    <option value="PER_RECEIPT">PER RECEIPT (₹)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-amber-400">
                    {ruleForm.method === 'PERCENTAGE' ? 'Percentage Rate (%) *' : 'Flat Amount (₹) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min={0.1}
                    step={0.1}
                    value={ruleForm.rate}
                    onChange={(e) => setRuleForm({ ...ruleForm, rate: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-amber-500/50 text-xs text-amber-300 font-bold font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Specific Officer (Optional)</label>
                <select
                  value={ruleForm.officerId}
                  onChange={(e) => setRuleForm({ ...ruleForm, officerId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Apply to All Officers --</option>
                  {officers.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Specific Financier (Optional)</label>
                <select
                  value={ruleForm.financeCompanyId}
                  onChange={(e) => setRuleForm({ ...ruleForm, financeCompanyId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Apply to All Financiers --</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.shortName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Specific Collection Type (Optional)</label>
                <select
                  value={ruleForm.collectionType}
                  onChange={(e) => setRuleForm({ ...ruleForm, collectionType: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Apply to All Collection Types --</option>
                  {settings.collectionTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRuleModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs shadow-md"
                >
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
