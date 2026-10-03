import React, { useState, useMemo } from 'react';
import {
  CircleDollarSign,
  Plus,
  Search,
  Calendar,
  Download,
  Printer,
  Calculator,
  User as UserIcon,
  CheckCircle,
  Clock,
  X,
  Save,
} from 'lucide-react';
import { storage } from '../services/storage';
import { SalaryRecord, OfficerRecord } from '../types';
import { ExcelService } from '../services/excelService';

export const SalaryModule: React.FC = () => {
  const currentMonthStr = new Date().toISOString().substring(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [salaries, setSalaries] = useState<SalaryRecord[]>(() => storage.getSalaries());
  const officers = useMemo(() => storage.getOfficers().filter((o) => o.status === 'ACTIVE'), []);

  const [selectedSalary, setSelectedSalary] = useState<SalaryRecord | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSlipModalOpen, setIsSlipModalOpen] = useState(false);

  const [formData, setFormData] = useState<SalaryRecord>({
    id: '',
    officerId: '',
    officerName: '',
    month: selectedMonth,
    basicSalary: 20000,
    incentive: 0,
    collectionIncentive: 0,
    repoIncentive: 0,
    deduction: 0,
    advance: 0,
    other: 0,
    netSalary: 20000,
    status: 'PENDING',
    remarks: '',
    createdAt: new Date().toISOString(),
  });

  const refreshList = () => {
    setSalaries([...storage.getSalaries()]);
  };

  // Auto-generate or fetch draft for all officers for selected month
  const monthSalaries = useMemo(() => {
    return officers.map((off) => {
      const existing = salaries.find(
        (s) => s.officerId === off.id && s.month === selectedMonth
      );
      if (existing) return existing;
      return storage.calculateSalaryForOfficer(off.id, selectedMonth);
    });
  }, [officers, salaries, selectedMonth]);

  const handleOpenEdit = (rec: SalaryRecord) => {
    setSelectedSalary(rec);
    setFormData({ ...rec });
    setIsEditModalOpen(true);
  };

  const handleOpenSlip = (rec: SalaryRecord) => {
    setSelectedSalary(rec);
    setIsSlipModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    storage.saveSalary(formData);
    setIsEditModalOpen(false);
    refreshList();
  };

  const handleApproveAll = () => {
    monthSalaries.forEach((sal) => {
      storage.saveSalary({ ...sal, status: 'APPROVED' });
    });
    refreshList();
  };

  const handleExport = () => {
    ExcelService.exportToExcel(monthSalaries, `Lion_Group_Salary_${selectedMonth}`, 'Salary_Sheet');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <CircleDollarSign className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white">Salary &amp; Payroll Management</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated calculations: Basic + Collection % Incentive + Repo Bonus - Deductions = Net Pay
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
          />

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Export Payroll
          </button>

          <button
            onClick={handleApproveAll}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md"
          >
            <CheckCircle className="w-4 h-4" />
            Approve All Payroll
          </button>
        </div>
      </div>

      {/* Salary Overview Sheet */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Payroll Ledger for {selectedMonth}
          </h3>
          <span className="text-xs text-slate-400">
            Total Net Payroll:{' '}
            <strong className="text-emerald-400 font-mono text-sm">
              ₹{monthSalaries.reduce((acc, s) => acc + s.netSalary, 0).toLocaleString()}
            </strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Officer</th>
                <th className="py-2.5 px-3">Basic (₹)</th>
                <th className="py-2.5 px-3 text-emerald-400">Collection Inc (₹)</th>
                <th className="py-2.5 px-3 text-cyan-400">Repo Inc (₹)</th>
                <th className="py-2.5 px-3 text-amber-300">Target Bonus (₹)</th>
                <th className="py-2.5 px-3 text-rose-400">Deductions (₹)</th>
                <th className="py-2.5 px-3 font-bold text-white">Net Salary (₹)</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {monthSalaries.map((sal) => (
                <tr key={sal.id} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-sans font-semibold text-white">
                    {sal.officerName}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">₹{sal.basicSalary?.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-emerald-400">+₹{sal.collectionIncentive?.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-cyan-400">+₹{sal.repoIncentive?.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-amber-300">+₹{sal.incentive?.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-rose-400">
                    -₹{(sal.deduction + sal.advance)?.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 font-black text-amber-400 text-sm">
                    ₹{sal.netSalary?.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-center font-sans">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        sal.status === 'APPROVED' || sal.status === 'PAID'
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                          : 'bg-amber-950/60 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {sal.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-sans">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenSlip(sal)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-medium flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3" />
                        Slip
                      </button>
                      <button
                        onClick={() => handleOpenEdit(sal)}
                        className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-bold"
                      >
                        Adjust
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Salary Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in duration-150">
            <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Calculator className="w-4 h-4 text-amber-400" />
                Adjust Salary Components: {formData.officerName} ({formData.month})
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="space-y-1">
                  <label className="font-sans font-semibold text-slate-300">Basic Salary (₹)</label>
                  <input
                    type="number"
                    value={formData.basicSalary}
                    onChange={(e) => setFormData({ ...formData, basicSalary: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-sans font-semibold text-slate-300">Collection Incentive (₹)</label>
                  <input
                    type="number"
                    value={formData.collectionIncentive}
                    onChange={(e) => setFormData({ ...formData, collectionIncentive: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-emerald-400 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-sans font-semibold text-slate-300">Repo Incentive (₹)</label>
                  <input
                    type="number"
                    value={formData.repoIncentive}
                    onChange={(e) => setFormData({ ...formData, repoIncentive: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-sans font-semibold text-slate-300">Target Bonus / Incentive (₹)</label>
                  <input
                    type="number"
                    value={formData.incentive}
                    onChange={(e) => setFormData({ ...formData, incentive: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-amber-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-sans font-semibold text-rose-400">Deduction (₹)</label>
                  <input
                    type="number"
                    value={formData.deduction}
                    onChange={(e) => setFormData({ ...formData, deduction: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-rose-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-sans font-semibold text-rose-400">Advance / Loan Recovery (₹)</label>
                  <input
                    type="number"
                    value={formData.advance}
                    onChange={(e) => setFormData({ ...formData, advance: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-rose-400"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-850 rounded-xl border border-amber-500/40 flex items-center justify-between">
                <span className="font-bold text-slate-300 uppercase text-xs">Calculated Net Pay:</span>
                <span className="font-mono text-xl font-black text-amber-400">
                  ₹{formData.basicSalary + formData.incentive + formData.collectionIncentive + formData.repoIncentive - formData.deduction - formData.advance}
                </span>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs shadow-md"
                >
                  Save Salary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Salary Slip Modal */}
      {isSlipModalOpen && selectedSalary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Official Payslip Preview</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Payslip
                </button>
                <button
                  onClick={() => setIsSlipModalOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 bg-white text-slate-900 overflow-y-auto max-h-[75vh]" id="printable-salary-slip">
              <div className="text-center border-b pb-3 mb-4">
                <h2 className="text-lg font-black uppercase text-slate-900">LION GROUP AGENCY</h2>
                <p className="text-[11px] text-slate-600">Recovery &amp; Collection Management Agency, Dahod, Gujarat</p>
                <p className="text-xs font-bold uppercase mt-1 bg-slate-100 py-0.5 border">
                  Salary Slip for Month: {selectedSalary.month}
                </p>
              </div>

              <div className="grid grid-cols-2 text-xs mb-4">
                <div>
                  <span className="text-slate-500">Employee Name:</span>{' '}
                  <strong className="text-slate-900">{selectedSalary.officerName}</strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-500">Slip ID:</span>{' '}
                  <span className="font-mono">{selectedSalary.id}</span>
                </div>
              </div>

              {/* Earnings & Deductions Table */}
              <div className="border text-xs mb-4">
                <div className="grid grid-cols-2 bg-slate-100 font-bold p-2 border-b">
                  <span>Earnings (₹)</span>
                  <span className="text-right">Deductions (₹)</span>
                </div>

                <div className="p-2 space-y-1.5">
                  <div className="flex justify-between">
                    <span>Basic Salary:</span>
                    <strong className="font-mono">₹{selectedSalary.basicSalary?.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Collection Incentive:</span>
                    <strong className="font-mono text-emerald-700">+₹{selectedSalary.collectionIncentive?.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Repo Incentive:</span>
                    <strong className="font-mono text-cyan-700">+₹{selectedSalary.repoIncentive?.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Target Performance Bonus:</span>
                    <strong className="font-mono">+₹{selectedSalary.incentive?.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between text-rose-700 pt-1 border-t">
                    <span>Deduction / Advance Recovery:</span>
                    <strong className="font-mono">-₹{(selectedSalary.deduction + selectedSalary.advance)?.toLocaleString()}</strong>
                  </div>
                </div>

                <div className="p-2.5 bg-amber-50 border-t flex justify-between font-bold text-sm">
                  <span>NET PAYABLE:</span>
                  <span className="font-mono font-black text-slate-950">₹{selectedSalary.netSalary?.toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-8 text-xs border-t">
                <div>
                  <div className="h-6"></div>
                  <p className="border-t border-slate-400 pt-1">Employee Signature</p>
                </div>
                <div className="text-right">
                  <div className="h-6"></div>
                  <p className="border-t border-slate-400 pt-1 font-bold">Authorized Signatory (Lion Group Agency)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
