import React, { useMemo, useState } from 'react';
import {
  FolderKanban,
  CircleDollarSign,
  TrendingUp,
  Truck,
  CarFront,
  Zap,
  Users,
  CalendarCheck,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Building2,
  Plus,
  Trash2,
  Radio,
  Globe,
  Wallet,
  Calculator,
} from 'lucide-react';
import { storage } from '../services/storage';
import { OpeningClosingBalanceModal } from '../components/OpeningClosingBalanceModal';

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{
    type: 'company' | 'all' | 'collection';
    id: string;
    title: string;
    message: string;
  } | null>(null);

  const metrics = useMemo(() => storage.getDashboardMetrics(), [refreshKey]);
  const cases = useMemo(() => storage.getCases(), [refreshKey]);
  const collections = useMemo(() => storage.getCollections(), [refreshKey]);
  const companies = useMemo(() => storage.getFinanceCompanies(), [refreshKey]);
  const yards = useMemo(() => storage.getVehicleYards(), [refreshKey]);
  const settings = useMemo(() => storage.getSettings(), [refreshKey]);

  // Compute breakdown by Finance Company
  const companyBreakdown = useMemo(() => {
    const map: Record<string, { count: number; tos: number }> = {};
    cases.forEach((c) => {
      const name = c.financeCompanyName || 'Unknown';
      if (!map[name]) map[name] = { count: 0, tos: 0 };
      map[name].count++;
      map[name].tos += Number(c.tos) || 0;
    });
    return Object.entries(map).map(([name, data]) => ({ name, ...data }));
  }, [cases]);

  // Compute bucket breakdown (only include active buckets when cases exist)
  const bucketBreakdown = useMemo(() => {
    if (cases.length === 0) return [];
    const map: Record<string, number> = { 'BKT-1': 0, 'BKT-2': 0, 'BKT-3+': 0, 'OTHER': 0 };
    cases.forEach((c) => {
      const b = c.bkt?.toUpperCase() || 'OTHER';
      if (map[b] !== undefined) map[b]++;
      else map['OTHER']++;
    });
    return Object.entries(map).filter(([_, count]) => count > 0);
  }, [cases]);

  const recentCollections = useMemo(() => {
    return collections.slice(0, 5);
  }, [collections]);

  const handleExecuteDelete = () => {
    if (!confirmDelete) return;
    if (confirmDelete.type === 'company') {
      storage.deleteCasesByCompany(confirmDelete.id);
    } else if (confirmDelete.type === 'collection') {
      storage.deleteCollection(confirmDelete.id);
    } else if (confirmDelete.type === 'all') {
      storage.clearAllEntries();
    }
    setConfirmDelete(null);
    setRefreshKey((k) => k + 1);
  };

  const isWidgetVisible = (id: string) => {
    const w = settings.dashboardWidgets?.find((widget) => widget.id === id);
    return w ? w.visible : true;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-amber-200 bg-amber-100/15 px-2.5 py-0.5 rounded border border-amber-200/40 shadow-xs">
              Agency Master Operations
            </span>
            <span className="text-xs text-slate-400">
              Live DB Sync • {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1 bg-black px-3 py-1.5 rounded-lg inline-block">
            Lion Group Agency — Executive Control Center
          </h1>
          <p className="text-xs text-slate-400">
            Dahod District HQ • Real-time recovery pipeline, field collections, yard inventory &amp; officer hisab
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsBalanceModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 font-bold text-xs shadow-md shadow-amber-500/10 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Set Opening Balance and Closing Balance for today"
          >
            <Wallet className="w-4 h-4 text-amber-400" />
            <span>Opening &amp; Closing Balance</span>
          </button>

          <button
            onClick={() => onNavigate('collection')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 hover:brightness-110 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-200/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Collection
          </button>

          <button
            onClick={() => onNavigate('same-day-release')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-yellow-100 via-amber-200 to-yellow-200 hover:brightness-110 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-200/20 transition-all"
          >
            <Zap className="w-4 h-4" />
            Same-Day Release
          </button>

          <button
            onClick={() => onNavigate('excel-import')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Import Excel
          </button>
        </div>
      </div>

      {/* Gemini AI Intelligence & Studio Quick Launch Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Voice Copilot */}
        <div
          onClick={() => onNavigate('voice-copilot')}
          className="bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/40 hover:border-amber-400 rounded-2xl p-4 cursor-pointer transition-all hover:shadow-xl hover:shadow-amber-500/10 group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40 flex items-center gap-1">
                <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
                Live API
              </span>
              <span className="text-[11px] font-mono text-slate-400">gemini-3.8-live</span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
              <span>Live Voice Copilot</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </h3>
            <p className="text-xs text-slate-300 mt-1 line-clamp-2">
              Real-time conversational voice assistance for Dahod recovery officers, repossession guidance &amp; de-escalation.
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-amber-400 font-semibold">
            <span>Start Voice Call</span>
            <span>&rarr;</span>
          </div>
        </div>

        {/* Card 2: Search Grounding */}
        <div
          onClick={() => onNavigate('search-grounding')}
          className="bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/40 hover:border-blue-400 rounded-2xl p-4 cursor-pointer transition-all hover:shadow-xl hover:shadow-blue-500/10 group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded border border-blue-500/40 flex items-center gap-1">
                <Globe className="w-3 h-3 text-blue-400" />
                Google Search
              </span>
              <span className="text-[11px] font-mono text-slate-400">gemini-3.5-flash</span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors flex items-center gap-1.5">
              <span>Search Grounding Hub</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </h3>
            <p className="text-xs text-slate-300 mt-1 line-clamp-2">
              Up-to-date RBI recovery circulars, SARFAESI legal precedents, Gujarat RTO standards &amp; commercial vehicle valuations.
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-blue-400 font-semibold">
            <span>Query Live Regulations</span>
            <span>&rarr;</span>
          </div>
        </div>
      </div>

      {/* Daily Safe Cash & Balance Overview (Opening & Closing Balance Bar) */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                  Daily Cash Safe &amp; Balance Reconciliation (Dahod Branch)
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono border ${
                    metrics.isHisabLocked
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}
                >
                  {metrics.isHisabLocked ? 'Day Locked' : 'Safe Open'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Real-time cash in hand, field recovery inflows, fuel/yard expenses, and safe closing tally
              </p>
            </div>
          </div>

          {/* Balance Metrics Strip */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-5 bg-slate-950/80 border border-slate-800 rounded-xl p-3">
            {/* Opening Balance */}
            <div
              onClick={() => setIsBalanceModalOpen(true)}
              className="cursor-pointer group hover:bg-slate-900/60 p-1.5 rounded-lg transition-colors"
              title="Click to adjust Opening Balance"
            >
              <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                <span>Opening Balance</span>
                <span className="text-amber-400 group-hover:underline text-[9px]">(Set)</span>
              </div>
              <div className="text-lg sm:text-xl font-black text-amber-400 font-mono mt-0.5">
                ₹{metrics.openingBalance.toLocaleString()}
              </div>
            </div>

            <div className="h-8 w-px bg-slate-800 hidden sm:block" />

            {/* Inflows */}
            <div
              onClick={() => onNavigate('collection')}
              className="cursor-pointer group hover:bg-slate-900/60 p-1.5 rounded-lg transition-colors"
              title="View today's collections"
            >
              <div className="text-[10px] text-emerald-400 uppercase font-bold flex items-center gap-1">
                <span>Collections (+)</span>
              </div>
              <div className="text-lg sm:text-xl font-black text-emerald-400 font-mono mt-0.5">
                +₹{metrics.todayCollectionAmount.toLocaleString()}
              </div>
            </div>

            <div className="h-8 w-px bg-slate-800 hidden sm:block" />

            {/* Outflows */}
            <div
              onClick={() => onNavigate('daily-hisab')}
              className="cursor-pointer group hover:bg-slate-900/60 p-1.5 rounded-lg transition-colors"
              title="View today's expenses & deductions"
            >
              <div className="text-[10px] text-rose-400 uppercase font-bold flex items-center gap-1">
                <span>Expenses &amp; Deductions (-)</span>
              </div>
              <div className="text-lg sm:text-xl font-black text-rose-400 font-mono mt-0.5">
                -₹{(metrics.todayExpensesAmount + metrics.todayPayoutsAmount + metrics.todayDeductionsAmount).toLocaleString()}
              </div>
            </div>

            <div className="h-8 w-px bg-slate-800 hidden sm:block" />

            {/* Closing Balance */}
            <div
              onClick={() => setIsBalanceModalOpen(true)}
              className="cursor-pointer group hover:bg-slate-900/60 p-1.5 rounded-lg transition-colors"
              title="Click to view Closing Balance & Count Notes"
            >
              <div className="text-[10px] text-amber-300 uppercase font-bold flex items-center gap-1">
                <span>Closing Balance (=)</span>
                <span className="text-amber-400 group-hover:underline text-[9px]">(Tally)</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono mt-0.5">
                ₹{metrics.closingBalance.toLocaleString()}
              </div>
            </div>

            {/* Action button inside strip */}
            <button
              type="button"
              onClick={() => setIsBalanceModalOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md transition-all ml-auto cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Balance Options</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid (All required by User Request) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Opening Balance KPI Card */}
        <div
          onClick={() => setIsBalanceModalOpen(true)}
          className="bg-gradient-to-br from-slate-900 to-amber-950/20 border-2 border-amber-500/40 hover:border-amber-400 rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg group"
        >
          <div className="flex items-center justify-between text-amber-400 text-xs mb-2">
            <span className="font-bold uppercase tracking-wider">Opening Balance</span>
            <Wallet className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            ₹{metrics.openingBalance.toLocaleString()}
          </div>
          <div className="flex items-center justify-between mt-2 text-[11px]">
            <span className="text-slate-400">Cash in safe at 09:00 AM</span>
            <span className="text-amber-400 font-bold group-hover:underline">&rarr; Edit</span>
          </div>
        </div>

        {/* Closing Balance KPI Card */}
        <div
          onClick={() => setIsBalanceModalOpen(true)}
          className="bg-gradient-to-br from-slate-900 to-amber-950/30 border-2 border-amber-500/60 hover:border-amber-400 rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg group"
        >
          <div className="flex items-center justify-between text-amber-400 text-xs mb-2">
            <span className="font-bold uppercase tracking-wider">Closing Balance</span>
            <Calculator className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-amber-300 font-mono">
            ₹{metrics.closingBalance.toLocaleString()}
          </div>
          <div className="flex items-center justify-between mt-2 text-[11px]">
            <span className="text-slate-400">Net safe cash tallied</span>
            <span className="text-amber-400 font-bold group-hover:underline">&rarr; Tally</span>
          </div>
        </div>
        {/* Total Cases */}
        {isWidgetVisible('total_cases') && (
          <div
            onClick={() => onNavigate('cases')}
            className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg group"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider">Total Cases</span>
              <FolderKanban className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {metrics.totalCases.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
              <span className="text-emerald-400 font-semibold">{metrics.paidCases} Paid</span>
              <span>•</span>
              <span className="text-amber-400 font-semibold">{metrics.unpaidCases} Unpaid</span>
            </div>
          </div>
        )}

        {/* Total POS */}
        {isWidgetVisible('total_pos') && (
          <div
            onClick={() => onNavigate('cases')}
            className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg group"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider">Total POS</span>
              <CircleDollarSign className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-white font-mono">
              ₹{(metrics.totalPos / 100000).toFixed(2)}L
            </div>
            <div className="text-[11px] text-slate-400 mt-2">
              Principal Outstanding: ₹{metrics.totalPos.toLocaleString()}
            </div>
          </div>
        )}

        {/* Total TOS */}
        {isWidgetVisible('total_tos') && (
          <div
            onClick={() => onNavigate('cases')}
            className="bg-slate-900 border border-slate-800 hover:border-red-500/50 rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg group"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider">Total TOS</span>
              <TrendingUp className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-rose-400 font-mono">
              ₹{(metrics.totalTos / 100000).toFixed(2)}L
            </div>
            <div className="text-[11px] text-slate-400 mt-2">
              Total Overdue / Outstanding Amount
            </div>
          </div>
        )}

        {/* Today's Collection */}
        {isWidgetVisible('today_collection') && (
          <div
            onClick={() => onNavigate('collection')}
            className="bg-gradient-to-br from-slate-900 to-emerald-950/20 border border-emerald-900/40 hover:border-emerald-500/50 rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg group"
          >
            <div className="flex items-center justify-between text-emerald-400 text-xs mb-2">
              <span className="font-bold uppercase tracking-wider">Today's Collection</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                {metrics.todayCollectionCount} Txns
              </span>
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              ₹{metrics.todayCollectionAmount.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-500/80 mt-2">
              Daily Hisab auto-credited
            </div>
          </div>
        )}

        {/* Today's Repo */}
        {isWidgetVisible('today_repo') && (
          <div
            onClick={() => onNavigate('repo-release')}
            className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg group"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider">Today's Repo</span>
              <Truck className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {metrics.todayRepoCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-2">
              Vehicles repossessed today
            </div>
          </div>
        )}

        {/* Today's Release */}
        {isWidgetVisible('today_release') && (
          <div
            onClick={() => onNavigate('repo-release')}
            className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg group"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider">Today's Release</span>
              <CarFront className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {metrics.todayReleaseCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-2">
              Authorized customer releases
            </div>
          </div>
        )}

        {/* Same-Day Release */}
        {isWidgetVisible('same_day_release') && (
          <div
            onClick={() => onNavigate('same-day-release')}
            className="bg-gradient-to-br from-slate-900 to-amber-950/30 border border-amber-500/40 hover:border-amber-400 rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg group"
          >
            <div className="flex items-center justify-between text-amber-400 text-xs mb-2">
              <span className="font-bold uppercase tracking-wider">Same-Day Release</span>
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400/20 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono">
              {metrics.sameDayReleaseCount}
            </div>
            <div className="text-[11px] text-amber-300/80 mt-2">
              1-Step atomic repossession &amp; release
            </div>
          </div>
        )}
      </div>

      {/* Middle Section: Breakdown by Finance Company & Bucket */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Finance Company Distribution */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                Finance Companies Portfolio (Dahod Region)
              </h2>
              <p className="text-xs text-slate-400">Total active files &amp; overdue exposure</p>
            </div>
            <div className="flex items-center gap-2">
              {companyBreakdown.length > 0 && (
                <button
                  onClick={() =>
                    setConfirmDelete({
                      type: 'all',
                      id: 'all',
                      title: 'Delete All Case & Portfolio Entries?',
                      message: 'Are you sure you want to permanently clear all active cases and portfolio entries from the system?',
                    })
                  }
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 px-2.5 py-1 rounded bg-rose-950/40 border border-rose-800/60 hover:bg-rose-900/50 transition-colors"
                  title="Delete All Entries"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Entries</span>
                </button>
              )}
              <button
                onClick={() => onNavigate('finance-companies')}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
              >
                <span>Manage Portfolios</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {companyBreakdown.length === 0 ? (
              <div className="text-xs text-slate-400 p-8 text-center border border-dashed border-slate-800 rounded-xl">
                <p className="font-semibold text-slate-300 mb-1">No active portfolio entries.</p>
                <p className="text-[11px] text-slate-400">All demo entries cleared. Import new files or add cases to get started.</p>
              </div>
            ) : (
              companyBreakdown.map((co) => {
                const pct = metrics.totalTos > 0 ? (co.tos / metrics.totalTos) * 100 : 0;
                return (
                  <div key={co.name} className="p-3 bg-slate-800/40 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-slate-200">{co.name}</span>
                      <div className="flex items-center gap-2.5">
                        <span className="text-slate-400 font-mono">{co.count} Cases</span>
                        <span className="font-mono font-bold text-amber-300">
                          ₹{co.tos.toLocaleString()}
                        </span>
                        <button
                          onClick={() =>
                            setConfirmDelete({
                              type: 'company',
                              id: co.name,
                              title: `Delete all entries for ${co.name}?`,
                              message: `This will permanently delete all ${co.count} cases associated with ${co.name}.`,
                            })
                          }
                          title={`Delete all entries for ${co.name}`}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-rose-300 border border-rose-800/60 text-[11px] font-semibold transition-colors ml-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete Entry</span>
                        </button>
                      </div>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full"
                        style={{ width: `${Math.max(5, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Delinquency Bucket Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Delinquency Buckets (DPD)
              </h2>
              {bucketBreakdown.length > 0 && (
                <button
                  onClick={() =>
                    setConfirmDelete({
                      type: 'all',
                      id: 'all',
                      title: 'Delete All Delinquency Bucket Entries?',
                      message: 'This will remove all bucket case records from the system.',
                    })
                  }
                  className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium px-2 py-0.5 rounded bg-rose-950/30 border border-rose-800/40"
                  title="Clear all bucket entries"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete All</span>
                </button>
              )}
            </div>
            <p className="text-xs text-slate-400 mb-4">Case count by recovery urgency</p>

            <div className="space-y-3">
              {bucketBreakdown.length === 0 ? (
                <div className="text-xs text-slate-400 p-8 text-center border border-dashed border-slate-800 rounded-xl">
                  <p className="font-semibold text-slate-300 mb-1">No delinquency entries.</p>
                  <p className="text-[11px] text-slate-400">All cases resolved or cleared.</p>
                </div>
              ) : (
                bucketBreakdown.map(([bkt, count]) => {
                  let badgeColor = 'text-blue-400 bg-blue-500/10 border-blue-500/30';
                  if (bkt === 'BKT-2') badgeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
                  if (bkt === 'BKT-3+') badgeColor = 'text-rose-400 bg-rose-500/10 border-rose-500/30';

                  return (
                    <div
                      key={bkt}
                      className="flex items-center justify-between p-2.5 bg-slate-800/40 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
                    >
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${badgeColor}`}>
                        {bkt}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white font-mono">
                          {count} Cases
                        </span>
                        <button
                          onClick={() =>
                            setConfirmDelete({
                              type: 'all',
                              id: bkt,
                              title: `Delete all ${bkt} entries?`,
                              message: `This will remove all case entries categorized under ${bkt}.`,
                            })
                          }
                          title={`Delete all ${bkt} entries`}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/50 text-[10px] font-semibold transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete Entry</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Pending Resolution:</span>
            <strong className="text-amber-400">{metrics.pendingCases} Cases</strong>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Collections Stream */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Latest Field Collections &amp; Money Receipts
            </h2>
            <p className="text-xs text-slate-400">Instantly synced with agency Daily Hisab</p>
          </div>
          <button
            onClick={() => onNavigate('collection')}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
          >
            View All ({collections.length})
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Receipt No</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Customer Name</th>
                <th className="py-2.5 px-3">Finance Co</th>
                <th className="py-2.5 px-3">Vehicle No</th>
                <th className="py-2.5 px-3">Officer</th>
                <th className="py-2.5 px-3">Mode</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3 text-center text-rose-400 font-bold uppercase tracking-wider text-[10px]">
                  Delete Entry
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentCollections.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-6 text-center text-slate-400 text-xs">
                    No collection records added yet. Click "Add Collection" to record money receipt.
                  </td>
                </tr>
              ) : (
                recentCollections.map((col) => (
                  <tr key={col.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-semibold text-amber-400">
                      {col.receiptNumber}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">{col.date}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-200">{col.customerName}</td>
                    <td className="py-2.5 px-3 text-slate-300">{col.financeCompanyName}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{col.vehicleNumber}</td>
                    <td className="py-2.5 px-3 text-slate-400">{col.officerName || 'Direct'}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                        {col.paymentMode}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                      ₹{col.collectionAmount.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() =>
                          setConfirmDelete({
                            type: 'collection',
                            id: col.id,
                            title: `Delete Collection ${col.receiptNumber}?`,
                            message: `Are you sure you want to permanently delete receipt ${col.receiptNumber} for ₹${col.collectionAmount.toLocaleString()}?`,
                          })
                        }
                        title="Delete collection entry"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-rose-300 border border-rose-800/60 text-[11px] font-semibold transition-colors"
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

      {/* Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">{confirmDelete.title}</h3>
            </div>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              {confirmDelete.message} This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/20 transition-colors"
              >
                Delete Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Opening & Closing Balance Configuration Modal */}
      <OpeningClosingBalanceModal
        isOpen={isBalanceModalOpen}
        onClose={() => setIsBalanceModalOpen(false)}
        onSuccess={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
};
