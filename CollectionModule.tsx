import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  Calendar,
  Building2,
  User as UserIcon,
  CircleDollarSign,
  X,
  Save,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { storage } from '../services/storage';
import { CollectionRecord, CaseRecord } from '../types';
import { ExcelService } from '../services/excelService';
import { ReceiptPrintModal } from '../components/ReceiptPrintModal';

export const CollectionModule: React.FC = () => {
  const [collections, setCollections] = useState<CollectionRecord[]>(() => storage.getCollections());
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const cases = useMemo(() => storage.getCases(), []);
  const companies = useMemo(() => storage.getFinanceCompanies(), []);
  const officers = useMemo(() => storage.getOfficers(), []);
  const settings = storage.getSettings();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompany, setFilterCompany] = useState('ALL');
  const [filterMode, setFilterMode] = useState('ALL');
  const [filterDate, setFilterDate] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<CollectionRecord | null>(null);
  const [formError, setFormError] = useState('');

  // Form State
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    caseId: '',
    loanAgreementNumber: '',
    customerName: '',
    vehicleNumber: '',
    financeCompanyId: companies[0]?.id || '',
    financeCompanyName: companies[0]?.shortName || '',
    officerId: '',
    officerName: '',
    collectionAmount: 3000,
    paymentMode: 'Cash',
    collectionType: 'EMI',
    transactionReference: '',
    remarks: '',
  });

  const refreshList = () => {
    setCollections([...storage.getCollections()]);
  };

  // When user selects a case, auto-fill details
  const handleCaseSelect = (caseId: string) => {
    setSelectedCaseId(caseId);
    const c = cases.find((item) => item.id === caseId);
    if (c) {
      setFormData((prev) => ({
        ...prev,
        caseId: c.id,
        loanAgreementNumber: c.loanAgreementNumber,
        customerName: c.customerName,
        vehicleNumber: c.registrationNumber || '',
        financeCompanyId: c.financeCompanyId,
        financeCompanyName: c.financeCompanyName,
        officerId: c.assignedOfficerId || '',
        officerName: c.assignedOfficerName || '',
        collectionAmount: c.emiAmount || c.tos || 3000,
      }));
    }
  };

  const filteredCollections = useMemo(() => {
    return collections.filter((c) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        c.customerName?.toLowerCase().includes(q) ||
        c.receiptNumber?.toLowerCase().includes(q) ||
        c.loanAgreementNumber?.toLowerCase().includes(q) ||
        c.vehicleNumber?.toLowerCase().includes(q);

      const matchesCompany = filterCompany === 'ALL' || c.financeCompanyId === filterCompany;
      const matchesMode = filterMode === 'ALL' || c.paymentMode === filterMode;
      const matchesDate = !filterDate || c.date === filterDate;

      return matchesSearch && matchesCompany && matchesMode && matchesDate;
    });
  }, [collections, searchTerm, filterCompany, filterMode, filterDate]);

  const totalAmountFiltered = useMemo(() => {
    return filteredCollections.reduce((acc, c) => acc + (Number(c.collectionAmount) || 0), 0);
  }, [filteredCollections]);

  const handleOpenAdd = () => {
    setSelectedCaseId('');
    setFormData({
      date: new Date().toISOString().split('T')[0],
      caseId: '',
      loanAgreementNumber: '',
      customerName: '',
      vehicleNumber: '',
      financeCompanyId: companies[0]?.id || '',
      financeCompanyName: companies[0]?.shortName || '',
      officerId: '',
      officerName: '',
      collectionAmount: 3000,
      paymentMode: 'Cash',
      collectionType: 'EMI',
      transactionReference: '',
      remarks: '',
    });
    setIsModalOpen(true);
  };

  const handleSaveCollection = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!formData.customerName || !formData.collectionAmount || formData.collectionAmount <= 0) {
      setFormError('Please enter valid customer name and collection amount.');
      return;
    }

    const co = companies.find((f) => f.id === formData.financeCompanyId);
    const off = officers.find((o) => o.id === formData.officerId);

    const result = storage.addCollection({
      ...formData,
      financeCompanyName: co?.shortName || co?.name || formData.financeCompanyName,
      officerName: off?.name || formData.officerName,
    });

    setIsModalOpen(false);
    refreshList();
    // Open receipt modal automatically
    setSelectedReceipt(result.collection);
  };

  const handleExport = () => {
    ExcelService.exportToExcel(filteredCollections, 'Lion_Group_Agency_Collections', 'Collections');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-bold text-white">Daily Collection &amp; Money Receipts</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Cash, UPI &amp; Bank collections register. Auto-updates borrower balances, officer incentives, and Daily Hisab.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Export
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/10 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Record Collection
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search receipt no, customer, agreement, vehicle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <select
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Finance Companies</option>
              {companies.map((co) => (
                <option key={co.id} value={co.id}>
                  {co.shortName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Payment Modes</option>
              {settings.paymentModes.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </div>

          <div>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <span>
            Showing <strong className="text-white">{filteredCollections.length}</strong> collections
          </span>
          <span className="text-sm font-bold text-emerald-400 font-mono">
            Total Collected: ₹{totalAmountFiltered.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Collections Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Receipt No</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Customer &amp; Vehicle</th>
                <th className="py-3 px-3">Financier</th>
                <th className="py-3 px-3">Loan Agreement</th>
                <th className="py-3 px-3">Collector</th>
                <th className="py-3 px-3">Type &amp; Mode</th>
                <th className="py-3 px-3 text-right">Amount (₹)</th>
                <th className="py-3 px-3 text-center">Receipt</th>
                <th className="py-3 px-3 text-center text-rose-400 font-bold uppercase tracking-wider text-[10px]">
                  Delete Entry
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCollections.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 text-xs">
                    No collection records found. Click "Record Collection" to add.
                  </td>
                </tr>
              ) : (
                filteredCollections.map((col) => (
                  <tr key={col.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-amber-400">
                      {col.receiptNumber}
                    </td>

                    <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">{col.date}</td>

                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-200">{col.customerName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{col.vehicleNumber}</div>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {col.financeCompanyName}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 font-mono text-slate-300">{col.loanAgreementNumber}</td>

                    <td className="py-2.5 px-3 text-slate-300">
                      {col.officerName ? (
                        <span className="flex items-center gap-1 text-[11px]">
                          <UserIcon className="w-3 h-3 text-slate-400" />
                          {col.officerName}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">Agency Direct</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-300 text-[11px]">{col.collectionType}</div>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-amber-300 border border-slate-700">
                        {col.paymentMode}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-400 text-sm">
                      ₹{col.collectionAmount?.toLocaleString()}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => setSelectedReceipt(col)}
                        title="Print Money Receipt"
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white inline-flex items-center gap-1 text-[11px] font-medium transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Print
                      </button>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      {deleteConfirmId === col.id ? (
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => {
                              storage.deleteCollection(col.id);
                              setCollections(storage.getCollections());
                              setDeleteConfirmId(null);
                            }}
                            className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold shadow-xs"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(col.id)}
                          title="Delete collection entry"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-rose-300 border border-rose-800/60 text-[11px] font-semibold transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Entry</span>
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

      {/* Record Collection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in duration-150">
            <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                Record Collection &amp; Issue Receipt
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCollection} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs">
                  {formError}
                </div>
              )}
              {/* Case Picker Shortcut */}
              <div className="space-y-1 bg-slate-850 p-3 rounded-xl border border-slate-800">
                <label className="font-semibold text-amber-400">
                  Select Existing Case (Auto-fills Borrower &amp; Loan info)
                </label>
                <select
                  value={selectedCaseId}
                  onChange={(e) => handleCaseSelect(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Choose Case or Enter Manually Below --</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.loanAgreementNumber} — {c.customerName} ({c.financeCompanyName}, Reg: {c.registrationNumber || 'N/A'}, TOS: ₹{c.tos})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">
                    Collection Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">
                    Finance Company <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.financeCompanyId}
                    onChange={(e) => setFormData({ ...formData, financeCompanyId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {companies.map((fc) => (
                      <option key={fc.id} value={fc.id}>
                        {fc.name} ({fc.shortName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">
                    Customer Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Loan Agreement Number</label>
                  <input
                    type="text"
                    value={formData.loanAgreementNumber}
                    onChange={(e) => setFormData({ ...formData, loanAgreementNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Vehicle / Registration Number</label>
                  <input
                    type="text"
                    placeholder="e.g. GJ-20-AB-1234"
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Collecting Officer</label>
                  <select
                    value={formData.officerId}
                    onChange={(e) => setFormData({ ...formData, officerId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- Direct / Office Staff --</option>
                    {officers.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name} ({o.employeeId})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-emerald-400">
                    Collection Amount (₹) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.collectionAmount}
                    onChange={(e) => setFormData({ ...formData, collectionAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-emerald-500/60 text-sm font-bold text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Payment Mode</label>
                  <select
                    value={formData.paymentMode}
                    onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {settings.paymentModes.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Collection Type</label>
                  <select
                    value={formData.collectionType}
                    onChange={(e) => setFormData({ ...formData, collectionType: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {settings.collectionTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Transaction Ref / UPI Txn ID</label>
                  <input
                    type="text"
                    placeholder="e.g. UPI-12345678"
                    value={formData.transactionReference}
                    onChange={(e) => setFormData({ ...formData, transactionReference: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-semibold text-slate-300">Remarks / Purpose</label>
                  <input
                    type="text"
                    placeholder="e.g. Paid in cash at Dahod office"
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save &amp; Generate Money Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Print Modal */}
      <ReceiptPrintModal
        receipt={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />
    </div>
  );
};
