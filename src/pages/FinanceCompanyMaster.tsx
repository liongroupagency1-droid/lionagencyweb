import React, { useState, useMemo } from 'react';
import {
  Building2,
  Plus,
  Search,
  Edit2,
  CheckCircle,
  XCircle,
  Download,
  Mail,
  Phone,
  MapPin,
  FolderKanban,
  X,
  Save,
  Trash2,
} from 'lucide-react';
import { storage } from '../services/storage';
import { FinanceCompany } from '../types';
import { ExcelService } from '../services/excelService';

export const FinanceCompanyMaster: React.FC = () => {
  const [companies, setCompanies] = useState<FinanceCompany[]>(() => storage.getFinanceCompanies());
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<FinanceCompany | null>(null);
  const [formError, setFormError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    contactPerson: '',
    mobile: '',
    email: '',
    address: '',
    remarks: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });

  const refreshList = () => {
    setCompanies([...storage.getFinanceCompanies()]);
  };

  const cases = useMemo(() => storage.getCases(), []);

  // Compute case counts per company
  const caseCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    cases.forEach((c) => {
      counts[c.financeCompanyId] = (counts[c.financeCompanyId] || 0) + 1;
    });
    return counts;
  }, [cases]);

  const filteredCompanies = companies.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.shortName.toLowerCase().includes(q) ||
      c.contactPerson.toLowerCase().includes(q) ||
      c.mobile.includes(q) ||
      c.address.toLowerCase().includes(q)
    );
  });

  const handleOpenAdd = () => {
    setEditingCompany(null);
    setFormData({
      name: '',
      shortName: '',
      contactPerson: '',
      mobile: '',
      email: '',
      address: '',
      remarks: '',
      status: 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (co: FinanceCompany) => {
    setEditingCompany(co);
    setFormData({
      name: co.name,
      shortName: co.shortName,
      contactPerson: co.contactPerson,
      mobile: co.mobile,
      email: co.email,
      address: co.address,
      remarks: co.remarks || '',
      status: co.status,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!formData.name.trim() || !formData.shortName.trim()) {
      setFormError('Company Name and Short Name are required');
      return;
    }

    if (editingCompany) {
      storage.updateFinanceCompany(editingCompany.id, formData);
    } else {
      storage.addFinanceCompany(formData);
    }

    setIsModalOpen(false);
    refreshList();
  };

  const handleToggleStatus = (co: FinanceCompany) => {
    const newStatus = co.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    storage.updateFinanceCompany(co.id, { status: newStatus });
    refreshList();
  };

  const handleExport = () => {
    ExcelService.exportToExcel(companies, 'Lion_Group_Agency_Finance_Companies', 'Finance_Companies');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white">Finance Company Master</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Unlimited Finance Companies (Banks &amp; NBFCs). Automatically propagates to Cases, Collection, Repo, Reports &amp; Officer assignment.
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
            Add Finance Company
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search company name, short code, contact person, mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>
        <div className="text-xs text-slate-400 font-medium">
          Total: <strong className="text-amber-400">{companies.length}</strong> Companies Registered
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCompanies.map((co) => {
          const totalLinkedCases = caseCounts[co.id] || 0;
          const isActive = co.status === 'ACTIVE';

          return (
            <div
              key={co.id}
              className={`bg-slate-900 border rounded-xl p-5 shadow-lg flex flex-col justify-between transition-all ${
                isActive ? 'border-slate-800 hover:border-slate-700' : 'border-slate-800/60 opacity-60'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
                      {co.shortName}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1.5 leading-snug">{co.name}</h3>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(co)}
                    title={`Click to mark ${isActive ? 'Inactive' : 'Active'}`}
                    className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border transition-colors ${
                      isActive
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80 hover:bg-red-950/40 hover:text-red-400 hover:border-red-800'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-emerald-950/40 hover:text-emerald-400'
                    }`}
                  >
                    {isActive ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        ACTIVE
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" />
                        INACTIVE
                      </>
                    )}
                  </button>
                </div>

                {/* Details List */}
                <div className="space-y-1.5 text-xs text-slate-300 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[11px] w-24">Contact Person:</span>
                    <span className="font-semibold text-slate-200">{co.contactPerson || 'N/A'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <a href={`tel:${co.mobile}`} className="hover:underline font-mono">
                      {co.mobile || 'N/A'}
                    </a>
                  </div>

                  {co.email && (
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate text-slate-400">{co.email}</span>
                    </div>
                  )}

                  {co.address && (
                    <div className="flex items-start gap-2 pt-1 text-slate-400 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{co.address}</span>
                    </div>
                  )}

                  {co.remarks && (
                    <div className="mt-2 p-2 rounded bg-slate-850 border border-slate-800 text-[11px] text-slate-400 italic">
                      "{co.remarks}"
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <FolderKanban className="w-3.5 h-3.5 text-amber-400" />
                  <strong className="text-slate-200 font-mono">{totalLinkedCases}</strong> Active Cases
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Permanently delete finance company ${co.name}? Active cases will retain history.`)) {
                        storage.deleteFinanceCompany(co.id);
                        setCompanies(storage.getFinanceCompanies());
                      }
                    }}
                    title="Delete Finance Company Entry"
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-rose-300 border border-rose-800/60 text-xs transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete Entry</span>
                  </button>
                  <button
                    onClick={() => handleOpenEdit(co)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in duration-150">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                {editingCompany ? 'Edit Finance Company' : 'Add New Finance Company'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {formError && (
                <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs">
                  {formError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Full Company Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter full finance company or bank name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Short Name / Code <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Short Name or Code"
                    value={formData.shortName}
                    onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Contact Person</label>
                  <input
                    type="text"
                    placeholder="Name of manager/coordinator"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="98250..."
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Email Address</label>
                  <input
                    type="email"
                    placeholder="manager@financier.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Office Address (Dahod/Regional)</label>
                  <textarea
                    rows={2}
                    placeholder="Address of local office..."
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Remarks / Contract Terms</label>
                  <input
                    type="text"
                    placeholder="e.g. 2-Wheeler recovery contract, 10% fee"
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                {editingCompany ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Permanently delete finance company ${editingCompany.name}? Active cases will retain history.`)) {
                        storage.deleteFinanceCompany(editingCompany.id);
                        setCompanies(storage.getFinanceCompanies());
                        setIsModalOpen(false);
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
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {editingCompany ? 'Save Changes' : 'Register Finance Company'}
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
