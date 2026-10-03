import React, { useState, useMemo } from 'react';
import {
  Phone,
  MapPin,
  Car,
  Search,
  CheckCircle,
  Plus,
  Receipt,
  Clock,
  Calendar,
  User as UserIcon,
  ShieldAlert,
  ArrowRight,
  Filter,
  CheckCircle2,
  X,
  Save,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { storage } from '../services/storage';
import { CaseRecord, CollectionRecord, OfficerRecord } from '../types';
import { ReceiptPrintModal } from '../components/ReceiptPrintModal';

interface OfficerMobileDashboardProps {
  onBackToAdmin?: () => void;
}

export const OfficerMobileDashboard: React.FC<OfficerMobileDashboardProps> = ({
  onBackToAdmin,
}) => {
  const currentUser = storage.getCurrentUser();
  const allOfficers = useMemo(() => storage.getOfficers(), []);

  // Determine current active officer (either linked to user, or fallback to first officer for demonstration)
  const currentOfficer: OfficerRecord = useMemo(() => {
    if (currentUser?.officerId) {
      const match = allOfficers.find((o) => o.id === currentUser.officerId);
      if (match) return match;
    }
    return allOfficers[0] || {
      id: 'off-1',
      name: 'Rajesh Parmar',
      employeeId: 'LGA-OFF-01',
      mobile: '9898012345',
      address: 'Ganesh Nagar, Dahod',
      joiningDate: '2025-03-01',
      designation: 'Field Collection Officer',
      salary: 22000,
      target: 250000,
      assignedFinanceCompanyIds: ['fc-tvs', 'fc-hero'],
      status: 'ACTIVE',
      createdAt: '2026-01-01',
    };
  }, [currentUser, allOfficers]);

  const allCases = storage.getCases();
  const allCollections = storage.getCollections();

  // Filter cases assigned to this officer (or all if admin viewing preview)
  const assignedCases = useMemo(() => {
    if (currentUser?.role === 'SUPER ADMIN' || currentUser?.role === 'ADMIN') {
      return allCases;
    }
    return allCases.filter(
      (c) =>
        c.assignedOfficerId === currentOfficer.id ||
        c.assignedOfficerName === currentOfficer.name
    );
  }, [allCases, currentOfficer, currentUser]);

  const [activeTab, setActiveTab] = useState<'cases' | 'visits' | 'history'>('cases');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBucket, setFilterBucket] = useState('ALL');

  // Modal States
  const [selectedCase, setSelectedCase] = useState<CaseRecord | null>(null);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [recentReceipt, setRecentReceipt] = useState<CollectionRecord | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  // Visit Form
  const [visitForm, setVisitForm] = useState({
    visitType: 'Home Visit',
    status: 'Promise to Pay',
    ptpDate: new Date().toISOString().split('T')[0],
    ptpAmount: 3000,
    remarks: 'Customer promised payment at Dahod office',
  });

  // Payment Form
  const [collectForm, setCollectForm] = useState({
    amount: 3000,
    paymentMode: 'Cash',
    collectionType: 'EMI',
    remarks: 'Field recovery collection',
  });

  const todayStr = new Date().toISOString().split('T')[0];

  // Officer Today's Collections
  const todayOfficerCollections = useMemo(() => {
    return allCollections.filter(
      (c) =>
        (c.officerId === currentOfficer.id || c.officerName === currentOfficer.name) &&
        c.date === todayStr
    );
  }, [allCollections, currentOfficer, todayStr]);

  const todayCollectedAmount = todayOfficerCollections.reduce(
    (a, b) => a + b.collectionAmount,
    0
  );

  const dailyTarget = Math.round((currentOfficer.target || 250000) / 25); // ~25 working days
  const progressPercent = Math.min(
    100,
    Math.round((todayCollectedAmount / (dailyTarget || 1)) * 100)
  );

  const filteredCases = useMemo(() => {
    return assignedCases.filter((c) => {
      const q = searchTerm.toLowerCase();
      const matchQ =
        !q ||
        c.customerName?.toLowerCase().includes(q) ||
        c.customerMobile?.includes(q) ||
        c.loanAgreementNumber?.toLowerCase().includes(q) ||
        c.registrationNumber?.toLowerCase().includes(q);

      const matchBkt = filterBucket === 'ALL' || c.bkt === filterBucket;
      return matchQ && matchBkt;
    });
  }, [assignedCases, searchTerm, filterBucket]);

  const handleOpenVisit = (c: CaseRecord) => {
    setSelectedCase(c);
    setVisitForm({
      visitType: 'Home Visit',
      status: 'Promise to Pay',
      ptpDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      ptpAmount: c.emiAmount || 2500,
      remarks: 'Visited residence in Dahod district',
    });
    setIsVisitModalOpen(true);
  };

  const handleSaveVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;

    storage.addVisit({
      caseId: selectedCase.id,
      officerId: currentOfficer.id,
      officerName: currentOfficer.name,
      date: todayStr,
      time: new Date().toLocaleTimeString(),
      customerContacted: true,
      visitType: visitForm.visitType,
      status: visitForm.status,
      ptpDate: visitForm.status === 'Promise to Pay' ? visitForm.ptpDate : undefined,
      ptpAmount: visitForm.status === 'Promise to Pay' ? visitForm.ptpAmount : undefined,
      remarks: visitForm.remarks,
      location: 'Dahod District Field Route',
    });

    setIsVisitModalOpen(false);
    setToastMessage('Visit report logged and case timeline updated!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleOpenCollect = (c: CaseRecord) => {
    setSelectedCase(c);
    setCollectForm({
      amount: c.emiAmount || c.tos || 3000,
      paymentMode: 'Cash',
      collectionType: 'EMI',
      remarks: `Field collection from ${c.customerName}`,
    });
    setIsCollectModalOpen(true);
  };

  const handleSaveCollect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;

    const res = storage.addCollection({
      date: todayStr,
      caseId: selectedCase.id,
      loanAgreementNumber: selectedCase.loanAgreementNumber,
      customerName: selectedCase.customerName,
      vehicleNumber: selectedCase.registrationNumber || '',
      financeCompanyId: selectedCase.financeCompanyId,
      financeCompanyName: selectedCase.financeCompanyName,
      officerId: currentOfficer.id,
      officerName: currentOfficer.name,
      collectionAmount: Number(collectForm.amount) || 0,
      paymentMode: collectForm.paymentMode,
      collectionType: collectForm.collectionType,
      remarks: collectForm.remarks,
    });

    setIsCollectModalOpen(false);
    setRecentReceipt(res.collection);
  };

  return (
    <div className="max-w-md mx-auto space-y-4 pb-20">
      {toastMessage && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage('')} className="p-1 text-emerald-400 hover:text-white">✕</button>
        </div>
      )}
      {/* Mobile Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-sm">
              🦁
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{currentOfficer.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-amber-500 text-slate-950 font-bold">
                  {currentOfficer.employeeId}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{currentOfficer.designation}</p>
            </div>
          </div>

          {onBackToAdmin && (
            <button
              onClick={onBackToAdmin}
              className="text-[11px] px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
            >
              Exit Mobile
            </button>
          )}
        </div>

        {/* Today's Target Card */}
        <div className="mt-3 p-3 bg-slate-850 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Today's Target Progress</span>
            <span className="font-mono font-bold text-emerald-400">
              ₹{todayCollectedAmount.toLocaleString()} / ₹{dailyTarget.toLocaleString()}
            </span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-slate-500">
            <span>{todayOfficerCollections.length} collections logged today</span>
            <span className="text-amber-400 font-bold">{progressPercent}% Achieved</span>
          </div>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex items-center gap-1 bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('cases')}
          className={`flex-1 py-1.5 rounded-lg font-bold text-center transition-all ${
            activeTab === 'cases'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          My Cases ({assignedCases.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-1.5 rounded-lg font-bold text-center transition-all ${
            activeTab === 'history'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Today's Collections ({todayOfficerCollections.length})
        </button>
      </div>

      {/* Tab: Assigned Cases */}
      {activeTab === 'cases' && (
        <div className="space-y-3">
          {/* Quick Search & Bucket Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search name, phone, LAN, vehicle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
              {['ALL', 'BKT-1', 'BKT-2', 'BKT-3+'].map((b) => (
                <button
                  key={b}
                  onClick={() => setFilterBucket(b)}
                  className={`px-3 py-1 rounded-lg font-mono text-[11px] font-bold shrink-0 ${
                    filterBucket === b
                      ? 'bg-slate-700 text-white border border-slate-600'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Cases Cards List */}
          <div className="space-y-3">
            {filteredCases.length === 0 ? (
              <div className="bg-slate-900 p-8 rounded-2xl text-center text-xs text-slate-500 border border-slate-800">
                No cases matching your query.
              </div>
            ) : (
              filteredCases.map((c) => (
                <div
                  key={c.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
                          {c.financeCompanyName}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                          {c.bkt}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white mt-1">{c.customerName}</h3>
                      <p className="text-[10px] font-mono text-slate-400">{c.loanAgreementNumber}</p>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        c.status === 'PAID'
                          ? 'bg-emerald-950 text-emerald-400'
                          : 'bg-slate-800 text-amber-400'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>

                  {/* Vehicle & Address Details */}
                  <div className="p-2.5 bg-slate-850 rounded-xl space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px] flex items-center gap-1">
                        <Car className="w-3.5 h-3.5 text-cyan-400" />
                        Vehicle:
                      </span>
                      <strong className="font-mono text-white">{c.registrationNumber || 'Pending Reg'}</strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Make/Model:</span>
                      <span className="text-slate-200">{c.assetMake} {c.model}</span>
                    </div>

                    <div className="flex items-start justify-between pt-1 border-t border-slate-800 text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1 shrink-0 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        Address:
                      </span>
                      <span className="text-right text-slate-300 line-clamp-2 max-w-[220px]">
                        {c.customerAddress}, {c.city}
                      </span>
                    </div>
                  </div>

                  {/* Financial Balance Row */}
                  <div className="flex items-center justify-between text-xs px-1">
                    <div>
                      <span className="text-slate-400 text-[10px] block">TOTAL OVERDUE (TOS)</span>
                      <strong className="text-base font-black text-amber-400 font-mono">
                        ₹{c.tos?.toLocaleString()}
                      </strong>
                    </div>

                    <div className="text-right">
                      <span className="text-slate-400 text-[10px] block">MONTHLY EMI</span>
                      <strong className="text-sm font-bold text-slate-200 font-mono">
                        ₹{c.emiAmount?.toLocaleString()}
                      </strong>
                    </div>
                  </div>

                  {/* Quick Action Buttons for Field Officer */}
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/80">
                    <a
                      href={`tel:${c.customerMobile}`}
                      className="py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1 shadow-xs"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call</span>
                    </a>

                    <button
                      onClick={() => handleOpenVisit(c)}
                      className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-1"
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Visit</span>
                    </button>

                    <button
                      onClick={() => handleOpenCollect(c)}
                      className="py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Collect</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab: Today's Collection History */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {todayOfficerCollections.length === 0 ? (
            <div className="bg-slate-900 p-8 rounded-2xl text-center text-xs text-slate-500 border border-slate-800">
              No collections recorded yet today. Click "Collect" on any case card to log payment.
            </div>
          ) : (
            todayOfficerCollections.map((col) => (
              <div
                key={col.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-amber-400 font-bold text-xs">
                      {col.receiptNumber}
                    </span>
                    <h4 className="font-bold text-white text-xs mt-0.5">{col.customerName}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {col.loanAgreementNumber} • {col.vehicleNumber}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-black text-emerald-400 text-base">
                      ₹{col.collectionAmount?.toLocaleString()}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 block mt-0.5">
                      {col.paymentMode}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">{col.remarks}</span>
                  <button
                    onClick={() => setRecentReceipt(col)}
                    className="text-amber-400 font-bold flex items-center gap-1 text-[11px] hover:underline"
                  >
                    <Printer className="w-3 h-3" />
                    Print Receipt
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Record Visit Modal */}
      {isVisitModalOpen && selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in duration-150">
            <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white">Log Field Visit / Follow-up</h3>
                <p className="text-[10px] text-slate-400">{selectedCase.customerName}</p>
              </div>
              <button
                onClick={() => setIsVisitModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveVisit} className="p-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Visit Type</label>
                <select
                  value={visitForm.visitType}
                  onChange={(e) => setVisitForm({ ...visitForm, visitType: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                >
                  <option value="Home Visit">Home Visit</option>
                  <option value="Office Visit">Office Visit</option>
                  <option value="Guarantor Visit">Guarantor Visit</option>
                  <option value="Yard Visit">Yard Visit</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Customer Response / Status</label>
                <select
                  value={visitForm.status}
                  onChange={(e) => setVisitForm({ ...visitForm, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                >
                  <option value="Promise to Pay">Promise to Pay (PTP)</option>
                  <option value="Refused to Pay">Refused to Pay</option>
                  <option value="Not Available">Not Available / Door Locked</option>
                  <option value="Vehicle Untraceable">Vehicle Untraceable</option>
                  <option value="Repo Recommended">Repo Recommended</option>
                </select>
              </div>

              {visitForm.status === 'Promise to Pay' && (
                <div className="grid grid-cols-2 gap-2 bg-slate-850 p-2.5 rounded-lg border border-slate-800">
                  <div>
                    <label className="font-semibold text-amber-400 block mb-1">PTP Date</label>
                    <input
                      type="date"
                      value={visitForm.ptpDate}
                      onChange={(e) => setVisitForm({ ...visitForm, ptpDate: e.target.value })}
                      className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-amber-400 block mb-1">Promised (₹)</label>
                    <input
                      type="number"
                      value={visitForm.ptpAmount}
                      onChange={(e) => setVisitForm({ ...visitForm, ptpAmount: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Field Remarks / Observations</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Spoke with customer's brother. Vehicle parked at farm..."
                  value={visitForm.remarks}
                  onChange={(e) => setVisitForm({ ...visitForm, remarks: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md mt-2"
              >
                Log Visit Report
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Quick Collect Modal */}
      {isCollectModalOpen && selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in duration-150">
            <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white">Record Instant Field Collection</h3>
                <p className="text-[10px] text-slate-400">{selectedCase.customerName}</p>
              </div>
              <button
                onClick={() => setIsCollectModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCollect} className="p-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-emerald-400 block mb-1">
                  Amount Collected (₹) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={collectForm.amount}
                  onChange={(e) => setCollectForm({ ...collectForm, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-emerald-500/60 text-lg font-mono font-bold text-emerald-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Payment Mode</label>
                  <select
                    value={collectForm.paymentMode}
                    onChange={(e) => setCollectForm({ ...collectForm, paymentMode: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Type</label>
                  <select
                    value={collectForm.collectionType}
                    onChange={(e) => setCollectForm({ ...collectForm, collectionType: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                  >
                    <option value="EMI">EMI</option>
                    <option value="Part Payment">Part Payment</option>
                    <option value="Foreclosure">Foreclosure</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Receipt Remarks</label>
                <input
                  type="text"
                  value={collectForm.remarks}
                  onChange={(e) => setCollectForm({ ...collectForm, remarks: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs uppercase shadow-md mt-2"
              >
                Confirm Payment &amp; Issue Receipt
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Generated Receipt Print Modal */}
      {recentReceipt && (
        <ReceiptPrintModal
          receipt={recentReceipt}
          onClose={() => setRecentReceipt(null)}
        />
      )}
    </div>
  );
};
