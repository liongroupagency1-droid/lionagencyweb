import React, { useState, useMemo } from 'react';
import {
  CarFront,
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  Building2,
  Clock,
  Printer,
  ShieldCheck,
  X,
  Save,
  CheckCircle,
  Trash2,
} from 'lucide-react';
import { storage } from '../services/storage';
import { RepoReleaseRecord, FinanceCompany } from '../types';
import { ExcelService } from '../services/excelService';

export const RepoReleaseModule: React.FC = () => {
  const [records, setRecords] = useState<RepoReleaseRecord[]>(() => storage.getRepoReleases());
  const yards = useMemo(() => storage.getVehicleYards(), []);
  const companies = useMemo(() => storage.getFinanceCompanies(), []);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompany, setFilterCompany] = useState('ALL');
  const [filterDate, setFilterDate] = useState('');

  const refreshList = () => {
    setRecords([...storage.getRepoReleases()]);
  };

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        r.vehicleNumber?.toLowerCase().includes(q) ||
        r.customerName?.toLowerCase().includes(q) ||
        r.loanAgreementNumber?.toLowerCase().includes(q) ||
        r.repoAgentName?.toLowerCase().includes(q);

      const matchesCompany = filterCompany === 'ALL' || r.financeCompanyId === filterCompany;
      const matchesDate = !filterDate || r.releaseDate === filterDate;

      return matchesSearch && matchesCompany && matchesDate;
    });
  }, [records, searchTerm, filterCompany, filterDate]);

  const handleExport = () => {
    ExcelService.exportToExcel(filtered, 'Lion_Group_Repo_Release_Ledger', 'Repo_Release');
  };

  const handleDelete = (r: RepoReleaseRecord) => {
    if (
      window.confirm(
        `Are you sure you want to delete release record for vehicle ${r.vehicleNumber} (${r.customerName})?`
      )
    ) {
      storage.deleteRepoRelease(r.id);
      refreshList();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <CarFront className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white">Repo &amp; Vehicle Release Register</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tracking customer payment settlements, repossession agent disbursements, and authorized vehicle handovers
          </p>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          Export Ledger
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search vehicle no, customer, agent, LAN..."
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
            <option value="ALL">All Financiers</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.shortName}
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

      {/* Release Records Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase text-[10px]">
                <th className="py-3 px-3">Vehicle No</th>
                <th className="py-3 px-3">Customer &amp; Loan Agreement</th>
                <th className="py-3 px-3">Financier</th>
                <th className="py-3 px-3">Repo Date &amp; Yard</th>
                <th className="py-3 px-3">Release Date</th>
                <th className="py-3 px-3 text-right">Customer Payment (₹)</th>
                <th className="py-3 px-3 text-right text-rose-400">Agent Fee (₹)</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-center text-rose-400 font-bold uppercase tracking-wider text-[10px]">
                  Delete Entry
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 text-xs">
                    No release records found. Use "Same-Day Release" or yard release to record a handover.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-mono font-bold text-white">
                      {r.vehicleNumber}
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-200">{r.customerName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{r.loanAgreementNumber}</div>
                    </td>

                    <td className="py-2.5 px-3 font-mono text-slate-300">{r.financeCompanyName}</td>

                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-200">{r.yardName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {r.repoDate} ({r.repoTime})
                      </div>
                    </td>

                    <td className="py-2.5 px-3 font-mono text-emerald-400 font-semibold">
                      {r.releaseDate} {r.releaseTime ? `(${r.releaseTime})` : ''}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400 text-sm">
                      ₹{r.customerReleasePayment?.toLocaleString()}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono text-rose-400">
                      ₹{r.repoAgentCharge?.toLocaleString()}
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800">
                        {r.vehicleStatus}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleDelete(r)}
                        title={`Delete release record ${r.vehicleNumber}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-rose-300 border border-rose-800/60 text-xs font-semibold transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Entry</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
