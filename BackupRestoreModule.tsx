import React, { useState } from 'react';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  FileCheck,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { storage } from '../services/storage';

export const BackupRestoreModule: React.FC = () => {
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);

  const [pendingRestoreFile, setPendingRestoreFile] = useState<File | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearDemoConfirm, setShowClearDemoConfirm] = useState(false);

  const handleDownloadBackup = () => {
    try {
      const jsonStr = storage.exportDatabaseJson();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Lion_Group_Agency_Dahod_Backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setStatusMessage({
        type: 'success',
        text: 'Backup file downloaded successfully. Keep this file safe on your local drive or USB backup.',
      });
    } catch (e: any) {
      setStatusMessage({
        type: 'error',
        text: `Backup download failed: ${e.message}`,
      });
    }
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    setPendingRestoreFile(e.target.files[0]);
    e.target.value = '';
  };

  const executeRestore = () => {
    if (!pendingRestoreFile) return;
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const res = storage.restoreDatabaseJson(text);
        if (res.success) {
          setStatusMessage({
            type: 'success',
            text: 'Database successfully restored! All cases, collections, hisab and settings have been updated.',
          });
          setPendingRestoreFile(null);
          setTimeout(() => {
            window.location.reload();
          }, 1200);
        } else {
          setStatusMessage({
            type: 'error',
            text: res.message,
          });
        }
      } catch (err: any) {
        setStatusMessage({
          type: 'error',
          text: `Failed to restore: ${err.message}`,
        });
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsText(pendingRestoreFile);
  };

  const handleExecuteResetDefaults = () => {
    setShowResetConfirm(false);
    storage.resetToDefault();
    setStatusMessage({
      type: 'success',
      text: 'Database reset to initial factory presets. Reloading...',
    });
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleExecuteClearDemoData = () => {
    setShowClearDemoConfirm(false);
    storage.clearDemoDataForProduction();
    setStatusMessage({
      type: 'success',
      text: 'All demo cases, collections and yard records cleared! System is now 100% clean for real Lion Group Agency operations.',
    });
    setTimeout(() => {
      window.location.reload();
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white">Database Backup &amp; Disaster Recovery</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Zero-cost local data preservation. Export encrypted JSON snapshots, restore anytime on any Windows PC, or reset to factory defaults.
          </p>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-3 animate-in fade-in duration-150 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
              : 'bg-red-950/60 border-red-800 text-red-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-400" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Operations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Download Backup */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">1. Download Database Backup</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generates a complete, single-file snapshot containing all cases, finance companies, collections, hisabs, yard records, and custom settings.
            </p>
          </div>

          <button
            onClick={handleDownloadBackup}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Download Backup (.json)</span>
          </button>
        </div>

        {/* 2. Restore Backup */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">2. Restore from Backup File</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Restore your entire agency database from a previously downloaded JSON snapshot. Perfect when moving to another PC or restoring after a hardware change.
            </p>
          </div>

          <div>
            <input
              type="file"
              id="restore-file-input"
              accept=".json"
              onChange={handleFileSelected}
              className="hidden"
            />
            {pendingRestoreFile ? (
              <div className="space-y-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <div className="text-[11px] text-amber-300 font-semibold truncate">
                  Selected: {pendingRestoreFile.name}
                </div>
                <div className="text-[10px] text-slate-400">
                  Restoring will overwrite current local database with this file.
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={executeRestore}
                    disabled={isProcessing}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                  >
                    {isProcessing ? 'Restoring...' : 'Confirm Restore'}
                  </button>
                  <button
                    onClick={() => setPendingRestoreFile(null)}
                    className="py-1.5 px-3 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <label
                htmlFor="restore-file-input"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Upload className="w-4 h-4 text-blue-400" />
                <span>Select File to Restore</span>
              </label>
            )}
          </div>
        </div>

        {/* 3. Start Fresh Operations (0 Demo Records) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">3. Clear Demo Data (Fresh Agency)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Clears all dummy cases, dummy collections, and yard records while preserving TVS, HDFC, Hero, Hinduja, Admin login and settings. Ready for real Excel import!
            </p>
          </div>

          {showClearDemoConfirm ? (
            <div className="space-y-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="text-[11px] text-emerald-300 font-semibold">
                Clear all demo data and start fresh?
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleExecuteClearDemoData}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                >
                  Yes, Clear Demo Data
                </button>
                <button
                  onClick={() => setShowClearDemoConfirm(false)}
                  className="py-1.5 px-3 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowClearDemoConfirm(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/80 font-bold text-xs flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Start Fresh Agency Ledger</span>
            </button>
          )}
        </div>

        {/* 4. Factory Reset */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">4. Reset to Factory Presets</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Clears local cache and reloads initial Lion Group Agency presets with demo cases and preloaded portfolios.
            </p>
          </div>

          {showResetConfirm ? (
            <div className="space-y-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30">
              <div className="text-[11px] text-rose-300 font-semibold">
                Reset database to initial factory defaults?
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleExecuteResetDefaults}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="py-1.5 px-3 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-950/40 hover:bg-rose-950 text-rose-300 border border-rose-800/80 font-bold text-xs flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset to Factory Presets</span>
            </button>
          )}
        </div>
      </div>

      {/* Safety & Local PC Architecture Note */}
      <div className="p-5 bg-slate-850 border border-slate-800 rounded-xl space-y-2 text-xs text-slate-400">
        <div className="flex items-center gap-2 text-slate-200 font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Local-First Zero-Cost Architecture</span>
        </div>
        <p>
          This version of the Lion Group Agency Recovery System is architected to run 100% locally on your normal Windows PC without requiring paid servers, paid APIs, or cloud subscription fees. Data is stored directly inside the local persistent runtime and can be backed up to your personal hard drive anytime.
        </p>
      </div>
    </div>
  );
};
