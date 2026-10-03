import React, { useState, useMemo } from 'react';
import { Search, X, FolderKanban, Phone, Car, Building2, User as UserIcon, ArrowRight } from 'lucide-react';
import { storage } from '../services/storage';
import { CaseRecord } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCase: (caseRecord: CaseRecord) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectCase,
}) => {
  const [query, setQuery] = useState('');

  const cases = useMemo(() => storage.getCases(), [isOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return cases.filter((c) => {
      return (
        c.customerName?.toLowerCase().includes(q) ||
        c.customerMobile?.toLowerCase().includes(q) ||
        c.alternateMobile?.toLowerCase().includes(q) ||
        c.registrationNumber?.toLowerCase().includes(q) ||
        c.loanAgreementNumber?.toLowerCase().includes(q) ||
        c.applicationId?.toLowerCase().includes(q) ||
        c.assignedOfficerName?.toLowerCase().includes(q) ||
        c.financeCompanyName?.toLowerCase().includes(q) ||
        c.model?.toLowerCase().includes(q)
      );
    });
  }, [cases, query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-800 bg-slate-850">
          <Search className="w-5 h-5 text-amber-400 shrink-0 mr-3" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type customer name, mobile, vehicle number (e.g. GJ-20...), loan agreement..."
            className="w-full bg-transparent text-white placeholder-slate-400 text-sm focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded text-slate-400 hover:text-white mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs font-mono bg-slate-800 border border-slate-700 text-slate-400 rounded hover:text-white"
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-800/60 custom-scrollbar">
          {!query ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <p className="font-medium text-slate-300 mb-1">Global Database Search</p>
              <p>Search across 100,000+ cases by customer, phone, agreement no, vehicle number, or officer.</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <p className="text-amber-400 font-semibold mb-1">No matching records found</p>
              <p>Check your spelling or try searching with agreement number or vehicle registration.</p>
            </div>
          ) : (
            results.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  onSelectCase(c);
                  onClose();
                }}
                className="p-3 rounded-lg hover:bg-slate-800/80 cursor-pointer transition-colors group flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm group-hover:text-amber-400 transition-colors">
                      {c.customerName}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-slate-800 border border-slate-700 text-amber-300">
                      {c.financeCompanyName}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {c.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-mono text-slate-300">
                      <FolderKanban className="w-3.5 h-3.5 text-amber-400" />
                      {c.loanAgreementNumber}
                    </span>
                    <span className="flex items-center gap-1 text-slate-300">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      {c.customerMobile}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-slate-300">
                      <Car className="w-3.5 h-3.5 text-cyan-400" />
                      {c.registrationNumber} ({c.assetMake} {c.model})
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center gap-3">
                    <span>
                      TOS: <strong className="text-amber-300">₹{c.tos?.toLocaleString()}</strong>
                    </span>
                    <span>
                      POS: <strong className="text-slate-300">₹{c.pos?.toLocaleString()}</strong>
                    </span>
                    {c.assignedOfficerName && (
                      <span className="flex items-center gap-1">
                        <UserIcon className="w-3 h-3 text-slate-400" />
                        {c.assignedOfficerName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center text-slate-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-all pl-3">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        {results.length > 0 && (
          <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/60 text-[11px] text-slate-400 flex justify-between">
            <span>Found {results.length} matching cases</span>
            <span>Click any record to open full case profile</span>
          </div>
        )}
      </div>
    </div>
  );
};
