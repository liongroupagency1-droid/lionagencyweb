/**
 * Lion Group Agency - Recovery & Collection Management System
 * Dahod, Gujarat, India
 * Main Application Hub
 */

import React, { useState, useEffect } from 'react';
import { storage } from './services/storage';
import { User, CaseRecord } from './types';

// Components
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { AuditLogModal } from './components/AuditLogModal';

// Pages
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/AdminDashboard';
import { FinanceCompanyMaster } from './pages/FinanceCompanyMaster';
import { CaseManagement } from './pages/CaseManagement';
import { BulkExcelImport } from './pages/BulkExcelImport';
import { CollectionModule } from './pages/CollectionModule';
import { DailyHisabModule } from './pages/DailyHisabModule';
import { OfficerManagement } from './pages/OfficerManagement';
import { AttendanceModule } from './pages/AttendanceModule';
import { SalaryModule } from './pages/SalaryModule';
import { PayoutModule } from './pages/PayoutModule';
import { VehicleYardModule } from './pages/VehicleYardModule';
import { RepoReleaseModule } from './pages/RepoReleaseModule';
import { SameDayReleaseModule } from './pages/SameDayReleaseModule';
import { RepoDailySummary } from './pages/RepoDailySummary';
import { ReportsModule } from './pages/ReportsModule';
import { AdminSettings } from './pages/AdminSettings';
import { CustomFieldBuilder } from './pages/CustomFieldBuilder';
import { UserPermissionsModule } from './pages/UserPermissionsModule';
import { BackupRestoreModule } from './pages/BackupRestoreModule';
import { OfficerMobileDashboard } from './pages/OfficerMobileDashboard';
import { VoiceCopilotModule } from './pages/VoiceCopilotModule';
import { SearchGroundingModule } from './pages/SearchGroundingModule';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => storage.getCurrentUser());
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isMobileOfficerMode, setIsMobileOfficerMode] = useState(false);

  // Keyboard shortcut listener (Ctrl+K or Cmd+K for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsAuditModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    storage.setCurrentUser(null);
    setCurrentUser(null);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'COLLECTION OFFICER' || user.role === 'REPO OFFICER') {
      setIsMobileOfficerMode(true);
    } else {
      setIsMobileOfficerMode(false);
      setActiveTab('dashboard');
    }
  };

  const handleSelectCaseFromSearch = (c: CaseRecord) => {
    setActiveTab('cases');
  };

  // If not logged in, show Login Screen
  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Application Navbar */}
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAuditLogs={() => setIsAuditModalOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileOfficerMode={isMobileOfficerMode}
        setIsMobileOfficerMode={setIsMobileOfficerMode}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* If Mobile Officer Mode is active, render optimized field interface */}
        {isMobileOfficerMode ? (
          <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-lg mx-auto w-full">
            <OfficerMobileDashboard onBackToAdmin={() => setIsMobileOfficerMode(false)} />
          </main>
        ) : (
          <>
            {/* Desktop & Responsive Drawer Sidebar */}
            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
              currentUser={currentUser}
            />

            {/* Main Application Content Body */}
            <main className="flex-1 lg:pl-64 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full custom-scrollbar">
              {activeTab === 'dashboard' && <AdminDashboard onNavigate={setActiveTab} />}
              {activeTab === 'voice-copilot' && <VoiceCopilotModule />}
              {activeTab === 'search-grounding' && <SearchGroundingModule />}
              {activeTab === 'cases' && <CaseManagement />}
              {activeTab === 'finance-companies' && <FinanceCompanyMaster />}
              {activeTab === 'excel-import' && <BulkExcelImport />}
              {activeTab === 'collection' && <CollectionModule />}
              {activeTab === 'daily-hisab' && <DailyHisabModule />}
              {activeTab === 'vehicle-yard' && <VehicleYardModule />}
              {activeTab === 'repo-release' && <RepoReleaseModule />}
              {activeTab === 'same-day-release' && <SameDayReleaseModule />}
              {activeTab === 'repo-summary' && <RepoDailySummary />}
              {activeTab === 'officers' && <OfficerManagement />}
              {activeTab === 'attendance' && <AttendanceModule />}
              {activeTab === 'salary' && <SalaryModule />}
              {activeTab === 'payout' && <PayoutModule />}
              {activeTab === 'reports' && <ReportsModule />}
              {activeTab === 'settings' && <AdminSettings />}
              {activeTab === 'custom-fields' && <CustomFieldBuilder />}
              {activeTab === 'permissions' && <UserPermissionsModule />}
              {activeTab === 'backup-restore' && <BackupRestoreModule />}
              {activeTab === 'audit-logs' && (
                <div className="p-4">
                  <AuditLogModal isOpen={true} onClose={() => setActiveTab('dashboard')} />
                </div>
              )}
            </main>
          </>
        )}
      </div>

      {/* Global Modals */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectCase={handleSelectCaseFromSearch}
      />

      <AuditLogModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />
    </div>
  );
}
