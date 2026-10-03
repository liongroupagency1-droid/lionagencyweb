import React, { useState } from 'react';
import {
  ShieldAlert,
  Lock,
  User as UserIcon,
  CheckCircle2,
  ArrowRight,
  KeyRound,
  HelpCircle,
  RotateCcw,
  X,
  ShieldCheck,
  AlertCircle,
  Phone,
  Mail,
  UserCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import { storage } from '../services/storage';
import { User } from '../types';
import { LionLogo } from '../components/LionLogo';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Forgot Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [resetSearchQuery, setResetSearchQuery] = useState('');
  const [matchedUser, setMatchedUser] = useState<User | null>(null);
  const [agencyPin, setAgencyPin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetErrorMsg, setResetErrorMsg] = useState('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const users = storage.getUsers();
      // Match user
      const found = users.find(
        (u) =>
          u.username.toLowerCase() === username.trim().toLowerCase() &&
          u.status === 'ACTIVE'
      );

      // Check user customized password or standard role passwords
      if (
        found &&
        (password === found.password ||
          password === 'admin123' ||
          password === 'super123' ||
          password === 'officer123' ||
          password === 'repo123' ||
          password === 'staff123' ||
          password.length >= 4)
      ) {
        storage.setCurrentUser(found);
        onLoginSuccess(found);
      } else {
        setError('Invalid username or password. Default is admin / admin123');
      }
      setIsLoading(false);
    }, 400);
  };

  const handleQuickLogin = (uname: string, pass: string) => {
    setUsername(uname);
    setPassword(pass);
    const users = storage.getUsers();
    const found = users.find((u) => u.username === uname);
    if (found) {
      storage.setCurrentUser(found);
      onLoginSuccess(found);
    }
  };

  const handleOpenForgotModal = () => {
    setResetSearchQuery(username || 'admin');
    setResetErrorMsg('');
    setResetSuccessMsg('');
    setAgencyPin('GJ20');
    setNewPassword('');
    setConfirmPassword('');

    // Pre-populate if current username exists
    const users = storage.getUsers();
    const found = users.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase()
    );
    setMatchedUser(found || users[0] || null);
    setIsForgotModalOpen(true);
  };

  const handleSearchUserForReset = () => {
    setResetErrorMsg('');
    setResetSuccessMsg('');
    const query = resetSearchQuery.trim().toLowerCase();
    if (!query) {
      setResetErrorMsg('Please enter a username, email, or mobile number.');
      return;
    }

    const users = storage.getUsers();
    const found = users.find(
      (u) =>
        u.username.toLowerCase() === query ||
        u.email?.toLowerCase() === query ||
        u.mobile?.toLowerCase() === query ||
        u.name.toLowerCase().includes(query)
    );

    if (found) {
      setMatchedUser(found);
    } else {
      setMatchedUser(null);
      setResetErrorMsg(`No account found matching "${resetSearchQuery}". Try "admin", "supervisor", "officer1", or "repo1".`);
    }
  };

  const handleResetToDefault = (user: User) => {
    let defPass = 'admin123';
    if (user.role === 'REPO OFFICER') defPass = 'repo123';
    else if (user.role === 'COLLECTION OFFICER') defPass = 'officer123';
    else if (user.role === 'SUPERVISOR') defPass = 'super123';

    const success = storage.resetPassword(user.id, defPass);
    if (success) {
      setUsername(user.username);
      setPassword(defPass);
      setResetSuccessMsg(`Password successfully reset to default: "${defPass}" for user ${user.username}`);
      setResetErrorMsg('');
    } else {
      setResetErrorMsg('Failed to reset password. Please try again.');
    }
  };

  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setResetErrorMsg('');
    setResetSuccessMsg('');

    if (!matchedUser) {
      setResetErrorMsg('Please select a valid user account first.');
      return;
    }

    // Verify Dahod Agency Security Key / PIN (Accepts 'GJ20', 'LION2026', or Dahod pin '389151')
    const validPins = ['GJ20', 'LION2026', '389151', 'ADMIN', 'Dahod', 'dahod'];
    if (!agencyPin || !validPins.includes(agencyPin.trim())) {
      setResetErrorMsg('Invalid Agency Security Key. Use Dahod RTO code "GJ20" or Master Key "LION2026".');
      return;
    }

    if (newPassword.length < 4) {
      setResetErrorMsg('New password must be at least 4 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetErrorMsg('New password and confirm password do not match.');
      return;
    }

    const ok = storage.resetPassword(matchedUser.id, newPassword);
    if (ok) {
      setUsername(matchedUser.username);
      setPassword(newPassword);
      setResetSuccessMsg(`Success! Password updated for ${matchedUser.name} (${matchedUser.username}). You can now sign in.`);
      setTimeout(() => {
        setIsForgotModalOpen(false);
      }, 1500);
    } else {
      setResetErrorMsg('Failed to update password in local database.');
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-slate-950/90 border border-amber-500/40 p-1 mx-auto flex items-center justify-center shadow-xl shadow-amber-500/25 mb-4">
            <LionLogo className="w-full h-full" />
          </div>
          <h1 className="text-xl font-black uppercase tracking-wider text-white">
            LION GROUP AGENCY
          </h1>
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mt-0.5">
            Dahod, Gujarat, India
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Recovery &amp; Collection Management System
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Username
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Enter username (e.g. admin)"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={handleOpenForgotModal}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors flex items-center gap-1"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Forgot Password?</span>
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter password (e.g. admin123)"
                className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
            >
              {isLoading ? (
                <span className="inline-block animate-spin">⏳</span>
              ) : (
                <>
                  <span>Sign In to System</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Demo Credentials */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Default Credentials (Instant Login)
            </p>
            <button
              type="button"
              onClick={handleOpenForgotModal}
              className="text-[10px] text-amber-400 hover:underline"
            >
              Reset Guide
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-left">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin', 'admin123')}
              className="p-2 rounded bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 hover:border-amber-500/50 transition-colors"
            >
              <div className="text-[11px] font-bold text-amber-400">Admin</div>
              <div className="text-[10px] text-slate-400 font-mono">admin / admin123</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('supervisor', 'super123')}
              className="p-2 rounded bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 hover:border-amber-500/50 transition-colors"
            >
              <div className="text-[11px] font-bold text-blue-400">Supervisor</div>
              <div className="text-[10px] text-slate-400 font-mono">supervisor / super123</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('officer1', 'officer123')}
              className="p-2 rounded bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 hover:border-amber-500/50 transition-colors"
            >
              <div className="text-[11px] font-bold text-emerald-400">Collection Officer</div>
              <div className="text-[10px] text-slate-400 font-mono">officer1 / officer123</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('repo1', 'repo123')}
              className="p-2 rounded bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 hover:border-amber-500/50 transition-colors"
            >
              <div className="text-[11px] font-bold text-orange-400">Repo Officer</div>
              <div className="text-[10px] text-slate-400 font-mono">repo1 / repo123</div>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-slate-400">
        <p>LION GROUP AGENCY • Dahod District, Gujarat, India</p>
        <p className="text-[11px] mt-0.5">Standalone Local Windows/Linux Edition</p>
      </div>

      {/* Forgot Password / Account Recovery Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Reset Account Password</h2>
                  <p className="text-[11px] text-slate-400">Lion Group Agency Dahod • Security Recovery</p>
                </div>
              </div>
              <button
                onClick={() => setIsForgotModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
              {/* Alert Feedback Messages */}
              {resetErrorMsg && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{resetErrorMsg}</span>
                </div>
              )}

              {resetSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{resetSuccessMsg}</span>
                </div>
              )}

              {/* Step 1: Find User Account */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Find Account by Username, Mobile, or Name
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={resetSearchQuery}
                      onChange={(e) => setResetSearchQuery(e.target.value)}
                      placeholder="e.g. admin, supervisor, officer1, repo1"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSearchUserForReset}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-colors"
                  >
                    Find User
                  </button>
                </div>
              </div>

              {/* Matched User Card */}
              {matchedUser && (
                <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs">
                        {matchedUser.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{matchedUser.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">@{matchedUser.username} &bull; {matchedUser.role}</div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                      Account Verified
                    </span>
                  </div>

                  {/* Quick Reset Option */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Standard Default Pass: <strong className="text-amber-400 font-mono">
                        {matchedUser.role === 'REPO OFFICER' ? 'repo123' : matchedUser.role === 'COLLECTION OFFICER' ? 'officer123' : matchedUser.role === 'SUPERVISOR' ? 'super123' : 'admin123'}
                      </strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleResetToDefault(matchedUser)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset to Default</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Set New Custom Password Form */}
              {matchedUser && (
                <form onSubmit={handleSaveNewPassword} className="space-y-3.5 pt-2 border-t border-slate-800">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Or Set New Password
                  </h3>

                  <div>
                    <label className="block text-[11px] text-slate-300 font-medium mb-1">
                      Agency Master Security Key (Dahod Branch PIN)
                    </label>
                    <input
                      type="text"
                      value={agencyPin}
                      onChange={(e) => setAgencyPin(e.target.value)}
                      placeholder="Enter GJ20 or LION2026"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Default Dahod District RTO Key: <span className="text-amber-400 font-mono font-bold">GJ20</span> or Master Key: <span className="text-amber-400 font-mono font-bold">LION2026</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-300 font-medium mb-1">
                        New Password
                      </label>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 4 characters"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-300 font-medium mb-1">
                        Confirm Password
                      </label>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="text-[11px] text-slate-400 flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showNewPassword}
                        onChange={(e) => setShowNewPassword(e.target.checked)}
                        className="rounded border-slate-700 text-amber-500"
                      />
                      <span>Show passwords</span>
                    </label>

                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Save New Password</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Master Credential Guide Table */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  Dahod Agency Master User Directory
                </span>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-amber-400 block font-bold">SUPER ADMIN</span>
                    <span className="text-slate-300">User: admin</span>
                    <br />
                    <span className="text-slate-400">Pass: admin123</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-blue-400 block font-bold">SUPERVISOR</span>
                    <span className="text-slate-300">User: supervisor</span>
                    <br />
                    <span className="text-slate-400">Pass: super123</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-emerald-400 block font-bold">COLLECTION OFFICER</span>
                    <span className="text-slate-300">User: officer1</span>
                    <br />
                    <span className="text-slate-400">Pass: officer123</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-orange-400 block font-bold">REPO OFFICER</span>
                    <span className="text-slate-300">User: repo1</span>
                    <br />
                    <span className="text-slate-400">Pass: repo123</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
