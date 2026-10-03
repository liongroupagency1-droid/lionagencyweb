import React from 'react';
import {
  LayoutDashboard,
  Building2,
  FolderKanban,
  FileSpreadsheet,
  Receipt,
  BookOpenCheck,
  Users,
  CalendarCheck,
  CircleDollarSign,
  HandCoins,
  Truck,
  CarFront,
  Zap,
  BarChart3,
  Sliders,
  ShieldCheck,
  Database,
  History,
  X,
  Sparkles,
  Radio,
  Globe,
} from 'lucide-react';
import { User } from '../types';
import { storage } from '../services/storage';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  moduleKey?: string;
  badge?: string;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  currentUser,
}) => {
  const sections: NavSection[] = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'AI COPILOT & INTELLIGENCE',
      items: [
        {
          id: 'voice-copilot',
          label: 'Live Voice Copilot',
          icon: Radio,
          badge: 'Live 3.8',
          badgeColor: 'bg-emerald-500 text-slate-950 font-bold',
        },
        {
          id: 'search-grounding',
          label: 'Search Grounding Hub',
          icon: Globe,
          badge: 'Google Search',
          badgeColor: 'bg-blue-500 text-white font-bold',
        },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        { id: 'cases', label: 'Case Management', icon: FolderKanban, moduleKey: 'cases' },
        { id: 'finance-companies', label: 'Finance Companies', icon: Building2, moduleKey: 'settings' },
        { id: 'excel-import', label: 'Bulk Excel Import', icon: FileSpreadsheet, moduleKey: 'cases', badge: 'Fast' },
        { id: 'collection', label: 'Daily Collection', icon: Receipt, moduleKey: 'collection' },
        { id: 'daily-hisab', label: 'Daily Hisab', icon: BookOpenCheck, moduleKey: 'hisab' },
      ],
    },
    {
      title: 'REPO & YARD',
      items: [
        { id: 'vehicle-yard', label: 'Vehicles / Yard', icon: Truck, moduleKey: 'yard' },
        { id: 'repo-release', label: 'Repo & Release', icon: CarFront, moduleKey: 'repo' },
        {
          id: 'same-day-release',
          label: 'Same-Day Release',
          icon: Zap,
          moduleKey: 'repo',
          badge: '1-Step',
          badgeColor: 'bg-amber-500 text-slate-950 font-bold',
        },
        { id: 'repo-summary', label: 'Repo Daily Summary', icon: BarChart3, moduleKey: 'repo' },
      ],
    },
    {
      title: 'STAFF & HR',
      items: [
        { id: 'officers', label: 'Officers Directory', icon: Users, moduleKey: 'officers' },
        { id: 'attendance', label: 'Daily Attendance', icon: CalendarCheck, moduleKey: 'attendance' },
        { id: 'salary', label: 'Salary Management', icon: CircleDollarSign, moduleKey: 'salary' },
        { id: 'payout', label: 'Payout Engine', icon: HandCoins, moduleKey: 'payout' },
      ],
    },
    {
      title: 'INSIGHTS & AUDIT',
      items: [
        { id: 'reports', label: 'Reports (13 Types)', icon: BarChart3, moduleKey: 'reports' },
        { id: 'audit-logs', label: 'Audit Trail', icon: History },
      ],
    },
    {
      title: 'SYSTEM SETTINGS',
      items: [
        { id: 'settings', label: 'Business Settings', icon: Sliders, moduleKey: 'settings' },
        { id: 'custom-fields', label: 'Custom Field Builder', icon: Sparkles, moduleKey: 'settings' },
        { id: 'permissions', label: 'User Accounts & Logins', icon: ShieldCheck, moduleKey: 'settings' },
        { id: 'backup-restore', label: 'Backup & Restore', icon: Database, moduleKey: 'settings' },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 lg:hidden">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Navigation Menu
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
          {sections.map((section, sIdx) => {
            // Filter items based on user role permissions if moduleKey is set
            const visibleItems = section.items.filter((item) => {
              if (!item.moduleKey) return true;
              return storage.hasPermission(item.moduleKey, 'view');
            });

            if (visibleItems.length === 0) return null;

            return (
              <div key={sIdx}>
                <div className="px-3 mb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {section.title}
                </div>
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          onClose();
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 text-slate-950 font-bold shadow-md shadow-amber-200/20'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              isActive ? 'text-slate-950' : 'text-slate-400'
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>

                        {item.badge && (
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase tracking-tight shrink-0 ${
                              item.badgeColor ||
                              (isActive
                                ? 'bg-slate-950 text-amber-400'
                                : 'bg-slate-800 text-slate-300 border border-slate-700')
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Agency Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60">
          <div className="text-[11px] font-semibold text-slate-300">Lion Group Agency</div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>Dahod, Gujarat</span>
            <span className="text-emerald-400 font-mono">v1.0 Local</span>
          </div>
        </div>
      </aside>
    </>
  );
};
