import React from 'react';
import {
  ShieldAlert,
  Search,
  History,
  Smartphone,
  LogOut,
  User as UserIcon,
  Bell,
  Menu,
  FileSpreadsheet,
  Radio,
  Globe,
} from 'lucide-react';
import { User } from '../types';
import { LionLogo } from './LionLogo';

interface NavbarProps {
  currentUser: User | null;
  onLogout: () => void;
  onOpenSearch: () => void;
  onOpenAuditLogs: () => void;
  onToggleSidebar: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileOfficerMode: boolean;
  setIsMobileOfficerMode: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
  onOpenSearch,
  onOpenAuditLogs,
  onToggleSidebar,
  activeTab,
  setActiveTab,
  isMobileOfficerMode,
  setIsMobileOfficerMode,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden focus:outline-none"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => {
              setIsMobileOfficerMode(false);
              setActiveTab('dashboard');
            }}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-950/90 border border-amber-500/40 p-0.5 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 group-hover:border-amber-400 transition-all overflow-hidden">
              <LionLogo className="w-full h-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-wider uppercase bg-gradient-to-r from-amber-100 via-white to-amber-200 bg-clip-text text-transparent">
                  LION GROUP AGENCY
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-amber-100/15 text-amber-200 border border-amber-200/50 px-1.5 py-0.5 rounded shadow-xs">
                  DAHOD
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Recovery &amp; Collection Management</p>
            </div>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 hover:border-slate-600 transition-all text-xs"
          >
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4 text-amber-400" />
              <span>Search customer, vehicle no, loan agreement...</span>
            </span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-slate-900 border border-slate-700 rounded text-slate-400 font-mono">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right: Actions & User Info */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile search button on small screens */}
          <button
            onClick={onOpenSearch}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 md:hidden"
            title="Global Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* AI Voice Copilot Quick Trigger */}
          <button
            onClick={() => {
              setIsMobileOfficerMode(false);
              setActiveTab('voice-copilot');
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              activeTab === 'voice-copilot'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-bold'
                : 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-900/50'
            }`}
            title="Gemini 3.8 Live Voice Copilot"
          >
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="hidden md:inline">Voice Copilot</span>
          </button>

          {/* Search Grounding Quick Trigger */}
          <button
            onClick={() => {
              setIsMobileOfficerMode(false);
              setActiveTab('search-grounding');
            }}
            className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              activeTab === 'search-grounding'
                ? 'bg-blue-600 text-white border-blue-500 shadow-md font-bold'
                : 'bg-blue-950/40 border-blue-500/40 text-blue-300 hover:bg-blue-900/50'
            }`}
            title="Google Search Grounding (gemini-3.5-flash)"
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>Search Grounding</span>
          </button>

          {/* Quick Excel Import link */}
          <button
            onClick={() => {
              setIsMobileOfficerMode(false);
              setActiveTab('excel-import');
            }}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-600/40 text-emerald-300 hover:bg-emerald-900/60 text-xs font-medium transition-colors"
            title="Bulk Excel Import"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden lg:inline">Excel Import</span>
          </button>

          {/* Officer Mobile Dashboard Switcher */}
          <button
            onClick={() => setIsMobileOfficerMode(!isMobileOfficerMode)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isMobileOfficerMode
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-sm'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700'
            }`}
            title="Switch between Admin & Mobile Officer View"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isMobileOfficerMode ? 'Admin View' : 'Officer Mobile View'}
            </span>
          </button>

          {/* Audit Logs button */}
          <button
            onClick={onOpenAuditLogs}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="System Audit Logs"
          >
            <History className="w-4 h-4" />
          </button>

          {/* User Profile & Role */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 font-bold text-xs">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden xl:block text-left">
                <div className="text-xs font-semibold text-slate-200 leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[10px] font-medium text-amber-400 leading-tight">
                  {currentUser.role}
                </div>
              </div>
            </div>
          )}

          {/* Logout button */}
          <button
            onClick={onLogout}
            className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
