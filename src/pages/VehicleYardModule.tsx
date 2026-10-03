import React, { useState, useMemo } from 'react';
import {
  Truck,
  Plus,
  Search,
  Filter,
  Download,
  Building2,
  Calendar,
  Clock,
  CarFront,
  X,
  Save,
  CheckCircle,
  AlertTriangle,
  Zap,
  Trash2,
  Info,
} from 'lucide-react';
import { storage } from '../services/storage';
import { VehicleYardRecord, FinanceCompany } from '../types';
import { ExcelService } from '../services/excelService';

export const VehicleYardModule: React.FC = () => {
  const [vehicles, setVehicles] = useState<VehicleYardRecord[]>(() => storage.getVehicleYards());
  const companies = useMemo(() => storage.getFinanceCompanies(), []);
  const cases = useMemo(() => storage.getCases(), []);
  const settings = storage.getSettings();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterYard, setFilterYard] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterCompany, setFilterCompany] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleYardRecord | null>(null);
  const [formError, setFormError] = useState('');

  const initialForm: Partial<VehicleYardRecord> = {
    financeCompanyId: companies[0]?.id || '',
    financeCompanyName: companies[0]?.shortName || '',
    vehicleNumber: '',
    customerName: '',
    loanAgreementNumber: '',
    vehicleMake: '',
    model: '',
    engineNumber: '',
    chassisNumber: '',
    repoDate: new Date().toISOString().split('T')[0],
    repoTime: '11:00',
    yardName: settings.yardNames[0] || 'Dahod Central Yard',
    yardEntryTime: '12:30',
    vehicleCondition: 'Good, keys available',
    parkingCharges: 500,
    otherCharges: 200,
    totalExpense: 700,
    vehicleStatus: 'IN YARD',
    repoAgentName: '',
    repoAgentMobile: '',
    repoAgentCharge: 1500,
  };

  const [formData, setFormData] = useState<Partial<VehicleYardRecord>>(initialForm);

  const refreshList = () => {
    setVehicles([...storage.getVehicleYards()]);
  };

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        v.vehicleNumber?.toLowerCase().includes(q) ||
        v.customerName?.toLowerCase().includes(q) ||
        v.loanAgreementNumber?.toLowerCase().includes(q) ||
        v.repoAgentName?.toLowerCase().includes(q);

      const matchesYard = filterYard === 'ALL' || v.yardName === filterYard;
      const matchesStatus = filterStatus === 'ALL' || v.vehicleStatus === filterStatus;
      const matchesCompany = filterCompany === 'ALL' || v.financeCompanyId === filterCompany;

      return matchesSearch && matchesYard && matchesStatus && matchesCompany;
    });
  }, [vehicles, searchTerm, filterYard, filterStatus, filterCompany]);

  const handleOpenAdd = () => {
    setSelectedVehicle(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: VehicleYardRecord) => {
    setSelectedVehicle(v);
    setFormData({ ...v });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!formData.vehicleNumber || !formData.customerName) {
      setFormError('Vehicle Number and Customer Name are required.');
      return;
    }

    const co = companies.find((c) => c.id === formData.financeCompanyId);
    const payload = {
      ...formData,
      financeCompanyName: co?.shortName || co?.name || formData.financeCompanyName || '',
      totalExpense:
        (Number(formData.parkingCharges) || 0) +
        (Number(formData.otherCharges) || 0) +
        (Number(formData.repoAgentCharge) || 0),
    };

    if (selectedVehicle) {
      storage.updateVehicleYard(selectedVehicle.id, payload);
    } else {
      storage.addVehicleYard(payload as any);
    }

    setIsModalOpen(false);
    refreshList();
  };

  const handleExport = () => {
    ExcelService.exportToExcel(filteredVehicles, 'Lion_Group_Yard_Inventory', 'Yard_Inventory');
  };

  const handleDelete = (v: VehicleYardRecord) => {
    if (
      window.confirm(
        `Are you sure you want to permanently delete vehicle entry ${v.vehicleNumber} (${v.customerName}) from ${v.yardName}?`
      )
    ) {
      storage.deleteVehicleYard(v.id);
      refreshList();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white">Vehicle &amp; Yard Inventory Management</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Custody register, parking fees, condition inventory &amp; stock status for Dahod, Godhra &amp; Limkheda yards
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Export Inventory
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/10"
          >
            <Plus className="w-4 h-4" />
            Log Vehicle In Yard
          </button>
        </div>
      </div>

      {/* How to Delete a Vehicle & Yard Entry Guide */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-amber-400">
            <Info className="w-4 h-4 shrink-0" />
            <span>How to Delete a Vehicle &amp; Yard Entry</span>
          </div>
          <span className="text-[11px] text-slate-400 italic">
            Custody records will be permanently removed from yard count
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Step 1: Locate
            </span>
            <p className="font-semibold text-white mt-1.5 text-xs">Find Vehicle Record</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Use the search bar or yard filter below to find the vehicle number or customer name.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
              Step 2: Click Delete
            </span>
            <p className="font-semibold text-white mt-1.5 text-xs">Click "Delete Entry"</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Click the red <strong className="text-rose-400">Delete Entry</strong> button with the trash icon in the Actions column.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Step 3: Confirm
            </span>
            <p className="font-semibold text-white mt-1.5 text-xs">Confirm Removal</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Confirm the dialog to delete the vehicle custody entry and update dashboard yard counts.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search vehicle number, customer, LAN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <select
            value={filterYard}
            onChange={(e) => setFilterYard(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Yard Locations</option>
            {settings.yardNames.map((yard) => (
              <option key={yard} value={yard}>
                {yard}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Vehicle Statuses</option>
            {settings.vehicleStatuses.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filterCompany}
            onChange={(e) => setFilterCompany(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Financiers</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.shortName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase text-[10px]">
                <th className="py-3 px-3">Vehicle No</th>
                <th className="py-3 px-3">Customer &amp; Loan No</th>
                <th className="py-3 px-3">Financier</th>
                <th className="py-3 px-3">Make / Model</th>
                <th className="py-3 px-3">Yard Name &amp; Date</th>
                <th className="py-3 px-3">Condition &amp; Agent</th>
                <th className="py-3 px-3 text-right">Parking Charges</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 text-xs">
                    No vehicles found in yard inventory matching filters.
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((v) => {
                  let badge = 'bg-slate-800 text-slate-300 border-slate-700';
                  if (v.vehicleStatus === 'IN YARD' || v.vehicleStatus === 'REPO') {
                    badge = 'bg-amber-950/60 text-amber-400 border-amber-800';
                  } else if (v.vehicleStatus === 'RELEASED SAME DAY') {
                    badge = 'bg-emerald-950/60 text-emerald-400 border-emerald-800 font-bold';
                  } else if (v.vehicleStatus.includes('RELEASED')) {
                    badge = 'bg-blue-950/60 text-blue-400 border-blue-800';
                  }

                  return (
                    <tr key={v.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3">
                        <div className="font-mono font-bold text-white text-xs">{v.vehicleNumber}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {v.engineNumber ? `E: ${v.engineNumber}` : ''}
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-200">{v.customerName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{v.loanAgreementNumber}</div>
                      </td>

                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {v.financeCompanyName}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-slate-300">
                        {v.vehicleMake} {v.model}
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-200">{v.yardName}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {v.repoDate} ({v.repoTime})
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="truncate max-w-[150px] text-slate-300 text-[11px]">{v.vehicleCondition}</div>
                        {v.repoAgentName && (
                          <div className="text-[10px] text-amber-400">Agent: {v.repoAgentName}</div>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-200">
                        ₹{v.parkingCharges?.toLocaleString()}
                      </td>

                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] border ${badge}`}>
                          {v.vehicleStatus}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(v)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
                          >
                            Update
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(v)}
                            title={`Delete vehicle entry ${v.vehicleNumber}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-rose-300 border border-rose-800/60 text-xs font-semibold transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Entry</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in duration-150">
            <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-400" />
                {selectedVehicle ? `Update Yard Record: ${selectedVehicle.vehicleNumber}` : 'Log Vehicle Entry into Yard'}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">
                    Vehicle Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GJ-20-AB-1234"
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
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
                  <label className="font-semibold text-slate-300">Finance Company</label>
                  <select
                    value={formData.financeCompanyId}
                    onChange={(e) => setFormData({ ...formData, financeCompanyId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.shortName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Yard Location</label>
                  <select
                    value={formData.yardName}
                    onChange={(e) => setFormData({ ...formData, yardName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {settings.yardNames.map((yard) => (
                      <option key={yard} value={yard}>
                        {yard}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Vehicle Status</label>
                  <select
                    value={formData.vehicleStatus}
                    onChange={(e) => setFormData({ ...formData, vehicleStatus: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {settings.vehicleStatuses.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Repo Date &amp; Time</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={formData.repoDate}
                      onChange={(e) => setFormData({ ...formData, repoDate: e.target.value })}
                      className="px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                    />
                    <input
                      type="time"
                      value={formData.repoTime}
                      onChange={(e) => setFormData({ ...formData, repoTime: e.target.value })}
                      className="px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Parking Charges (₹)</label>
                  <input
                    type="number"
                    value={formData.parkingCharges}
                    onChange={(e) => setFormData({ ...formData, parkingCharges: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Repo Agent Name</label>
                  <input
                    type="text"
                    value={formData.repoAgentName}
                    onChange={(e) => setFormData({ ...formData, repoAgentName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Repo Agent Charges (₹)</label>
                  <input
                    type="number"
                    value={formData.repoAgentCharge}
                    onChange={(e) => setFormData({ ...formData, repoAgentCharge: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="font-semibold text-slate-300">Vehicle Condition / Inventory Sheet</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Good condition, keys available, scratches on rear panel..."
                    value={formData.vehicleCondition}
                    onChange={(e) => setFormData({ ...formData, vehicleCondition: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                {selectedVehicle ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Permanently delete vehicle ${selectedVehicle.vehicleNumber} (${selectedVehicle.customerName}) from yard inventory?`
                        )
                      ) {
                        storage.deleteVehicleYard(selectedVehicle.id);
                        setIsModalOpen(false);
                        refreshList();
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-rose-300 border border-rose-800/60 text-xs font-semibold transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Entry</span>
                  </button>
                ) : (
                  <div />
                )}

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
                    className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md"
                  >
                    <Save className="w-4 h-4 inline mr-1" />
                    Save Record
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
