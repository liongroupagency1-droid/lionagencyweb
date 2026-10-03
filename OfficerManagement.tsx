import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  Calendar,
  Building2,
  Target,
  CircleDollarSign,
  Download,
  X,
  Save,
  CheckCircle,
  XCircle,
  FolderKanban,
} from 'lucide-react';
import { storage } from '../services/storage';
import { OfficerRecord, FinanceCompany } from '../types';
import { ExcelService } from '../services/excelService';

export const OfficerManagement: React.FC = () => {
  const [officers, setOfficers] = useState<OfficerRecord[]>(() => storage.getOfficers());
  const [companies] = useState<FinanceCompany[]>(() => storage.getFinanceCompanies());
  const [cases] = useState(() => storage.getCases());
  const settings = storage.getSettings();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState<OfficerRecord | null>(null);
  const [deleteConfirmOfficer, setDeleteConfirmOfficer] = useState<OfficerRecord | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState<Partial<OfficerRecord>>({
    name: '',
    employeeId: '',
    mobile: '',
    address: '',
    joiningDate: new Date().toISOString().split('T')[0],
    designation: 'Field Collection Officer',
    salary: 0,
    target: 0,
    assignedFinanceCompanyIds: [],
    status: 'ACTIVE',
  });

  const refreshList = () => {
    setOfficers([...storage.getOfficers()]);
  };

  const filteredOfficers = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return officers.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.employeeId.toLowerCase().includes(q) ||
        o.mobile.includes(q) ||
        o.designation.toLowerCase().includes(q)
    );
  }, [officers, searchTerm]);

  // Compute stats per officer
  const officerStats = useMemo(() => {
    const stats: Record<string, { caseCount: number; collected: number }> = {};
    const collections = storage.getCollections();

    cases.forEach((c) => {
      if (c.assignedOfficerId) {
        if (!stats[c.assignedOfficerId]) stats[c.assignedOfficerId] = { caseCount: 0, collected: 0 };
        stats[c.assignedOfficerId].caseCount++;
      }
    });

    collections.forEach((col) => {
      if (col.officerId) {
        if (!stats[col.officerId]) stats[col.officerId] = { caseCount: 0, collected: 0 };
        stats[col.officerId].collected += col.collectionAmount;
      }
    });

    return stats;
  }, [cases]);

  const handleOpenAdd = () => {
    setEditingOfficer(null);
    setFormData({
      name: '',
      employeeId: `LGA-OFF-${String(officers.length + 1).padStart(2, '0')}`,
      mobile: '',
      address: '',
      joiningDate: new Date().toISOString().split('T')[0],
      designation: settings.officerDesignations[0] || 'Field Collection Officer',
      salary: 22000,
      target: 250000,
      assignedFinanceCompanyIds: companies.map((c) => c.id),
      status: 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (o: OfficerRecord) => {
    setEditingOfficer(o);
    setFormData({ ...o });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!formData.name || !formData.mobile) {
      setFormError('Please enter name and mobile number.');
      return;
    }

    if (editingOfficer) {
      storage.updateOfficer(editingOfficer.id, formData);
    } else {
      storage.addOfficer(formData as any);
    }

    setIsModalOpen(false);
    refreshList();
  };

  const handleDeleteOfficer = (o: OfficerRecord) => {
    storage.deleteOfficer(o.id);
    setDeleteConfirmOfficer(null);
    setIsModalOpen(false);
    refreshList();
  };

  const handleClearAllOfficers = () => {
    storage.clearAllOfficers();
    setConfirmClearAll(false);
    refreshList();
  };

  const handleToggleStatus = (o: OfficerRecord) => {
    const newStatus = o.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    storage.updateOfficer(o.id, { status: newStatus });
    refreshList();
  };

  const handleExport = () => {
    ExcelService.exportToExcel(officers, 'Lion_Group_Agency_Officers', 'Officers');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white">Officer Directory &amp; Recovery Roster</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Recovery executives, repo agents, field staff designations, portfolio allocation &amp; performance targets
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Export
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/10"
          >
            <Plus className="w-4 h-4" />
            Add Recovery Officer
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search officer name, employee ID, mobile, designation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-400 font-medium">
            Total: <strong className="text-amber-400">{officers.length}</strong> Officers (
            <strong className="text-emerald-400">
              {officers.filter((o) => o.status === 'ACTIVE').length} Active
            </strong>
            )
          </div>

          {officers.length > 0 && (
            <button
              onClick={() => setConfirmClearAll(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 text-xs font-semibold transition-colors"
              title="Delete all officer entries"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Officers</span>
            </button>
          )}
        </div>
      </div>

      {/* Officers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOfficers.map((o) => {
          const stats = officerStats[o.id] || { caseCount: 0, collected: 0 };
          const isActive = o.status === 'ACTIVE';

          return (
            <div
              key={o.id}
              className={`bg-slate-900 border rounded-xl p-5 shadow-lg flex flex-col justify-between transition-all ${
                isActive ? 'border-slate-800 hover:border-slate-700' : 'border-slate-800/60 opacity-60'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-400">
                      {o.employeeId}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5">{o.name}</h3>
                    <p className="text-xs text-slate-400 font-medium">{o.designation}</p>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(o)}
                    className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border transition-colors ${
                      isActive
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
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

                {/* Details */}
                <div className="space-y-1.5 text-xs text-slate-300 mb-4">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <a href={`tel:${o.mobile}`} className="font-mono text-emerald-400 hover:underline">
                      {o.mobile}
                    </a>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Joined: {o.joiningDate}</span>
                  </div>

                  {o.address && (
                    <div className="text-[11px] text-slate-400 truncate">
                      <span>Area: {o.address}</span>
                    </div>
                  )}

                  {/* Targets & Salary stats */}
                  <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="bg-slate-850 p-2 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Monthly Target</div>
                      <div className="font-mono font-bold text-amber-300">
                        ₹{o.target?.toLocaleString()}
                      </div>
                    </div>

                    <div className="bg-slate-850 p-2 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Basic Salary</div>
                      <div className="font-mono font-bold text-white">
                        ₹{o.salary?.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Assigned Financiers */}
                  <div className="pt-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500">
                      Assigned Financiers:
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {o.assignedFinanceCompanyIds && o.assignedFinanceCompanyIds.length > 0 ? (
                        o.assignedFinanceCompanyIds.map((fcId) => {
                          const co = companies.find((c) => c.id === fcId);
                          return (
                            <span
                              key={fcId}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700"
                            >
                              {co?.shortName || fcId}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">All Companies</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <FolderKanban className="w-3.5 h-3.5 text-amber-400" />
                  <strong className="text-white font-mono">{stats.caseCount}</strong> Cases Assigned
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(o)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirmOfficer(o)}
                    title={`Delete officer ${o.name}`}
                    className="p-1 rounded bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredOfficers.length === 0 && (
          <div className="col-span-full bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No officers registered</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
              All officer entries have been deleted or no officers match the search filter.
            </p>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md"
            >
              <Plus className="w-4 h-4" />
              Add Recovery Officer
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in duration-150">
            <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                {editingOfficer ? `Edit Officer: ${editingOfficer.name}` : 'Register New Officer'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs">
                  {formError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="font-semibold text-slate-300">
                    Officer Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter officer full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">
                    Employee ID <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">
                    Mobile Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="98980..."
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Designation</label>
                  <select
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {settings.officerDesignations.map((des) => (
                      <option key={des} value={des}>
                        {des}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Joining Date</label>
                  <input
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Basic Monthly Salary (₹)</label>
                  <input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-amber-400">Monthly Target (₹)</label>
                  <input
                    type="number"
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-amber-500/50 text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="font-semibold text-slate-300">Residential Address</label>
                  <input
                    type="text"
                    placeholder="Local address in Dahod/District"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="col-span-2 space-y-2 pt-2 border-t border-slate-800">
                  <label className="font-semibold text-slate-300">
                    Assigned Finance Companies Portfolio
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {companies.map((co) => {
                      const isAssigned = (formData.assignedFinanceCompanyIds || []).includes(co.id);
                      return (
                        <label
                          key={co.id}
                          className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-xs ${
                            isAssigned
                              ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 font-semibold'
                              : 'bg-slate-800 border-slate-700 text-slate-400'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isAssigned}
                            onChange={(e) => {
                              const cur = formData.assignedFinanceCompanyIds || [];
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  assignedFinanceCompanyIds: [...cur, co.id],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  assignedFinanceCompanyIds: cur.filter((id) => id !== co.id),
                                });
                              }
                            }}
                            className="rounded text-amber-500"
                          />
                          <span>{co.shortName}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                {editingOfficer ? (
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteConfirmOfficer(editingOfficer);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 text-xs font-semibold transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Officer
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
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
                    {editingOfficer ? 'Save Officer Profile' : 'Register Officer'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Single Officer Confirmation Modal */}
      {deleteConfirmOfficer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Delete Officer Record?</h3>
            </div>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              Are you sure you want to permanently delete officer{' '}
              <strong className="text-white">{deleteConfirmOfficer.name}</strong> ({deleteConfirmOfficer.employeeId})? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmOfficer(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteOfficer(deleteConfirmOfficer)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/20 transition-colors"
              >
                Delete Officer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Officers Confirmation Modal */}
      {confirmClearAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Delete All Officers?</h3>
            </div>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              Are you sure you want to delete all <strong className="text-white">{officers.length}</strong> officer entries from the agency directory?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmClearAll(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAllOfficers}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/20 transition-colors"
              >
                Delete All Officers
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
