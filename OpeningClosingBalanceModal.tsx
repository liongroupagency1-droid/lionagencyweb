import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Wallet,
  TrendingUp,
  TrendingDown,
  Lock,
  Unlock,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Save,
  Calculator,
  Coins,
  Receipt,
  Building,
  HelpCircle,
} from 'lucide-react';
import { storage } from '../services/storage';
import { DailyHisabRecord } from '../types';

interface OpeningClosingBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialDate?: string;
}

export const OpeningClosingBalanceModal: React.FC<OpeningClosingBalanceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialDate,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    () => initialDate || new Date().toISOString().split('T')[0]
  );

  const [hisab, setHisab] = useState<DailyHisabRecord>(() =>
    storage.refreshDailyHisabTotals(initialDate || new Date().toISOString().split('T')[0])
  );

  const [openingInput, setOpeningInput] = useState<number>(hisab.openingAmount || 0);
  const [deductionsInput, setDeductionsInput] = useState<number>(hisab.otherDeductions || 0);
  const [notesInput, setNotesInput] = useState<string>(hisab.notes || '');
  const [isLockedInput, setIsLockedInput] = useState<boolean>(hisab.isLocked || false);

  // Denominations State
  const [showDenominations, setShowDenominations] = useState<boolean>(false);
  const [denominations, setDenominations] = useState({
    note500: hisab.denominations?.note500 || 0,
    note200: hisab.denominations?.note200 || 0,
    note100: hisab.denominations?.note100 || 0,
    note50: hisab.denominations?.note50 || 0,
    note20: hisab.denominations?.note20 || 0,
    note10: hisab.denominations?.note10 || 0,
    coins: hisab.denominations?.coins || 0,
  });

  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');

  // Reload hisab record when date changes or modal opens
  useEffect(() => {
    if (isOpen) {
      const targetDate = initialDate || selectedDate;
      const refreshed = storage.refreshDailyHisabTotals(targetDate);
      setHisab({ ...refreshed });
      setOpeningInput(refreshed.openingAmount || 0);
      setDeductionsInput(refreshed.otherDeductions || 0);
      setNotesInput(refreshed.notes || '');
      setIsLockedInput(refreshed.isLocked || false);
      setDenominations({
        note500: refreshed.denominations?.note500 || 0,
        note200: refreshed.denominations?.note200 || 0,
        note100: refreshed.denominations?.note100 || 0,
        note50: refreshed.denominations?.note50 || 0,
        note20: refreshed.denominations?.note20 || 0,
        note10: refreshed.denominations?.note10 || 0,
        coins: refreshed.denominations?.coins || 0,
      });
      setSaveSuccessMsg('');
    }
  }, [isOpen, initialDate, selectedDate]);

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    const refreshed = storage.refreshDailyHisabTotals(newDate);
    setHisab({ ...refreshed });
    setOpeningInput(refreshed.openingAmount || 0);
    setDeductionsInput(refreshed.otherDeductions || 0);
    setNotesInput(refreshed.notes || '');
    setIsLockedInput(refreshed.isLocked || false);
    setSaveSuccessMsg('');
  };

  // Previous Day Closing Balance
  const prevClosing = useMemo(() => {
    return storage.getPreviousDayClosingBalance(selectedDate);
  }, [selectedDate]);

  // Calculated Real-Time Closing Balance
  const calculatedClosing = useMemo(() => {
    const opening = Number(openingInput) || 0;
    const collections = Number(hisab.collectionTotal) || 0;
    const expenses = Number(hisab.expensesTotal) || 0;
    const payouts = Number(hisab.payoutTotal) || 0;
    const deductions = Number(deductionsInput) || 0;
    return opening + collections - expenses - payouts - deductions;
  }, [openingInput, hisab.collectionTotal, hisab.expensesTotal, hisab.payoutTotal, deductionsInput]);

  // Denominations Physical Total
  const physicalCashTotal = useMemo(() => {
    return (
      (denominations.note500 || 0) * 500 +
      (denominations.note200 || 0) * 200 +
      (denominations.note100 || 0) * 100 +
      (denominations.note50 || 0) * 50 +
      (denominations.note20 || 0) * 20 +
      (denominations.note10 || 0) * 10 +
      (denominations.coins || 0)
    );
  }, [denominations]);

  const cashDifference = useMemo(() => {
    return physicalCashTotal - calculatedClosing;
  }, [physicalCashTotal, calculatedClosing]);

  const handleCarryForward = () => {
    setOpeningInput(prevClosing);
    setSaveSuccessMsg(`Fetched yesterday's closing balance (₹${prevClosing.toLocaleString()}) as today's opening balance.`);
  };

  const handleSaveBalances = (e: React.FormEvent) => {
    e.preventDefault();

    const saved = storage.setDailyBalances({
      date: selectedDate,
      openingAmount: Number(openingInput) || 0,
      otherDeductions: Number(deductionsInput) || 0,
      notes: notesInput,
      isLocked: isLockedInput,
      denominations: {
        ...denominations,
        physicalCashTotal,
      },
    });

    setHisab({ ...saved });
    setSaveSuccessMsg(`Opening & Closing Balances successfully saved for ${selectedDate}!`);

    if (onSuccess) {
      onSuccess();
    }

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Opening &amp; Closing Balance Manager</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                  Daily Safe Tally
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Configure opening cash in hand, bank transfers, and final closing cash in safe
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSaveBalances} className="p-5 overflow-y-auto space-y-5 custom-scrollbar">
          {/* Notification Alert */}
          {saveSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* Date & Quick Status Bar */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-300">Target Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsLockedInput(!isLockedInput)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                  isLockedInput
                    ? 'bg-rose-950/40 text-rose-300 border-rose-800'
                    : 'bg-emerald-950/40 text-emerald-300 border-emerald-800'
                }`}
              >
                {isLockedInput ? <Lock className="w-3.5 h-3.5 text-rose-400" /> : <Unlock className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{isLockedInput ? 'Day Locked' : 'Day Open for Edits'}</span>
              </button>
            </div>
          </div>

          {/* Opening Balance Configuration Block */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Wallet className="w-4 h-4" />
                1. Opening Balance (Cash in Hand / Safe)
              </span>
              <button
                type="button"
                onClick={handleCarryForward}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/30 transition-all"
                title="Fetch yesterday's closing balance"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Carry Forward Yesterday (₹{prevClosing.toLocaleString()})</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <label className="block text-[11px] text-slate-300 font-medium mb-1">
                  Opening Cash Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-amber-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={openingInput}
                    onChange={(e) => setOpeningInput(Number(e.target.value))}
                    placeholder="e.g. 15000"
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-base focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Quick Presets */}
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Quick Presets:</label>
                <div className="flex flex-wrap gap-1.5">
                  {[10000, 15000, 25000, 50000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setOpeningInput(val)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold border transition-all ${
                        openingInput === val
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                          : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      ₹{val.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mathematical Reconciliation Summary */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-amber-400" />
              2. Real-Time Cash Inflows &amp; Outflows Tally
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Opening Cash</span>
                <span className="text-sm font-bold text-white font-mono">
                  ₹{Number(openingInput || 0).toLocaleString()}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40">
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center justify-between">
                  <span>(+) Collections</span>
                  <TrendingUp className="w-3 h-3" />
                </span>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  +₹{(hisab.collectionTotal || 0).toLocaleString()}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-800/40">
                <span className="text-[10px] text-rose-400 font-semibold flex items-center justify-between">
                  <span>(-) Expenses</span>
                  <TrendingDown className="w-3 h-3" />
                </span>
                <span className="text-sm font-bold text-rose-400 font-mono">
                  -₹{(hisab.expensesTotal || 0).toLocaleString()}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">(-) Payouts</span>
                <span className="text-sm font-bold text-slate-300 font-mono">
                  -₹{(hisab.payoutTotal || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Other Deductions / Bank Handover */}
            <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <label className="block text-[11px] text-slate-300 font-medium mb-1">
                  Bank Handover / Safe Deposit Deductions (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-bold text-xs">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={deductionsInput}
                    onChange={(e) => setDeductionsInput(Number(e.target.value))}
                    placeholder="0"
                    className="w-full pl-7 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 font-medium mb-1">
                  Closing Safe Notes / Remarks
                </label>
                <input
                  type="text"
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="e.g. Verified by Branch Manager, Dahod"
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Closing Balance Highlight Card */}
          <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/20 border-2 border-amber-500/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div>
              <span className="text-[10px] text-amber-400 uppercase font-black tracking-wider block">
                3. Calculated Closing Balance (Net Cash in Safe)
              </span>
              <div className="text-3xl font-black text-amber-400 font-mono mt-0.5">
                ₹{calculatedClosing.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Formula: Opening (₹{Number(openingInput || 0).toLocaleString()}) + Collections (₹{(hisab.collectionTotal || 0).toLocaleString()}) - Expenses (₹{(hisab.expensesTotal || 0).toLocaleString()}) - Payouts (₹{(hisab.payoutTotal || 0).toLocaleString()}) - Deductions (₹{Number(deductionsInput || 0).toLocaleString()})
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowDenominations(!showDenominations)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Coins className="w-4 h-4 text-amber-400" />
              <span>{showDenominations ? 'Hide Note Count' : 'Count Currency Notes'}</span>
            </button>
          </div>

          {/* Currency Denominations Breakdown Drawer */}
          {showDenominations && (
            <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-400" />
                  Physical Cash Denomination Counter (Safe Audit)
                </span>
                <span className="text-xs font-mono font-bold text-slate-300">
                  Total Counted: <strong className="text-amber-400">₹{physicalCashTotal.toLocaleString()}</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">₹500 Notes</label>
                  <input
                    type="number"
                    min="0"
                    value={denominations.note500 || ''}
                    onChange={(e) => setDenominations({ ...denominations, note500: Number(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                  />
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                    = ₹{((denominations.note500 || 0) * 500).toLocaleString()}
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">₹200 Notes</label>
                  <input
                    type="number"
                    min="0"
                    value={denominations.note200 || ''}
                    onChange={(e) => setDenominations({ ...denominations, note200: Number(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                  />
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                    = ₹{((denominations.note200 || 0) * 200).toLocaleString()}
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">₹100 Notes</label>
                  <input
                    type="number"
                    min="0"
                    value={denominations.note100 || ''}
                    onChange={(e) => setDenominations({ ...denominations, note100: Number(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                  />
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                    = ₹{((denominations.note100 || 0) * 100).toLocaleString()}
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">₹50 Notes</label>
                  <input
                    type="number"
                    min="0"
                    value={denominations.note50 || ''}
                    onChange={(e) => setDenominations({ ...denominations, note50: Number(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                  />
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                    = ₹{((denominations.note50 || 0) * 50).toLocaleString()}
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">₹20 Notes</label>
                  <input
                    type="number"
                    min="0"
                    value={denominations.note20 || ''}
                    onChange={(e) => setDenominations({ ...denominations, note20: Number(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                  />
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                    = ₹{((denominations.note20 || 0) * 20).toLocaleString()}
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">₹10 Notes</label>
                  <input
                    type="number"
                    min="0"
                    value={denominations.note10 || ''}
                    onChange={(e) => setDenominations({ ...denominations, note10: Number(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                  />
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                    = ₹{((denominations.note10 || 0) * 10).toLocaleString()}
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Coins / Loose (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={denominations.coins || ''}
                    onChange={(e) => setDenominations({ ...denominations, coins: Number(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <div
                    className={`p-2 rounded-lg text-center text-xs font-bold border ${
                      cashDifference === 0
                        ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800'
                        : cashDifference > 0
                        ? 'bg-blue-950/40 text-blue-300 border-blue-800'
                        : 'bg-rose-950/40 text-rose-300 border-rose-800'
                    }`}
                  >
                    <span>{cashDifference === 0 ? 'Exact Match (₹0)' : cashDifference > 0 ? `Surplus: +₹${cashDifference.toLocaleString()}` : `Shortage: ₹${cashDifference.toLocaleString()}`}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Apply &amp; Save Balances</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
