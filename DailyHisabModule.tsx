import React, { useState, useMemo } from 'react';
import {
  BookOpenCheck,
  Plus,
  Calendar,
  Lock,
  Unlock,
  Printer,
  TrendingDown,
  TrendingUp,
  CircleDollarSign,
  Fuel,
  Receipt,
  X,
  Save,
  CheckCircle,
  Trash2,
  Wallet,
  Coins,
  RotateCcw,
} from 'lucide-react';
import { storage } from '../services/storage';
import { DailyHisabRecord, ExpenseRecord } from '../types';
import { ExcelService } from '../services/excelService';
import { OpeningClosingBalanceModal } from '../components/OpeningClosingBalanceModal';

export const DailyHisabModule: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(
    () => new Date().toISOString().split('T')[0]
  );

  const [hisab, setHisab] = useState<DailyHisabRecord>(() =>
    storage.refreshDailyHisabTotals(new Date().toISOString().split('T')[0])
  );

  const [allHisabs, setAllHisabs] = useState<DailyHisabRecord[]>(() =>
    storage.getDailyHisabList()
  );

  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() =>
    storage.getExpenses()
  );

  const settings = storage.getSettings();

  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseError, setExpenseError] = useState('');
  const [expenseForm, setExpenseForm] = useState({
    category: 'Petrol',
    amount: 500,
    paidTo: '',
    receiptNumber: '',
    remarks: '',
  });

  const [isEditingOpening, setIsEditingOpening] = useState(false);
  const [openingInput, setOpeningInput] = useState(hisab.openingAmount);
  const [deductionsInput, setDeductionsInput] = useState(hisab.otherDeductions);

  const reloadData = (date: string) => {
    const updated = storage.refreshDailyHisabTotals(date);
    setHisab({ ...updated });
    setOpeningInput(updated.openingAmount);
    setDeductionsInput(updated.otherDeductions);
    setExpenses([...storage.getExpenses()]);
    setAllHisabs([...storage.getDailyHisabList()]);
  };

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    reloadData(newDate);
  };

  const dateExpenses = useMemo(() => {
    return expenses.filter((e) => e.date === selectedDate);
  }, [expenses, selectedDate]);

  const dateCollections = useMemo(() => {
    return storage.getCollections().filter((c) => c.date === selectedDate);
  }, [selectedDate]);

  const datePayouts = useMemo(() => {
    return storage.getPayouts().filter((p) => p.date === selectedDate && p.status === 'PAID');
  }, [selectedDate]);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    setExpenseError('');
    if (!expenseForm.amount || expenseForm.amount <= 0 || !expenseForm.paidTo) {
      setExpenseError('Please enter valid amount and recipient.');
      return;
    }

    storage.addExpense({
      ...expenseForm,
      date: selectedDate,
    });

    setIsExpenseModalOpen(false);
    setExpenseForm({
      category: 'Petrol',
      amount: 500,
      paidTo: '',
      receiptNumber: '',
      remarks: '',
    });
    reloadData(selectedDate);
  };

  const handleSaveOpeningAndDeduction = () => {
    const updated = {
      ...hisab,
      openingAmount: Number(openingInput) || 0,
      otherDeductions: Number(deductionsInput) || 0,
    };
    storage.saveDailyHisab(updated);
    setIsEditingOpening(false);
    reloadData(selectedDate);
  };

  const handleToggleLock = () => {
    const updated = { ...hisab, isLocked: !hisab.isLocked };
    storage.saveDailyHisab(updated);
    reloadData(selectedDate);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    ExcelService.exportToExcel(allHisabs, 'Lion_Group_Agency_Daily_Hisab', 'Daily_Hisab');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <BookOpenCheck className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white">Daily Hisab Register (Dahod Branch)</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Cash opening, field collections, categorized recovery expenses, agent payouts &amp; closing tally
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
          />

          <button
            onClick={() => setIsBalanceModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition-colors"
            title="Configure Opening Balance, Closing Balance & Denominations"
          >
            <Wallet className="w-4 h-4" />
            <span>Balance Options &amp; Safe Count</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            Print Sheet
          </button>

          <button
            onClick={handleToggleLock}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${
              hisab.isLocked
                ? 'bg-rose-950/40 text-rose-300 border-rose-800'
                : 'bg-emerald-950/40 text-emerald-300 border-emerald-800'
            }`}
          >
            {hisab.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            {hisab.isLocked ? 'Day Locked' : 'Day Open'}
          </button>
        </div>
      </div>

      {/* Hisab Summary Cards (The Mathematical Formula) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Opening Amount */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-md">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Opening Amount</div>
          <div className="text-xl font-black text-white font-mono mt-1">
            ₹{hisab.openingAmount?.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={() => setIsBalanceModalOpen(true)}
              className="text-[10px] text-amber-400 hover:underline font-semibold"
            >
              Options
            </button>
            <span className="text-slate-600">•</span>
            <button
              onClick={() => setIsEditingOpening(!isEditingOpening)}
              disabled={hisab.isLocked}
              className="text-[10px] text-slate-400 hover:text-white disabled:opacity-30"
            >
              {isEditingOpening ? 'Cancel' : 'Inline Edit'}
            </button>
          </div>
        </div>

        {/* 2. Collection (+) */}
        <div className="bg-slate-900 border border-emerald-800/40 rounded-xl p-3.5 shadow-md">
          <div className="text-[10px] text-emerald-400 uppercase font-bold flex items-center justify-between">
            <span>Collections (+)</span>
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-black text-emerald-400 font-mono mt-1">
            ₹{hisab.collectionTotal?.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">
            {dateCollections.length} Receipts
          </div>
        </div>

        {/* 3. Expenses (-) */}
        <div className="bg-slate-900 border border-rose-800/40 rounded-xl p-3.5 shadow-md">
          <div className="text-[10px] text-rose-400 uppercase font-bold flex items-center justify-between">
            <span>Expenses (-)</span>
            <TrendingDown className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-black text-rose-400 font-mono mt-1">
            ₹{hisab.expensesTotal?.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">
            {dateExpenses.length} Vouchers
          </div>
        </div>

        {/* 4. Payouts (-) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-md">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Payouts (-)</div>
          <div className="text-xl font-black text-slate-300 font-mono mt-1">
            ₹{hisab.payoutTotal?.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">
            {datePayouts.length} Paid
          </div>
        </div>

        {/* 5. Other Deductions (-) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-md">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Deductions (-)</div>
          <div className="text-xl font-black text-slate-300 font-mono mt-1">
            ₹{hisab.otherDeductions?.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Bank deposit / misc</div>
        </div>

        {/* 6. Closing Amount (=) */}
        <div className="bg-gradient-to-br from-slate-900 to-amber-950/30 border-2 border-amber-500/50 rounded-xl p-3.5 shadow-md">
          <div className="text-[10px] text-amber-400 uppercase font-black">Closing Amount (=)</div>
          <div className="text-2xl font-black text-amber-400 font-mono mt-0.5">
            ₹{hisab.closingAmount?.toLocaleString()}
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-slate-400">Net Safe Cash</span>
            <button
              onClick={() => setIsBalanceModalOpen(true)}
              className="text-[10px] text-amber-400 hover:underline font-bold"
            >
              Count Notes &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Opening / Deductions Edit Drawer */}
      {isEditingOpening && (
        <div className="p-4 bg-slate-850 border border-amber-500/40 rounded-xl flex flex-wrap items-center gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              Opening Cash in Hand (₹)
            </label>
            <input
              type="number"
              value={openingInput}
              onChange={(e) => setOpeningInput(Number(e.target.value))}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              Other Cash Deductions / Bank Dep (₹)
            </label>
            <input
              type="number"
              value={deductionsInput}
              onChange={(e) => setDeductionsInput(Number(e.target.value))}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              const prev = storage.getPreviousDayClosingBalance(selectedDate);
              setOpeningInput(prev);
            }}
            className="mt-5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold hover:bg-amber-500/30 flex items-center gap-1"
            title="Fetch yesterday's closing balance"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Carry Fwd (₹{storage.getPreviousDayClosingBalance(selectedDate).toLocaleString()})</span>
          </button>

          <button
            onClick={handleSaveOpeningAndDeduction}
            className="mt-5 px-4 py-1.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400"
          >
            Apply &amp; Recalculate
          </button>
        </div>
      )}

      {/* Middle Split: Daily Collections & Daily Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Collections of the day */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                Collections Inflows ({dateCollections.length})
              </h3>
              <span className="text-sm font-bold text-emerald-400 font-mono">
                +₹{hisab.collectionTotal.toLocaleString()}
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
              {dateCollections.length === 0 ? (
                <div className="text-xs text-slate-500 py-8 text-center">
                  No collections registered for this date.
                </div>
              ) : (
                dateCollections.map((c) => (
                  <div
                    key={c.id}
                    className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-200">{c.customerName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {c.receiptNumber} • {c.loanAgreementNumber} ({c.paymentMode})
                      </div>
                    </div>
                    <span className="font-mono font-bold text-emerald-400">
                      ₹{c.collectionAmount.toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Expenses of the day */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Fuel className="w-4 h-4 text-rose-400" />
                Expenses Outflows ({dateExpenses.length})
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-rose-400 font-mono">
                  -₹{hisab.expensesTotal.toLocaleString()}
                </span>
                <button
                  onClick={() => setIsExpenseModalOpen(true)}
                  disabled={hisab.isLocked}
                  className="px-2.5 py-1 rounded bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5 inline mr-1" />
                  Add Expense
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
              {dateExpenses.length === 0 ? (
                <div className="text-xs text-slate-500 py-8 text-center">
                  No expenses recorded for this date.
                </div>
              ) : (
                dateExpenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200">{exp.paidTo}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-rose-300 border border-slate-700 font-mono">
                          {exp.category}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {exp.remarks || 'No remarks'} {exp.receiptNumber && `(Bill: ${exp.receiptNumber})`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-rose-400">
                        ₹{exp.amount.toLocaleString()}
                      </span>
                      {!hisab.isLocked && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete expense entry of ₹${exp.amount} (${exp.category} - ${exp.paidTo})?`)) {
                              storage.deleteExpense(exp.id);
                              reloadData(selectedDate);
                            }
                          }}
                          title="Delete Expense Entry"
                          className="p-1 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-rose-300 border border-rose-800/60 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Historical Register Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Recent Daily Hisab Register History
          </h3>
          <button
            onClick={handleExport}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
          >
            Export Full Ledger
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Opening (₹)</th>
                <th className="py-2.5 px-3 text-emerald-400">Collections (₹)</th>
                <th className="py-2.5 px-3 text-rose-400">Expenses (₹)</th>
                <th className="py-2.5 px-3">Payouts (₹)</th>
                <th className="py-2.5 px-3 text-right text-amber-300">Closing (₹)</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {allHisabs.map((h) => (
                <tr
                  key={h.id}
                  onClick={() => handleDateChange(h.date)}
                  className={`hover:bg-slate-800/40 cursor-pointer ${
                    h.date === selectedDate ? 'bg-slate-800/60 font-semibold' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 text-white font-sans">{h.date}</td>
                  <td className="py-2.5 px-3 text-slate-300">₹{h.openingAmount?.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-bold">
                    +₹{h.collectionTotal?.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-rose-400 font-bold">
                    -₹{h.expensesTotal?.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">₹{h.payoutTotal?.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right text-amber-400 font-black">
                    ₹{h.closingAmount?.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold ${
                        h.isLocked
                          ? 'bg-rose-950/60 text-rose-300 border border-rose-800'
                          : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {h.isLocked ? 'LOCKED' : 'OPEN'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in duration-150">
            <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Fuel className="w-4 h-4 text-rose-400" />
                Record Agency Expense Voucher
              </h2>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="p-6 space-y-4 text-xs">
              {expenseError && (
                <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs">
                  {expenseError}
                </div>
              )}
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Expense Category</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {settings.expenseCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-rose-400">Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-rose-500/60 text-sm font-bold text-rose-400 font-mono focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Paid To (Vendor / Person) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nayara Petrol Pump, Stationery Store..."
                  value={expenseForm.paidTo}
                  onChange={(e) => setExpenseForm({ ...expenseForm, paidTo: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Bill / Voucher / Receipt No</label>
                <input
                  type="text"
                  placeholder="e.g. PET-8812"
                  value={expenseForm.receiptNumber}
                  onChange={(e) => setExpenseForm({ ...expenseForm, receiptNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Remarks / Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Field bike petrol for 2 officers"
                  value={expenseForm.remarks}
                  onChange={(e) => setExpenseForm({ ...expenseForm, remarks: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Expense Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Opening & Closing Balance & Denominations Modal */}
      <OpeningClosingBalanceModal
        isOpen={isBalanceModalOpen}
        onClose={() => setIsBalanceModalOpen(false)}
        onSuccess={() => reloadData(selectedDate)}
        initialDate={selectedDate}
      />
    </div>
  );
};
