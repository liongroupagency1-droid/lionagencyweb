import React, { useState, useMemo } from 'react';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  Download,
  Phone,
  Car,
  Building2,
  User as UserIcon,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
  ArrowUpDown,
  Calendar,
} from 'lucide-react';
import { storage } from '../services/storage';
import { CaseRecord, FinanceCompany, OfficerRecord, CasePriority } from '../types';
import { ExcelService } from '../services/excelService';
import { CustomFieldRenderer } from '../components/CustomFieldRenderer';

interface CaseManagementProps {
  onCollectPayment?: (caseRecord: CaseRecord) => void;
  onInitiateRepo?: (caseRecord: CaseRecord) => void;
}

export const CaseManagement: React.FC<CaseManagementProps> = ({
  onCollectPayment,
  onInitiateRepo,
}) => {
  const [cases, setCases] = useState<CaseRecord[]>(() => storage.getCases());
  const [financeCompanies] = useState<FinanceCompany[]>(() => storage.getFinanceCompanies());
  const [officers] = useState<OfficerRecord[]>(() => storage.getOfficers());
  const settings = storage.getSettings();
  const caseCustomFields = storage.getCustomFields('Case');

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompany, setFilterCompany] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterOfficer, setFilterOfficer] = useState('ALL');

  // Modal State
  const [selectedCase, setSelectedCase] = useState<CaseRecord | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form Data
  const initialFormData: Partial<CaseRecord> = {
    financeCompanyId: financeCompanies[0]?.id || '',
    financeCompanyName: financeCompanies[0]?.shortName || '',
    loanAgreementNumber: '',
    applicationId: '',
    customerName: '',
    customerMobile: '',
    alternateMobile: '',
    customerAddress: '',
    city: 'Dahod',
    state: 'Gujarat',
    pincode: '389151',
    loanAmount: 0,
    emiAmount: 0,
    tenure: 0,
    paidEmi: 0,
    pendingEmi: 0,
    tos: 0,
    pos: 0,
    bkt: 'BKT-1',
    assetMake: '',
    model: '',
    registrationNumber: '',
    engineNumber: '',
    chassisNumber: '',
    loanBookingDate: new Date().toISOString().split('T')[0],
    loanMaturityDate: new Date().toISOString().split('T')[0],
    dealerName: '',
    referenceName: '',
    referenceMobile: '',
    referenceAddress: '',
    assignedOfficerId: '',
    assignedOfficerName: '',
    priority: 'MEDIUM',
    status: 'NEW',
    remarks: '',
    customFields: {},
  };

  const [formData, setFormData] = useState<Partial<CaseRecord>>(initialFormData);

  const refreshList = () => {
    setCases([...storage.getCases()]);
  };

  // Filtered List
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        c.customerName?.toLowerCase().includes(q) ||
        c.customerMobile?.includes(q) ||
        c.loanAgreementNumber?.toLowerCase().includes(q) ||
        c.registrationNumber?.toLowerCase().includes(q) ||
        c.applicationId?.toLowerCase().includes(q);

      const matchesCompany = filterCompany === 'ALL' || c.financeCompanyId === filterCompany;
      const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;
      const matchesPriority = filterPriority === 'ALL' || c.priority === filterPriority;
      const matchesOfficer = filterOfficer === 'ALL' || c.assignedOfficerId === filterOfficer;

      return matchesSearch && matchesCompany && matchesStatus && matchesPriority && matchesOfficer;
    });
  }, [cases, searchTerm, filterCompany, filterStatus, filterPriority, filterOfficer]);

  const handleOpenAdd = () => {
    setSelectedCase(null);
    setFormError('');
    setFormData(initialFormData);
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (c: CaseRecord) => {
    setSelectedCase(c);
    setFormError('');
    setFormData({ ...c });
    setIsEditModalOpen(true);
  };

  const handleOpenDetail = (c: CaseRecord) => {
    setSelectedCase(c);
    setConfirmDeleteId(null);
    setIsDetailModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!formData.loanAgreementNumber?.trim() || !formData.customerName?.trim()) {
      setFormError('Please fill in required fields (Loan Agreement & Customer Name)');
      return;
    }

    // Lookup finance company name
    const co = financeCompanies.find((f) => f.id === formData.financeCompanyId);
    const off = officers.find((o) => o.id === formData.assignedOfficerId);

    const payload = {
      ...formData,
      financeCompanyName: co?.shortName || co?.name || formData.financeCompanyName || 'Financier',
      assignedOfficerName: off?.name || formData.assignedOfficerName || '',
    };

    if (selectedCase) {
      storage.updateCase(selectedCase.id, payload);
    } else {
      storage.addCase(payload as any);
    }

    setIsEditModalOpen(false);
    refreshList();
  };

  const handleDelete = (c: CaseRecord) => {
    storage.deleteCase(c.id);
    refreshList();
    setIsDetailModalOpen(false);
    setConfirmDeleteId(null);
  };

  const handleExport = () => {
    ExcelService.exportToExcel(filteredCases, 'Lion_Group_Agency_Cases', 'Cases');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white">Case Management Master</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete vehicle loan delinquent recovery dossiers with vehicle info, bucket, TOS/POS &amp; assignment
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
            New Recovery Case
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search customer, agreement, vehicle, mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Finance Company */}
          <div>
            <select
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Finance Cos ({financeCompanies.length})</option>
              {financeCompanies.map((fc) => (
                <option key={fc.id} value={fc.id}>
                  {fc.shortName}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Statuses</option>
              {settings.caseStatuses.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Priorities</option>
              {settings.casePriorities.map((p) => (
                <option key={p} value={p}>
                  {p} Priority
                </option>
              ))}
            </select>
          </div>

          {/* Officer */}
          <div>
            <select
              value={filterOfficer}
              onChange={(e) => setFilterOfficer(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Officers</option>
              {officers.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <span>
            Showing <strong className="text-white">{filteredCases.length}</strong> of{' '}
            <strong className="text-slate-200">{cases.length}</strong> cases
          </span>
          <div className="flex items-center gap-4 text-[11px]">
            <span>
              Total TOS Filtered:{' '}
              <strong className="text-amber-400 font-mono">
                ₹{filteredCases.reduce((a, b) => a + (Number(b.tos) || 0), 0).toLocaleString()}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Agreement No / App ID</th>
                <th className="py-3 px-3">Customer &amp; Mobile</th>
                <th className="py-3 px-3">Financier</th>
                <th className="py-3 px-3">Vehicle Details</th>
                <th className="py-3 px-3">POS / TOS</th>
                <th className="py-3 px-3">BKT</th>
                <th className="py-3 px-3">Officer</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-center">View / Edit</th>
                <th className="py-3 px-3 text-center text-rose-400 font-bold uppercase tracking-wider text-[10px]">
                  Delete Entry
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 text-xs">
                    No cases match your filters. Try resetting search or upload Excel sheet.
                  </td>
                </tr>
              ) : (
                filteredCases.map((c) => {
                  let statusBadge = 'bg-slate-800 text-slate-300 border-slate-700';
                  if (c.status === 'PAID') statusBadge = 'bg-emerald-950/60 text-emerald-400 border-emerald-800';
                  if (c.status === 'REPO' || c.status === 'REPO PENDING') statusBadge = 'bg-red-950/60 text-red-400 border-red-800';
                  if (c.status === 'PROMISE TO PAY') statusBadge = 'bg-amber-950/60 text-amber-400 border-amber-800';

                  let priorityColor = 'text-slate-400';
                  if (c.priority === 'CRITICAL') priorityColor = 'text-rose-400 font-bold';
                  if (c.priority === 'HIGH') priorityColor = 'text-amber-400 font-bold';

                  return (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-mono font-bold text-white text-xs hover:text-amber-400 cursor-pointer" onClick={() => handleOpenDetail(c)}>
                          {c.loanAgreementNumber}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{c.applicationId}</div>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-200">{c.customerName}</div>
                        <a href={`tel:${c.customerMobile}`} className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 font-mono">
                          <Phone className="w-3 h-3" />
                          {c.customerMobile}
                        </a>
                      </td>

                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-amber-300 border border-slate-700">
                          {c.financeCompanyName}
                        </span>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="font-mono font-bold text-slate-200">{c.registrationNumber || 'No Reg'}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                          {c.assetMake} {c.model}
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="font-mono font-bold text-amber-300">
                          ₹{c.tos?.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">TOS</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          ₹{c.pos?.toLocaleString()} POS
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        <span className="font-mono font-bold text-[10px] text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                          {c.bkt}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-slate-300">
                        {c.assignedOfficerName ? (
                          <span className="flex items-center gap-1 text-[11px]">
                            <UserIcon className="w-3 h-3 text-slate-400" />
                            {c.assignedOfficerName}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Unassigned</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusBadge}`}>
                          {c.status}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenDetail(c)}
                            title="View Case Dossier"
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(c)}
                            title="Edit Case Details"
                            className="p-1 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => {
                            if (confirm(`Permanently delete case ${c.loanAgreementNumber} for ${c.customerName}?`)) {
                              handleDelete(c);
                            }
                          }}
                          title="Delete Case Entry"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-rose-300 border border-rose-800/60 text-[11px] font-semibold transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Entry</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Case Details Drawer / Modal */}
      {isDetailModalOpen && selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-amber-400">
                    {selectedCase.loanAgreementNumber}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-bold text-slate-300">
                    {selectedCase.financeCompanyName}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                    {selectedCase.status}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1">{selectedCase.customerName}</h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (confirm(`Permanently delete case ${selectedCase.loanAgreementNumber} for ${selectedCase.customerName}?`)) {
                      handleDelete(selectedCase);
                      setIsDetailModalOpen(false);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-rose-300 border border-rose-800/60 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Entry
                </button>
                <button
                  onClick={() => handleOpenEdit(selectedCase)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar text-xs">
              {/* Financial Box */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-850 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400 uppercase text-[10px]">TOS (Total Overdue)</span>
                  <div className="text-lg font-black text-amber-400 font-mono">
                    ₹{selectedCase.tos?.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px]">POS (Principal Bal)</span>
                  <div className="text-lg font-black text-white font-mono">
                    ₹{selectedCase.pos?.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px]">Monthly EMI</span>
                  <div className="text-lg font-bold text-slate-200 font-mono">
                    ₹{selectedCase.emiAmount?.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px]">EMI Status</span>
                  <div className="text-sm font-bold text-slate-300 mt-1">
                    {selectedCase.paidEmi} Paid / <span className="text-rose-400">{selectedCase.pendingEmi} Pending</span>
                  </div>
                </div>
              </div>

              {/* Customer & Asset Split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Information */}
                <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-2.5">
                  <h3 className="font-bold text-amber-400 uppercase tracking-wider text-[11px] border-b border-slate-800 pb-1.5">
                    Customer Information
                  </h3>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mobile:</span>
                    <a href={`tel:${selectedCase.customerMobile}`} className="font-mono text-emerald-400 font-bold hover:underline">
                      {selectedCase.customerMobile}
                    </a>
                  </div>
                  {selectedCase.alternateMobile && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Alt Mobile:</span>
                      <span className="font-mono text-slate-300">{selectedCase.alternateMobile}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Residence Address:</span>
                    <span className="text-right text-slate-200 max-w-[200px]">{selectedCase.customerAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">City / State:</span>
                    <span className="text-slate-200">{selectedCase.city}, {selectedCase.state} - {selectedCase.pincode}</span>
                  </div>
                  {selectedCase.referenceName && (
                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Guarantor / Reference:</span>
                      <div className="text-slate-200 font-semibold">{selectedCase.referenceName}</div>
                      <div className="text-slate-400 font-mono">{selectedCase.referenceMobile}</div>
                    </div>
                  )}
                </div>

                {/* Asset / Vehicle Information */}
                <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-2.5">
                  <h3 className="font-bold text-amber-400 uppercase tracking-wider text-[11px] border-b border-slate-800 pb-1.5">
                    Asset &amp; Vehicle Details
                  </h3>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Reg Number:</span>
                    <strong className="font-mono text-white text-sm">{selectedCase.registrationNumber || 'Not Registered'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Make &amp; Model:</span>
                    <span className="text-slate-200 font-semibold">{selectedCase.assetMake} {selectedCase.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Engine No:</span>
                    <span className="font-mono text-slate-400">{selectedCase.engineNumber || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Chassis No:</span>
                    <span className="font-mono text-slate-400">{selectedCase.chassisNumber || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Loan Booking Date:</span>
                    <span className="text-slate-300">{selectedCase.loanBookingDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Loan Maturity:</span>
                    <span className="text-slate-300">{selectedCase.loanMaturityDate}</span>
                  </div>
                  {selectedCase.dealerName && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Dealer:</span>
                      <span className="text-slate-200">{selectedCase.dealerName}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Assignment & Remarks */}
              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold">Assigned Recovery Officer:</span>
                  <span className="text-white font-bold">{selectedCase.assignedOfficerName || 'Not Assigned'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold">Priority Level:</span>
                  <span className="font-bold text-amber-400">{selectedCase.priority}</span>
                </div>
                {selectedCase.remarks && (
                  <div className="pt-2 border-t border-slate-800 text-slate-300">
                    <span className="text-slate-500 font-semibold text-[10px] uppercase">Remarks / Field Notes:</span>
                    <p className="mt-0.5 italic">{selectedCase.remarks}</p>
                  </div>
                )}
              </div>

              {/* Custom Fields if any */}
              {selectedCase.customFields && Object.keys(selectedCase.customFields).length > 0 && (
                <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                  <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2">
                    Custom Attributes
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(selectedCase.customFields).map(([k, v]) => (
                      <div key={k} className="flex justify-between border-b border-slate-800 py-1">
                        <span className="text-slate-400 capitalize">{k}:</span>
                        <span className="text-slate-200 font-medium">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
              {confirmDeleteId === selectedCase.id ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-400 font-bold">Permanently delete this case?</span>
                  <button
                    type="button"
                    onClick={() => handleDelete(selectedCase)}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-sm"
                  >
                    Confirm Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(null)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(selectedCase.id)}
                  className="px-3 py-1.5 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-950 border border-red-900 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Case
                </button>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Case Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
            <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-amber-400" />
                {selectedCase ? `Edit Case: ${selectedCase.loanAgreementNumber}` : 'Create New Recovery Case'}
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 custom-scrollbar text-xs">
              {formError && (
                <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
              {/* Row 1: Finance Co & Loan Identification */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">
                    Finance Company <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.financeCompanyId}
                    onChange={(e) => setFormData({ ...formData, financeCompanyId: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {financeCompanies.map((fc) => (
                      <option key={fc.id} value={fc.id}>
                        {fc.name} ({fc.shortName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">
                    Loan Agreement Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TVS-DH-2024-8841"
                    value={formData.loanAgreementNumber}
                    onChange={(e) => setFormData({ ...formData, loanAgreementNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Application ID</label>
                  <input
                    type="text"
                    placeholder="e.g. APP-998811"
                    value={formData.applicationId}
                    onChange={(e) => setFormData({ ...formData, applicationId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Row 2: Customer Information */}
              <div className="border-t border-slate-800 pt-4">
                <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-3">
                  Customer &amp; Location
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">
                      Customer Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Patel"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">
                      Customer Mobile <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="98250..."
                      value={formData.customerMobile}
                      onChange={(e) => setFormData({ ...formData, customerMobile: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">Alternate Mobile</label>
                    <input
                      type="tel"
                      placeholder="Secondary contact"
                      value={formData.alternateMobile}
                      onChange={(e) => setFormData({ ...formData, alternateMobile: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-semibold text-slate-300">Residence Address</label>
                    <input
                      type="text"
                      placeholder="Village / Street / Landmark"
                      value={formData.customerAddress}
                      onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">City / District</label>
                    <input
                      type="text"
                      placeholder="e.g. Dahod"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Loan Financials & Buckets */}
              <div className="border-t border-slate-800 pt-4">
                <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-3">
                  Loan Financials &amp; Balances
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">Loan Amount (₹)</label>
                    <input
                      type="number"
                      value={formData.loanAmount}
                      onChange={(e) => setFormData({ ...formData, loanAmount: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">Monthly EMI (₹)</label>
                    <input
                      type="number"
                      value={formData.emiAmount}
                      onChange={(e) => setFormData({ ...formData, emiAmount: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-amber-300">TOS (Total Overdue ₹)</label>
                    <input
                      type="number"
                      value={formData.tos}
                      onChange={(e) => setFormData({ ...formData, tos: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-amber-500/50 text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">POS (Principal ₹)</label>
                    <input
                      type="number"
                      value={formData.pos}
                      onChange={(e) => setFormData({ ...formData, pos: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">Paid EMIs</label>
                    <input
                      type="number"
                      value={formData.paidEmi}
                      onChange={(e) => setFormData({ ...formData, paidEmi: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">Pending EMIs</label>
                    <input
                      type="number"
                      value={formData.pendingEmi}
                      onChange={(e) => setFormData({ ...formData, pendingEmi: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">Bucket (DPD)</label>
                    <input
                      type="text"
                      placeholder="e.g. BKT-2"
                      value={formData.bkt}
                      onChange={(e) => setFormData({ ...formData, bkt: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">Tenure (Months)</label>
                    <input
                      type="number"
                      value={formData.tenure}
                      onChange={(e) => setFormData({ ...formData, tenure: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Row 4: Asset Details */}
              <div className="border-t border-slate-800 pt-4">
                <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-3">
                  Vehicle / Asset Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">Registration Number</label>
                    <input
                      type="text"
                      placeholder="e.g. GJ-20-AH-4512"
                      value={formData.registrationNumber}
                      onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">Make (Manufacturer)</label>
                    <input
                      type="text"
                      placeholder="e.g. TVS / Hero / Bajaj"
                      value={formData.assetMake}
                      onChange={(e) => setFormData({ ...formData, assetMake: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">Model Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Apache RTR 160"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">Engine Number</label>
                    <input
                      type="text"
                      value={formData.engineNumber}
                      onChange={(e) => setFormData({ ...formData, engineNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">Chassis Number</label>
                    <input
                      type="text"
                      value={formData.chassisNumber}
                      onChange={(e) => setFormData({ ...formData, chassisNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">Dealer Name</label>
                    <input
                      type="text"
                      value={formData.dealerName}
                      onChange={(e) => setFormData({ ...formData, dealerName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Row 5: Assignment, Status & Priority */}
              <div className="border-t border-slate-800 pt-4">
                <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-3">
                  Officer Assignment &amp; Recovery Status
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">Assigned Officer</label>
                    <select
                      value={formData.assignedOfficerId}
                      onChange={(e) => setFormData({ ...formData, assignedOfficerId: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="">-- Unassigned --</option>
                      {officers.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name} ({o.designation})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">Case Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      {settings.casePriorities.map((p) => (
                        <option key={p} value={p}>
                          {p} Priority
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">Case Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      {settings.caseStatuses.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-3 space-y-1">
                    <label className="font-semibold text-slate-300">Internal Agency Remarks</label>
                    <input
                      type="text"
                      placeholder="e.g. Field visit notes, promised payment date, customer attitude..."
                      value={formData.remarks}
                      onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Custom Fields */}
              {caseCustomFields.length > 0 && (
                <CustomFieldRenderer
                  fields={caseCustomFields}
                  values={formData.customFields || {}}
                  onChange={(fieldName, val) => {
                    setFormData({
                      ...formData,
                      customFields: {
                        ...(formData.customFields || {}),
                        [fieldName]: val,
                      },
                    });
                  }}
                />
              )}

              {/* Form Action Buttons */}
              <div className="pt-5 border-t border-slate-800 flex items-center justify-between gap-3">
                {selectedCase ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Permanently delete case ${selectedCase.loanAgreementNumber} for ${selectedCase.customerName}?`)) {
                        handleDelete(selectedCase);
                        setIsEditModalOpen(false);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-rose-300 border border-rose-800/60 text-xs font-semibold transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Entry</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {selectedCase ? 'Save Changes' : 'Create Case Record'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
