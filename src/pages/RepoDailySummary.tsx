import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Calendar,
  Truck,
  CarFront,
  Zap,
  Building2,
  User as UserIcon,
  CircleDollarSign,
  TrendingDown,
  Download,
  Filter,
} from 'lucide-react';
import { storage } from '../services/storage';
import { ExcelService } from '../services/excelService';

export const RepoDailySummary: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(
    () => new Date().toISOString().split('T')[0]
  );
  const [filterCompany, setFilterCompany] = useState('ALL');
  const [filterAgent, setFilterAgent] = useState('ALL');

  const yards = useMemo(() => storage.getVehicleYards(), []);
  const releases = useMemo(() => storage.getRepoReleases(), []);
  const companies = useMemo(() => storage.getFinanceCompanies(), []);
  const officers = useMemo(() => storage.getOfficers(), []);

  // Filter yards according to filters
  const filteredYards = useMemo(() => {
    return yards.filter((y) => {
      const matchCo = filterCompany === 'ALL' || y.financeCompanyId === filterCompany;
      const matchAgent = filterAgent === 'ALL' || y.repoAgentName === filterAgent;
      return matchCo && matchAgent;
    });
  }, [yards, filterCompany, filterAgent]);

  const filteredReleases = useMemo(() => {
    return releases.filter((r) => {
      const matchCo = filterCompany === 'ALL' || r.financeCompanyId === filterCompany;
      const matchAgent = filterAgent === 'ALL' || r.repoAgentName === filterAgent;
      return matchCo && matchAgent;
    });
  }, [releases, filterCompany, filterAgent]);

  // Aggregate values
  const dateRepos = filteredYards.filter((y) => y.repoDate === selectedDate);
  const dateReleases = filteredReleases.filter((r) => r.releaseDate === selectedDate);
  const sameDayReleases = dateReleases.filter((r) => r.isSameDayRelease);

  const vehiclesInYardCount = filteredYards.filter((y) =>
    ['REPO', 'IN YARD'].includes(y.vehicleStatus)
  ).length;

  const customerReleaseCollection = dateReleases.reduce(
    (acc, r) => acc + (Number(r.customerReleasePayment) || 0),
    0
  );

  const repoAgentCharges = dateReleases.reduce(
    (acc, r) => acc + (Number(r.repoAgentCharge) || 0),
    0
  );

  const otherCharges = dateReleases.reduce(
    (acc, r) => acc + (Number(r.otherCharges) || 0),
    0
  );

  const netAmount = customerReleaseCollection - repoAgentCharges - otherCharges;

  const handleExport = () => {
    const summaryData = [
      {
        Date: selectedDate,
        "Today's Repos": dateRepos.length,
        "Today's Releases": dateReleases.length,
        'Same-Day Releases': sameDayReleases.length,
        'Vehicles in Yard': vehiclesInYardCount,
        'Customer Release Collection': customerReleaseCollection,
        'Repo Agent Charges': repoAgentCharges,
        'Other Charges': otherCharges,
        'Net Recovered Amount': netAmount,
      },
    ];
    ExcelService.exportToExcel(summaryData, `Lion_Group_Repo_Summary_${selectedDate}`, 'Repo_Summary');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white">Repossession Daily Operational Summary</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Reconciliation of repos, releases, customer recovery payments, repo agent charges &amp; net margin
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
          />

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Export Summary
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">
            Filter by Finance Company
          </label>
          <select
            value={filterCompany}
            onChange={(e) => setFilterCompany(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Finance Companies</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.shortName})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">
            Filter by Repo Agent
          </label>
          <select
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Repo Agents</option>
            {officers.map((o) => (
              <option key={o.id} value={o.name}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Primary Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="uppercase font-semibold">Today's Repo</span>
            <Truck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400 font-mono mt-1">
            {dateRepos.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Custodies secured on {selectedDate}</p>
        </div>

        <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="uppercase font-semibold">Today's Release</span>
            <CarFront className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono mt-1">
            {dateReleases.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Authorized releases issued</p>
        </div>

        <div className="bg-slate-900 border border-yellow-500/30 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between text-xs text-amber-400 mb-1">
            <span className="uppercase font-bold">Same-Day Release</span>
            <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-300 font-mono mt-1">
            {sameDayReleases.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Settled within same day</p>
        </div>

        <div className="bg-slate-900 border border-cyan-500/30 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="uppercase font-semibold">Vehicles in Yard</span>
            <Building2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-cyan-400 font-mono mt-1">
            {vehiclesInYardCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Currently in yard custody</p>
        </div>
      </div>

      {/* Financial Reconciliation Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
          Daily Repossession Financial Reconciliation ({selectedDate})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-1">
          <div className="bg-slate-850 p-4 rounded-xl border border-emerald-800/40">
            <span className="text-emerald-400 text-[10px] uppercase font-bold">
              Customer Release Collection (+)
            </span>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
              ₹{customerReleaseCollection.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Settlement amount received</div>
          </div>

          <div className="bg-slate-850 p-4 rounded-xl border border-rose-800/40">
            <span className="text-rose-400 text-[10px] uppercase font-bold">
              Repo Agent Charges (-)
            </span>
            <div className="text-2xl font-black text-rose-400 font-mono mt-1">
              ₹{repoAgentCharges.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Incentives paid to repo crew</div>
          </div>

          <div className="bg-slate-850 p-4 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase font-semibold">
              Parking &amp; Other Charges (-)
            </span>
            <div className="text-2xl font-black text-slate-300 font-mono mt-1">
              ₹{otherCharges.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Yard maintenance &amp; cranes</div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-amber-950/40 p-4 rounded-xl border-2 border-amber-500/60">
            <span className="text-amber-400 text-[10px] uppercase font-black">
              Net Agency Recovery Yield (=)
            </span>
            <div className="text-2xl font-black text-amber-400 font-mono mt-1">
              ₹{netAmount.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Net profit after direct repo costs</div>
          </div>
        </div>
      </div>
    </div>
  );
};
