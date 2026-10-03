import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Search,
  Filter,
  Download,
  Printer,
  Calendar,
  Building2,
  User as UserIcon,
  FolderKanban,
  Receipt,
  Truck,
  CarFront,
  Zap,
  BookOpenCheck,
  CircleDollarSign,
  TrendingUp,
} from 'lucide-react';
import { storage } from '../services/storage';
import { ExcelService } from '../services/excelService';

export const ReportsModule: React.FC = () => {
  const [reportType, setReportType] = useState<string>('case-report');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompany, setFilterCompany] = useState('ALL');
  const [filterOfficer, setFilterOfficer] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const companies = useMemo(() => storage.getFinanceCompanies(), []);
  const officers = useMemo(() => storage.getOfficers(), []);
  const cases = useMemo(() => storage.getCases(), []);
  const collections = useMemo(() => storage.getCollections(), []);
  const dailyHisab = useMemo(() => storage.getDailyHisabList(), []);
  const attendance = useMemo(() => storage.getAttendance(), []);
  const salaries = useMemo(() => storage.getSalaries(), []);
  const payouts = useMemo(() => storage.getPayouts(), []);
  const yards = useMemo(() => storage.getVehicleYards(), []);
  const releases = useMemo(() => storage.getRepoReleases(), []);

  const reportList = [
    { id: 'case-report', name: 'Case Report' },
    { id: 'collection-report', name: 'Collection Report' },
    { id: 'daily-collection', name: 'Daily Collection' },
    { id: 'finance-co-report', name: 'Finance Company Report' },
    { id: 'officer-performance', name: 'Officer Performance' },
    { id: 'attendance-report', name: 'Attendance Report' },
    { id: 'salary-report', name: 'Salary Report' },
    { id: 'payout-report', name: 'Payout Report' },
    { id: 'repo-report', name: 'Repo Report' },
    { id: 'sameday-release-report', name: 'Same-Day Release Report' },
    { id: 'yard-report', name: 'Vehicle Yard Report' },
    { id: 'daily-hisab-report', name: 'Daily Hisab Report' },
    { id: 'outstanding-pos-report', name: 'Outstanding / POS Report' },
  ];

  // Dynamic data generation based on selected report
  const reportData = useMemo(() => {
    const q = searchTerm.toLowerCase();

    switch (reportType) {
      case 'case-report':
        return cases.filter((c) => {
          const matchQ =
            !q ||
            c.customerName?.toLowerCase().includes(q) ||
            c.loanAgreementNumber?.toLowerCase().includes(q) ||
            c.registrationNumber?.toLowerCase().includes(q);
          const matchCo = filterCompany === 'ALL' || c.financeCompanyId === filterCompany;
          const matchOff = filterOfficer === 'ALL' || c.assignedOfficerId === filterOfficer;
          const matchSt = filterStatus === 'ALL' || c.status === filterStatus;
          return matchQ && matchCo && matchOff && matchSt;
        });

      case 'collection-report':
      case 'daily-collection':
        return collections.filter((c) => {
          const matchQ =
            !q ||
            c.customerName?.toLowerCase().includes(q) ||
            c.receiptNumber?.toLowerCase().includes(q) ||
            c.loanAgreementNumber?.toLowerCase().includes(q);
          const matchCo = filterCompany === 'ALL' || c.financeCompanyId === filterCompany;
          const matchOff = filterOfficer === 'ALL' || c.officerId === filterOfficer;
          const matchDate =
            (!startDate || c.date >= startDate) && (!endDate || c.date <= endDate);
          return matchQ && matchCo && matchOff && matchDate;
        });

      case 'finance-co-report':
        return companies.map((co) => {
          const coCases = cases.filter((c) => c.financeCompanyId === co.id);
          const coCols = collections.filter((col) => col.financeCompanyId === co.id);
          return {
            'Company Name': co.name,
            'Short Name': co.shortName,
            'Total Cases': coCases.length,
            'Total POS': coCases.reduce((a, b) => a + (Number(b.pos) || 0), 0),
            'Total TOS': coCases.reduce((a, b) => a + (Number(b.tos) || 0), 0),
            'Total Collection': coCols.reduce((a, b) => a + (Number(b.collectionAmount) || 0), 0),
            'Status': co.status,
          };
        });

      case 'officer-performance':
        return officers.map((o) => {
          const oCases = cases.filter((c) => c.assignedOfficerId === o.id);
          const oCols = collections.filter((c) => c.officerId === o.id);
          const collected = oCols.reduce((a, b) => a + b.collectionAmount, 0);
          const target = o.target || 250000;
          const pct = Math.round((collected / target) * 100);
          return {
            'Officer Name': o.name,
            'Employee ID': o.employeeId,
            'Designation': o.designation,
            'Assigned Cases': oCases.length,
            'Target (₹)': target,
            'Collected (₹)': collected,
            'Achievement (%)': `${pct}%`,
            'Receipts Issued': oCols.length,
          };
        });

      case 'attendance-report':
        return attendance.filter((a) => {
          const matchQ = !q || a.officerName?.toLowerCase().includes(q);
          const matchOff = filterOfficer === 'ALL' || a.officerId === filterOfficer;
          const matchDate =
            (!startDate || a.date >= startDate) && (!endDate || a.date <= endDate);
          return matchQ && matchOff && matchDate;
        });

      case 'salary-report':
        return salaries.filter((s) => {
          const matchQ = !q || s.officerName?.toLowerCase().includes(q);
          const matchOff = filterOfficer === 'ALL' || s.officerId === filterOfficer;
          return matchQ && matchOff;
        });

      case 'payout-report':
        return payouts.filter((p) => {
          const matchQ = !q || p.officerName?.toLowerCase().includes(q);
          const matchOff = filterOfficer === 'ALL' || p.officerId === filterOfficer;
          return matchQ && matchOff;
        });

      case 'repo-report':
        return yards.filter((y) => {
          const matchQ =
            !q ||
            y.vehicleNumber?.toLowerCase().includes(q) ||
            y.customerName?.toLowerCase().includes(q);
          const matchCo = filterCompany === 'ALL' || y.financeCompanyId === filterCompany;
          const matchDate =
            (!startDate || y.repoDate >= startDate) && (!endDate || y.repoDate <= endDate);
          return matchQ && matchCo && matchDate;
        });

      case 'sameday-release-report':
        return releases.filter((r) => r.isSameDayRelease);

      case 'yard-report':
        return yards.filter((y) => ['REPO', 'IN YARD'].includes(y.vehicleStatus));

      case 'daily-hisab-report':
        return dailyHisab.filter((h) => {
          const matchDate =
            (!startDate || h.date >= startDate) && (!endDate || h.date <= endDate);
          return matchDate;
        });

      case 'outstanding-pos-report':
        return cases
          .filter((c) => c.status !== 'PAID')
          .sort((a, b) => b.tos - a.tos);

      default:
        return cases;
    }
  }, [
    reportType,
    cases,
    collections,
    companies,
    officers,
    attendance,
    salaries,
    payouts,
    yards,
    releases,
    dailyHisab,
    searchTerm,
    filterCompany,
    filterOfficer,
    filterStatus,
    startDate,
    endDate,
  ]);

  const handleExport = () => {
    ExcelService.exportToExcel(reportData, `Lion_Group_${reportType}`, reportType);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white">Agency Intelligence &amp; 13 Reports</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic analytics engine with date filters, financier/officer segmentation, and instant Excel export
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            Print Report
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/10"
          >
            <Download className="w-4 h-4" />
            Export to Excel
          </button>
        </div>
      </div>

      {/* Report Selector Pills */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap gap-1.5">
        {reportList.map((r) => (
          <button
            key={r.id}
            onClick={() => setReportType(r.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              reportType === r.id
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-850 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {r.name}
          </button>
        ))}
      </div>

      {/* Universal Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search within report..."
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
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.shortName}
              </option>
            ))}
          </select>
        </div>

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

        <div>
          <input
            type="date"
            placeholder="From Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <input
            type="date"
            placeholder="To Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Report Data Table Preview */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            {reportList.find((r) => r.id === reportType)?.name} Data View ({reportData.length} records)
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            Company: Lion Group Agency, Dahod
          </span>
        </div>

        <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
          {reportData.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No matching records found for the selected report filters.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 uppercase text-[10px] sticky top-0 z-10">
                  {Object.keys(reportData[0] || {})
                    .filter((k) => k !== 'customFields' && k !== 'id')
                    .slice(0, 10)
                    .map((header) => (
                      <th key={header} className="py-2.5 px-3 capitalize">
                        {header.replace(/([A-Z])/g, ' $1')}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {reportData.slice(0, 200).map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-800/40">
                    {Object.entries(row)
                      .filter(([k]) => k !== 'customFields' && k !== 'id')
                      .slice(0, 10)
                      .map(([key, val], cIdx) => (
                        <td key={cIdx} className="py-2.5 px-3 text-slate-300">
                          {typeof val === 'number'
                            ? `₹${val.toLocaleString()}`
                            : String(val || '')}
                        </td>
                      ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
