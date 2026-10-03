import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  User as UserIcon,
  Lock,
  CheckCircle,
  XCircle,
  Check,
  X,
  Save,
  Key,
  Trash2,
  Info,
  LayoutGrid,
  Table as TableIcon,
  Search,
  Eye,
  EyeOff,
  KeyRound,
  Copy,
  CheckCheck,
} from 'lucide-react';
import { storage } from '../services/storage';
import { User, UserRole, PermissionMatrix } from '../types';

export const UserPermissionsModule: React.FC = () => {
  const [users, setUsers] = useState<User[]>(() => storage.getUsers());
  const [permissions, setPermissions] = useState<PermissionMatrix>(() =>
    storage.getPermissions()
  );
  const officers = storage.getOfficers();

  const [selectedRole, setSelectedRole] = useState<UserRole>('COLLECTION OFFICER');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<User | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('');
  const [showPasswordIds, setShowPasswordIds] = useState<Record<string, boolean>>({
    'usr-repo1': true,
  });
  const [copiedUserId, setCopiedUserId] = useState<string | null>(null);
  const [resettingUser, setResettingUser] = useState<User | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [passwordNotice, setPasswordNotice] = useState('');
  const [formError, setFormError] = useState('');
  const [userForm, setUserForm] = useState({
    username: '',
    name: '',
    mobile: '',
    email: '',
    role: 'COLLECTION OFFICER' as UserRole,
    officerId: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
    password: '',
  });

  const roles: UserRole[] = [
    'SUPER ADMIN',
    'ADMIN',
    'SUPERVISOR',
    'COLLECTION OFFICER',
    'REPO OFFICER',
    'OFFICE STAFF',
    'ACCOUNT STAFF',
  ];

  const modules = [
    { key: 'cases', label: 'Cases' },
    { key: 'collection', label: 'Daily Collection' },
    { key: 'hisab', label: 'Daily Hisab' },
    { key: 'officers', label: 'Officers Directory' },
    { key: 'attendance', label: 'Attendance' },
    { key: 'salary', label: 'Salary & Payroll' },
    { key: 'payout', label: 'Payout Engine' },
    { key: 'repo', label: 'Repo & Release' },
    { key: 'yard', label: 'Vehicle Yard' },
    { key: 'reports', label: 'Reports & Analytics' },
    { key: 'settings', label: 'Settings & Config' },
  ];

  const actions: ('view' | 'add' | 'edit' | 'delete' | 'import' | 'export' | 'approve')[] = [
    'view',
    'add',
    'edit',
    'delete',
    'import',
    'export',
    'approve',
  ];

  const refreshUsers = () => {
    setUsers([...storage.getUsers()]);
  };

  const handleTogglePermission = (moduleKey: string, action: any) => {
    const updated = JSON.parse(JSON.stringify(permissions));
    if (!updated[selectedRole]) updated[selectedRole] = {};
    if (!updated[selectedRole][moduleKey]) {
      updated[selectedRole][moduleKey] = {
        view: false,
        add: false,
        edit: false,
        delete: false,
        import: false,
        export: false,
        approve: false,
      };
    }

    updated[selectedRole][moduleKey][action] = !updated[selectedRole][moduleKey][action];
    storage.savePermissions(updated);
    setPermissions(updated);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!userForm.username || !userForm.name) {
      setFormError('Username and name are required.');
      return;
    }

    storage.addUser(userForm);
    setIsUserModalOpen(false);
    setUserForm({
      username: '',
      name: '',
      mobile: '',
      email: '',
      role: 'COLLECTION OFFICER',
      officerId: '',
      status: 'ACTIVE',
      password: '',
    });
    refreshUsers();
  };

  const handleCopyCredentials = (username: string, pass: string, targetKey: string) => {
    navigator.clipboard.writeText(`Username: ${username}\nPassword: ${pass}`);
    setCopiedUserId(targetKey);
    setTimeout(() => setCopiedUserId(null), 2500);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser || !newPasswordInput.trim()) return;
    storage.resetPassword(resettingUser.id, newPasswordInput.trim());
    setPasswordNotice(`Password updated for @${resettingUser.username}`);
    refreshUsers();
    setTimeout(() => {
      setPasswordNotice('');
      setResettingUser(null);
      setNewPasswordInput('');
    }, 1500);
  };

  const handleDeleteUser = (user: User) => {
    setDeleteErrorMessage('');
    if (user.role === 'SUPER ADMIN') {
      const superAdmins = users.filter((u) => u.role === 'SUPER ADMIN');
      if (superAdmins.length <= 1) {
        setDeleteErrorMessage('Cannot delete the only Super Admin account. Please designate another Super Admin first.');
        return;
      }
    }
    const currentUser = storage.getCurrentUser();
    if (currentUser && currentUser.id === user.id) {
      setDeleteErrorMessage('Cannot delete your own currently active session account.');
      return;
    }
    storage.deleteUser(user.id);
    setConfirmDeleteUser(null);
    refreshUsers();
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      (u.mobile && u.mobile.includes(userSearchTerm))
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white">User Accounts &amp; Access Permissions</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Role-Based Access Control (RBAC). Manage login credentials, assigned roles, and delete user accounts.
          </p>
        </div>

        <button
          onClick={() => setIsUserModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/10"
        >
          <Plus className="w-4 h-4" />
          Create User Login
        </button>
      </div>

      {/* Users Summary List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-amber-400" />
              Active System Logins ({users.length})
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Manage credentials, assigned roles, and delete user accounts
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center p-0.5 rounded-lg bg-slate-800 border border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  viewMode === 'table'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                Table
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Cards
              </button>
            </div>

            <button
              onClick={() => setIsUserModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/10"
            >
              <Plus className="w-3.5 h-3.5" />
              Add User
            </button>
          </div>
        </div>

        {/* Step-by-Step Guide: How to Delete a User */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-amber-400">
              <Info className="w-4 h-4 shrink-0" />
              <span>How to Delete a User Account</span>
            </div>
            <span className="text-[11px] text-slate-400 italic">
              Note: To delete field staff instead, go to Staff &amp; HR &gt; Officers Directory
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Step 1: Locate
              </span>
              <p className="font-semibold text-white mt-1.5 text-xs">Find Target User</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Browse the table below or search by name, username, or role.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                Step 2: Click Delete
              </span>
              <p className="font-semibold text-white mt-1.5 text-xs">Click "Delete Entry"</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Click the red <strong className="text-rose-400">Delete Entry</strong> button with the trash icon in their row.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Step 3: Confirm
              </span>
              <p className="font-semibold text-white mt-1.5 text-xs">Confirm Removal</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Verify the user account details and click "Confirm Delete User" to permanently revoke access.
              </p>
            </div>
          </div>
        </div>

        {/* REPO AGENT LOGIN & PASSWORDS REFERENCE ROSTER */}
        <div className="bg-gradient-to-r from-orange-950/40 via-amber-950/30 to-slate-900 border-2 border-orange-500/40 rounded-xl p-4 text-xs shadow-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 shadow-xs">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-white text-sm tracking-wide">
                    Repo Agent Login Password
                  </h4>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                    Repo Officer
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Credentials for repossession field agents to log into the field dashboard
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-950/90 p-2 sm:px-3 sm:py-2 rounded-xl border border-orange-500/40 shadow-inner">
              <span className="text-slate-400 text-xs">Username:</span>
              <span className="font-mono font-bold text-orange-400 text-xs">repo1</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400 text-xs">Password:</span>
              <span className="font-mono font-extrabold text-emerald-400 text-xs bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-700/80 shadow-xs">
                repo123
              </span>
              <button
                type="button"
                onClick={() => handleCopyCredentials('repo1', 'repo123', 'banner-repo')}
                title="Copy Repo Agent Credentials"
                className="ml-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold inline-flex items-center gap-1 transition-colors"
              >
                {copiedUserId === 'banner-repo' ? (
                  <>
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
            <div className="p-2.5 rounded-lg bg-orange-950/30 border border-orange-500/40 flex justify-between items-center shadow-xs">
              <div>
                <span className="text-orange-400 block text-[10px] font-bold">Repo Officer</span>
                <span className="font-mono text-white font-bold">repo1</span>
              </div>
              <span className="font-mono text-orange-300 font-extrabold bg-slate-950 px-2 py-0.5 rounded border border-orange-500/40">
                repo123
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-emerald-400 block text-[10px] font-bold">Collection Officer</span>
                <span className="font-mono text-white font-medium">officer1</span>
              </div>
              <span className="font-mono text-emerald-300 font-bold bg-slate-950 px-2 py-0.5 rounded border border-emerald-900/50">
                officer123
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-amber-400 block text-[10px] font-bold">Admin</span>
                <span className="font-mono text-white font-medium">admin</span>
              </div>
              <span className="font-mono text-amber-300 font-bold bg-slate-950 px-2 py-0.5 rounded border border-amber-900/50">
                admin123
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-blue-400 block text-[10px] font-bold">Supervisor</span>
                <span className="font-mono text-white font-medium">supervisor</span>
              </div>
              <span className="font-mono text-blue-300 font-bold bg-slate-950 px-2 py-0.5 rounded border border-blue-900/50">
                super123
              </span>
            </div>
          </div>
        </div>

        {/* Search Bar & Counter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter users by name, @username, or role..."
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Showing <strong className="text-amber-400">{filteredUsers.length}</strong> of{' '}
            <strong className="text-white">{users.length}</strong> user accounts
          </span>
        </div>

        {viewMode === 'table' ? (
          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-850 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">User &amp; Username</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Password / Credentials</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Contact</th>
                  <th className="py-2.5 px-3 text-center text-rose-400 font-bold uppercase tracking-wider text-[10px]">
                    Delete Entry
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                      No user accounts match your search query.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isRepo = u.role === 'REPO OFFICER';
                    const pass = u.password || (isRepo ? 'repo123' : 'admin123');
                    const isVisible = showPasswordIds[u.id];

                    return (
                      <tr
                        key={u.id}
                        className={`transition-colors ${
                          isRepo ? 'bg-orange-950/15 hover:bg-orange-950/25' : 'hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-white text-xs flex items-center gap-1.5">
                            {u.name}
                            {isRepo && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                                REPO
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-amber-400 font-mono">@{u.username}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded font-semibold text-[11px] border ${
                              isRepo
                                ? 'bg-orange-950/60 text-orange-300 border-orange-700/60'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`font-mono text-xs px-2 py-0.5 rounded border select-all ${
                                isRepo
                                  ? 'bg-slate-950 border-orange-500/40 text-orange-300 font-bold'
                                  : 'bg-slate-950 border-slate-800 text-emerald-400 font-medium'
                              }`}
                            >
                              {isVisible ? pass : '••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setShowPasswordIds((prev) => ({ ...prev, [u.id]: !prev[u.id] }))
                              }
                              title={isVisible ? 'Hide password' : 'Show password'}
                              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            >
                              {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopyCredentials(u.username, pass, u.id)}
                              title="Copy username & password"
                              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            >
                              {copiedUserId === u.id ? (
                                <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setResettingUser(u);
                                setNewPasswordInput(pass);
                              }}
                              title="Change / Reset Password"
                              className="p-1 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-slate-800 text-emerald-400 border border-slate-700">
                            {u.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                          {u.mobile || u.email || '—'}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => {
                              setDeleteErrorMessage('');
                              setConfirmDeleteUser(u);
                            }}
                            title={`Delete user account @${u.username}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-rose-300 border border-rose-800/60 text-[11px] font-semibold transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Entry</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {filteredUsers.length === 0 ? (
              <div className="col-span-full py-8 text-center text-slate-400 text-xs">
                No user accounts match your search query.
              </div>
            ) : (
              filteredUsers.map((u) => {
                const isRepo = u.role === 'REPO OFFICER';
                const pass = u.password || (isRepo ? 'repo123' : 'admin123');
                const isVisible = showPasswordIds[u.id];

                return (
                  <div
                    key={u.id}
                    className={`p-3.5 rounded-xl border space-y-3 flex flex-col justify-between transition-all ${
                      isRepo
                        ? 'bg-slate-850/90 border-orange-500/40 shadow-md'
                        : 'bg-slate-850 border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-bold text-white text-xs">{u.name}</span>
                          {isRepo && (
                            <span className="ml-1.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                              REPO
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-slate-800 text-emerald-400 border border-slate-700">
                          {u.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-amber-400 font-mono mt-0.5">@{u.username}</div>
                      <div className="text-[10px] text-slate-400 mt-1 font-semibold">{u.role}</div>

                      {/* Password field on card */}
                      <div className="mt-2.5 p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-slate-400 block font-semibold">Password</span>
                          <span className="font-mono text-xs font-bold text-orange-300">
                            {isVisible ? pass : '••••••••'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              setShowPasswordIds((prev) => ({ ...prev, [u.id]: !prev[u.id] }))
                            }
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                            title={isVisible ? 'Hide' : 'Show'}
                          >
                            {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyCredentials(u.username, pass, u.id)}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                            title="Copy credentials"
                          >
                            {copiedUserId === u.id ? (
                              <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-500 pt-2 mt-2 border-t border-slate-800">
                        Mobile: {u.mobile || '—'}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setResettingUser(u);
                          setNewPasswordInput(pass);
                        }}
                        title="Change password"
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold transition-colors"
                      >
                        Reset Key
                      </button>
                      <button
                        onClick={() => {
                          setDeleteErrorMessage('');
                          setConfirmDeleteUser(u);
                        }}
                        title={`Delete user account @${u.username}`}
                        className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-rose-300 border border-rose-800/60 text-[11px] font-semibold transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Entry</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Permission Matrix Configuration */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Module Access Matrix for Role: <span className="text-amber-400">{selectedRole}</span>
            </h3>
            <p className="text-xs text-slate-400">
              Check/uncheck allowed actions per module.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Select Role:</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as any)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white font-bold focus:outline-none focus:border-amber-500"
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Module</th>
                {actions.map((act) => (
                  <th key={act} className="py-2.5 px-3 text-center uppercase">
                    {act}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {modules.map((m) => {
                const rolePerms = permissions[selectedRole]?.[m.key] || {};

                return (
                  <tr key={m.key} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-semibold text-white">{m.label}</td>
                    {actions.map((act) => {
                      const isAllowed = rolePerms[act] ?? false;
                      const isSuperAdmin = selectedRole === 'SUPER ADMIN';

                      return (
                        <td key={act} className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => !isSuperAdmin && handleTogglePermission(m.key, act)}
                            disabled={isSuperAdmin}
                            className={`w-6 h-6 rounded flex items-center justify-center mx-auto transition-colors ${
                              isAllowed || isSuperAdmin
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-slate-800 text-slate-600 border border-slate-700'
                            }`}
                          >
                            {isAllowed || isSuperAdmin ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <X className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in duration-150">
            <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                Create New User Login
              </h2>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs">
                  {formError}
                </div>
              )}
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Username *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. officer2"
                  value={userForm.username}
                  onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Manoj Rathod"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">System Role *</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Mobile Number</label>
                <input
                  type="tel"
                  placeholder="98250..."
                  value={userForm.mobile}
                  onChange={(e) => setUserForm({ ...userForm, mobile: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Link to Officer Record (Optional)</label>
                <select
                  value={userForm.officerId}
                  onChange={(e) => setUserForm({ ...userForm, officerId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- None / Office Admin --</option>
                  {officers.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Login Password (Optional)</label>
                <input
                  type="text"
                  placeholder="Defaults to repo123, officer123, etc."
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs shadow-md"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resettingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400 mb-4">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Reset User Password</h3>
                <p className="text-xs text-slate-400">Account: @{resettingUser.username} ({resettingUser.name})</p>
              </div>
            </div>

            <form onSubmit={handleSavePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  New Password for @{resettingUser.username}
                </label>
                <input
                  type="text"
                  required
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Enter new password (e.g. repo123)"
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              {passwordNotice && (
                <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>{passwordNotice}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setResettingUser(null);
                    setNewPasswordInput('');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20"
                >
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Account Confirmation Modal */}
      {confirmDeleteUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete User Account?</h3>
                <p className="text-xs text-rose-400 font-semibold mt-0.5">Permanent account removal</p>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              <p className="text-xs text-slate-300 leading-relaxed">
                Are you sure you want to permanently delete user{' '}
                <strong className="text-white">@{confirmDeleteUser.username}</strong> ({confirmDeleteUser.name})?
              </p>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Role:</span>
                  <span className="font-semibold text-amber-400">{confirmDeleteUser.role}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Status:</span>
                  <span className="font-semibold text-emerald-400">{confirmDeleteUser.status}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Mobile:</span>
                  <span className="font-mono text-slate-300">{confirmDeleteUser.mobile || '—'}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-900/40 text-[11px] text-rose-300">
                ⚠️ All login access and permissions for this account will be permanently revoked immediately.
              </div>

              {deleteErrorMessage && (
                <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-semibold">
                  {deleteErrorMessage}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setConfirmDeleteUser(null);
                  setDeleteErrorMessage('');
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteUser(confirmDeleteUser)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/20 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirm Delete User</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
