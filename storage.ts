/**
 * Lion Group Agency - Storage & Database Service
 * Provides persistent storage, relational integrity, audit logging,
 * automatic metrics computation, and business workflows.
 */

import {
  User,
  FinanceCompany,
  CaseRecord,
  CollectionRecord,
  ExpenseRecord,
  DailyHisabRecord,
  OfficerRecord,
  AttendanceRecord,
  SalaryRecord,
  PayoutRule,
  PayoutRecord,
  VehicleYardRecord,
  RepoReleaseRecord,
  VisitRecord,
  CustomFieldDefinition,
  AuditLog,
  AppSettings,
  PermissionMatrix,
} from '../types';

const STORAGE_KEYS = {
  USERS: 'lga_users',
  CURRENT_USER: 'lga_current_user',
  FINANCE_COMPANIES: 'lga_finance_companies',
  CASES: 'lga_cases',
  COLLECTIONS: 'lga_collections',
  EXPENSES: 'lga_expenses',
  DAILY_HISAB: 'lga_daily_hisab',
  OFFICERS: 'lga_officers',
  ATTENDANCE: 'lga_attendance',
  SALARIES: 'lga_salaries',
  PAYOUT_RULES: 'lga_payout_rules',
  PAYOUTS: 'lga_payouts',
  VEHICLE_YARDS: 'lga_vehicle_yards',
  REPO_RELEASES: 'lga_repo_releases',
  VISITS: 'lga_visits',
  CUSTOM_FIELDS: 'lga_custom_fields',
  AUDIT_LOGS: 'lga_audit_logs',
  SETTINGS: 'lga_settings',
  PERMISSIONS: 'lga_permissions',
};

// Default Settings
export const DEFAULT_SETTINGS: AppSettings = {
  paymentModes: ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Online', 'Other'],
  collectionTypes: ['EMI', 'Part Payment', 'Foreclosure', 'Settlement', 'Repo Release Payment', 'Other'],
  caseStatuses: [
    'NEW',
    'ALLOCATED',
    'CONTACTED',
    'PROMISE TO PAY',
    'PAID',
    'PARTIAL PAID',
    'UNPAID',
    'REPO PENDING',
    'REPO',
    'CLOSED',
  ],
  repoStatuses: ['REPO INITIATED', 'IN REPO PROCESS', 'REPO DONE', 'CANCELLED'],
  vehicleStatuses: ['REPO', 'IN YARD', 'RELEASED', 'RELEASED SAME DAY', 'RELEASED LATER', 'SOLD', 'CLOSED'],
  expenseCategories: ['Petrol', 'Office Expense', 'Vehicle Expense', 'Courier', 'Staff Expense', 'Repo Agent Charge', 'Other'],
  officerDesignations: ['Field Collection Officer', 'Senior Recovery Agent', 'Repo Specialist', 'Yard Supervisor', 'Area Manager'],
  attendanceStatuses: ['Present', 'Absent', 'Half Day', 'Leave'],
  payoutTypes: ['PER_RECEIPT', 'PERCENTAGE'],
  salaryComponents: ['Basic Salary', 'Incentive', 'Collection Incentive', 'Repo Incentive', 'Deduction', 'Advance', 'Other'],
  yardNames: ['Dahod Central Yard', 'Godhra Bypass Yard', 'Limkheda Safe Yard', 'Vadodara Hub Yard'],
  visitTypes: ['Home Visit', 'Office Visit', 'Guarantor Visit', 'Yard Visit', 'Other'],
  casePriorities: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
  documentTypes: ['RC Copy', 'Aadhar Card', 'PAN Card', 'Inventory Sheet', 'Surrender Letter', 'Release Challan'],
  dashboardWidgets: [
    { id: 'total_cases', name: 'Total Cases', visible: true, order: 1 },
    { id: 'total_pos', name: 'Total POS', visible: true, order: 2 },
    { id: 'total_tos', name: 'Total TOS', visible: true, order: 3 },
    { id: 'today_collection', name: "Today's Collection", visible: true, order: 4 },
    { id: 'monthly_collection', name: 'Monthly Collection', visible: true, order: 5 },
    { id: 'today_repo', name: "Today's Repo", visible: true, order: 6 },
    { id: 'today_release', name: "Today's Release", visible: true, order: 7 },
    { id: 'same_day_release', name: 'Same-Day Release', visible: true, order: 8 },
    { id: 'yard_vehicles', name: 'Vehicles in Yard', visible: true, order: 9 },
    { id: 'active_officers', name: 'Active Officers', visible: true, order: 10 },
    { id: 'target_shortfall', name: 'Target & DRR', visible: true, order: 11 },
  ],
};

// Default Roles & Permission Matrix
export const DEFAULT_PERMISSIONS: PermissionMatrix = {
  'SUPER ADMIN': {
    cases: { view: true, add: true, edit: true, delete: true, import: true, export: true, approve: true },
    collection: { view: true, add: true, edit: true, delete: true, import: true, export: true, approve: true },
    hisab: { view: true, add: true, edit: true, delete: true, import: true, export: true, approve: true },
    officers: { view: true, add: true, edit: true, delete: true, import: true, export: true, approve: true },
    attendance: { view: true, add: true, edit: true, delete: true, import: true, export: true, approve: true },
    salary: { view: true, add: true, edit: true, delete: true, import: true, export: true, approve: true },
    payout: { view: true, add: true, edit: true, delete: true, import: true, export: true, approve: true },
    repo: { view: true, add: true, edit: true, delete: true, import: true, export: true, approve: true },
    yard: { view: true, add: true, edit: true, delete: true, import: true, export: true, approve: true },
    reports: { view: true, add: true, edit: true, delete: true, import: true, export: true, approve: true },
    settings: { view: true, add: true, edit: true, delete: true, import: true, export: true, approve: true },
  },
  'ADMIN': {
    cases: { view: true, add: true, edit: true, delete: false, import: true, export: true, approve: true },
    collection: { view: true, add: true, edit: true, delete: false, import: true, export: true, approve: true },
    hisab: { view: true, add: true, edit: true, delete: false, import: true, export: true, approve: true },
    officers: { view: true, add: true, edit: true, delete: false, import: true, export: true, approve: true },
    attendance: { view: true, add: true, edit: true, delete: false, import: true, export: true, approve: true },
    salary: { view: true, add: true, edit: true, delete: false, import: true, export: true, approve: true },
    payout: { view: true, add: true, edit: true, delete: false, import: true, export: true, approve: true },
    repo: { view: true, add: true, edit: true, delete: false, import: true, export: true, approve: true },
    yard: { view: true, add: true, edit: true, delete: false, import: true, export: true, approve: true },
    reports: { view: true, add: true, edit: true, delete: false, import: true, export: true, approve: true },
    settings: { view: true, add: true, edit: true, delete: false, import: false, export: true, approve: true },
  },
  'SUPERVISOR': {
    cases: { view: true, add: true, edit: true, delete: false, import: true, export: true, approve: true },
    collection: { view: true, add: true, edit: true, delete: false, import: false, export: true, approve: false },
    hisab: { view: true, add: true, edit: false, delete: false, import: false, export: true, approve: false },
    officers: { view: true, add: false, edit: false, delete: false, import: false, export: true, approve: false },
    attendance: { view: true, add: true, edit: true, delete: false, import: false, export: true, approve: true },
    salary: { view: false, add: false, edit: false, delete: false, import: false, export: false, approve: false },
    payout: { view: false, add: false, edit: false, delete: false, import: false, export: false, approve: false },
    repo: { view: true, add: true, edit: true, delete: false, import: false, export: true, approve: true },
    yard: { view: true, add: true, edit: true, delete: false, import: false, export: true, approve: true },
    reports: { view: true, add: false, edit: false, delete: false, import: false, export: true, approve: false },
    settings: { view: false, add: false, edit: false, delete: false, import: false, export: false, approve: false },
  },
  'COLLECTION OFFICER': {
    cases: { view: true, add: false, edit: true, delete: false, import: false, export: false, approve: false },
    collection: { view: true, add: true, edit: false, delete: false, import: false, export: false, approve: false },
    hisab: { view: false, add: false, edit: false, delete: false, import: false, export: false, approve: false },
    officers: { view: false, add: false, edit: false, delete: false, import: false, export: false, approve: false },
    attendance: { view: true, add: true, edit: false, delete: false, import: false, export: false, approve: false },
    salary: { view: false, add: false, edit: false, delete: false, import: false, export: false, approve: false },
    payout: { view: false, add: false, edit: false, delete: false, import: false, export: false, approve: false },
    repo: { view: false, add: false, edit: false, delete: false, import: false, export: false, approve: false },
    yard: { view: false, add: false, edit: false, delete: false, import: false, export: false, approve: false },
    reports: { view: false, add: false, edit: false, delete: false, import: false, export: false, approve: false },
    settings: { view: false, add: false, edit: false, delete: false, import: false, export: false, approve: false },
  },
  'REPO OFFICER': {
    cases: { view: true, add: false, edit: true, delete: false, import: false, export: false, approve: false },
    collection: { view: false, add: false, edit: false, delete: false, import: false, export: false, approve: false },
    hisab: { view: false, add: false, edit: false, delete: false, import: false, export: false, approve: false },
    officers: { view: false, add: false, edit: false, delete: false, import: false, export: false, approve: false },
    attendance: { view: true, add: true, edit: false, delete: false, import: false, export: false, approve: false },
    salary: { view: false, add: false, edit: false, delete: false, import: false, export: false, approve: false },
    payout: { view: false, add: false, edit: false, delete: false, import: false, export: false, approve: false },
    repo: { view: true, add: true, edit: true, delete: false, import: false, export: true, approve: false },
    yard: { view: true, add: true, edit: true, delete: false, import: false, export: true, approve: false },
    reports: { view: false, add: false, edit: false, delete: false, import: false, export: false, approve: false },
    settings: { view: false, add: false, edit: false, delete: false, import: false, export: false, approve: false },
  },
  'OFFICE STAFF': {
    cases: { view: true, add: true, edit: true, delete: false, import: true, export: true, approve: false },
    collection: { view: true, add: true, edit: false, delete: false, import: false, export: true, approve: false },
    hisab: { view: true, add: true, edit: false, delete: false, import: false, export: true, approve: false },
    officers: { view: true, add: false, edit: false, delete: false, import: false, export: false, approve: false },
    attendance: { view: true, add: true, edit: false, delete: false, import: false, export: true, approve: false },
    salary: { view: false, add: false, edit: false, delete: false, import: false, export: false, approve: false },
    payout: { view: false, add: false, edit: false, delete: false, import: false, export: false, approve: false },
    repo: { view: true, add: false, edit: false, delete: false, import: false, export: true, approve: false },
    yard: { view: true, add: false, edit: false, delete: false, import: false, export: true, approve: false },
    reports: { view: true, add: false, edit: false, delete: false, import: false, export: true, approve: false },
    settings: { view: false, add: false, edit: false, delete: false, import: false, export: false, approve: false },
  },
  'ACCOUNT STAFF': {
    cases: { view: true, add: false, edit: false, delete: false, import: false, export: true, approve: false },
    collection: { view: true, add: true, edit: true, delete: false, import: true, export: true, approve: true },
    hisab: { view: true, add: true, edit: true, delete: false, import: true, export: true, approve: true },
    officers: { view: true, add: false, edit: false, delete: false, import: false, export: true, approve: false },
    attendance: { view: true, add: false, edit: false, delete: false, import: false, export: true, approve: false },
    salary: { view: true, add: true, edit: true, delete: false, import: true, export: true, approve: true },
    payout: { view: true, add: true, edit: true, delete: false, import: true, export: true, approve: true },
    repo: { view: true, add: false, edit: false, delete: false, import: false, export: true, approve: false },
    yard: { view: true, add: false, edit: false, delete: false, import: false, export: true, approve: false },
    reports: { view: true, add: true, edit: false, delete: false, import: true, export: true, approve: true },
    settings: { view: false, add: false, edit: false, delete: false, import: false, export: false, approve: false },
  },
};

// Seed Data
const SEED_USERS: User[] = [
  {
    id: 'usr-admin',
    username: 'admin',
    name: 'Lion Admin',
    email: 'admin@lionagency.com',
    mobile: '9825098250',
    role: 'SUPER ADMIN',
    status: 'ACTIVE',
    password: 'admin123',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'usr-supervisor',
    username: 'supervisor',
    name: 'Mahesh Solanki',
    email: 'mahesh@lionagency.com',
    mobile: '9876543210',
    role: 'SUPERVISOR',
    status: 'ACTIVE',
    password: 'super123',
    createdAt: '2026-01-02T00:00:00.000Z',
  },
  {
    id: 'usr-officer1',
    username: 'officer1',
    name: 'Rajesh Parmar',
    email: 'rajesh@lionagency.com',
    mobile: '9898012345',
    role: 'COLLECTION OFFICER',
    officerId: 'off-1',
    status: 'ACTIVE',
    password: 'officer123',
    createdAt: '2026-01-05T00:00:00.000Z',
  },
  {
    id: 'usr-repo1',
    username: 'repo1',
    name: 'Vikram Chauhan',
    email: 'vikram@lionagency.com',
    mobile: '9723045678',
    role: 'REPO OFFICER',
    officerId: '',
    status: 'ACTIVE',
    password: 'super123',
    createdAt: '2026-01-02T00:00:00.000Z',
  },
  {
    id: 'usr-officer1',
    username: 'officer1',
    name: 'Collection Officer',
    email: 'officer1@lionagency.com',
    mobile: '9898012345',
    role: 'COLLECTION OFFICER',
    status: 'ACTIVE',
    password: 'officer123',
    createdAt: '2026-01-05T00:00:00.000Z',
  },
  {
    id: 'usr-repo1',
    username: 'repo1',
    name: 'Repo Officer',
    email: 'repo1@lionagency.com',
    mobile: '9723045678',
    role: 'REPO OFFICER',
    status: 'ACTIVE',
    password: 'repo123',
    createdAt: '2026-01-05T00:00:00.000Z',
  },
];

const SEED_FINANCE_COMPANIES: FinanceCompany[] = [];
const SEED_OFFICERS: OfficerRecord[] = [];
const SEED_CASES: CaseRecord[] = [];
const SEED_COLLECTIONS: CollectionRecord[] = [];
const SEED_EXPENSES: ExpenseRecord[] = [];
const SEED_DAILY_HISAB: DailyHisabRecord[] = [];
const SEED_ATTENDANCE: AttendanceRecord[] = [];
const SEED_PAYOUT_RULES: PayoutRule[] = [];
const SEED_YARDS: VehicleYardRecord[] = [];

const SEED_CUSTOM_FIELDS: CustomFieldDefinition[] = [
  {
    id: 'cf-1',
    module: 'Case',
    fieldName: 'policeStationJurisdiction',
    displayName: 'Police Station Jurisdiction',
    fieldType: 'Dropdown',
    required: false,
    active: true,
    fieldOrder: 1,
    dropdownOptions: ['Dahod Town', 'Dahod Rural', 'Jhalod', 'Fatehpura', 'Limkheda', 'Garbada'],
  },
  {
    id: 'cf-2',
    module: 'Case',
    fieldName: 'vehicleGpsFitted',
    displayName: 'GPS Device Fitted?',
    fieldType: 'Yes/No',
    required: false,
    active: true,
    fieldOrder: 2,
    defaultValue: 'No',
  },
  {
    id: 'cf-3',
    module: 'Collection',
    fieldName: 'collectorDeviceImei',
    displayName: 'Handheld POS Device ID',
    fieldType: 'Text',
    required: false,
    active: true,
    fieldOrder: 1,
  },
  {
    id: 'cf-4',
    module: 'Vehicle',
    fieldName: 'fuelLevel',
    displayName: 'Fuel Level in Tank',
    fieldType: 'Dropdown',
    required: false,
    active: true,
    fieldOrder: 1,
    dropdownOptions: ['Empty / Reserve', '1/4 Tank', '1/2 Tank', '3/4 Tank', 'Full Tank'],
  },
];

class StorageService {
  constructor() {
    this.initDatabase();
  }

  private initDatabase() {
    if (typeof window === 'undefined') return;

    const CLEAN_ZERO_DATA_KEY = 'lga_zero_clean_v6';
    if (localStorage.getItem(CLEAN_ZERO_DATA_KEY) !== 'true') {
      localStorage.setItem(STORAGE_KEYS.FINANCE_COMPANIES, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.OFFICERS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.DAILY_HISAB, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.PAYOUT_RULES, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.PAYOUTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.VEHICLE_YARDS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.REPO_RELEASES, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.SALARIES, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify([]));
      localStorage.setItem(CLEAN_ZERO_DATA_KEY, 'true');
    }

    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.FINANCE_COMPANIES)) {
      localStorage.setItem(STORAGE_KEYS.FINANCE_COMPANIES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.OFFICERS)) {
      localStorage.setItem(STORAGE_KEYS.OFFICERS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CASES)) {
      localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.COLLECTIONS)) {
      localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.EXPENSES)) {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DAILY_HISAB)) {
      localStorage.setItem(STORAGE_KEYS.DAILY_HISAB, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PAYOUT_RULES)) {
      localStorage.setItem(STORAGE_KEYS.PAYOUT_RULES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PAYOUTS)) {
      localStorage.setItem(STORAGE_KEYS.PAYOUTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.VEHICLE_YARDS)) {
      localStorage.setItem(STORAGE_KEYS.VEHICLE_YARDS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REPO_RELEASES)) {
      localStorage.setItem(STORAGE_KEYS.REPO_RELEASES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.VISITS)) {
      localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SALARIES)) {
      localStorage.setItem(STORAGE_KEYS.SALARIES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CUSTOM_FIELDS)) {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_FIELDS, JSON.stringify(SEED_CUSTOM_FIELDS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PERMISSIONS)) {
      localStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(DEFAULT_PERMISSIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      // Default to admin user for immediate seamless access
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(SEED_USERS[0]));
    }

    // Sync with server persisted database on load
    if (typeof window !== 'undefined') {
      fetch('/api/database')
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data) {
            if (Array.isArray(data.cases)) {
              localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(data.cases));
            }
            if (Array.isArray(data.financeCompanies)) {
              localStorage.setItem(STORAGE_KEYS.FINANCE_COMPANIES, JSON.stringify(data.financeCompanies));
            }
            if (Array.isArray(data.collections)) {
              localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(data.collections));
            }
            if (Array.isArray(data.expenses)) {
              localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(data.expenses));
            }
            if (Array.isArray(data.dailyHisab)) {
              localStorage.setItem(STORAGE_KEYS.DAILY_HISAB, JSON.stringify(data.dailyHisab));
            }
            if (Array.isArray(data.officers)) {
              localStorage.setItem(STORAGE_KEYS.OFFICERS, JSON.stringify(data.officers));
            }
            if (Array.isArray(data.vehicleYards)) {
              localStorage.setItem(STORAGE_KEYS.VEHICLE_YARDS, JSON.stringify(data.vehicleYards));
            }
          }
        })
        .catch(() => {});
    }
  }

  // Generic JSON helpers
  private syncTimer: any = null;

  private scheduleServerSync() {
    if (typeof window === 'undefined') return;
    if (this.syncTimer) clearTimeout(this.syncTimer);
    this.syncTimer = setTimeout(() => {
      try {
        const dump = this.exportDatabaseJson();
        fetch('/api/database', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: dump,
        }).catch(() => {
          // Ignore offline errors
        });
      } catch {
        // Ignore
      }
    }, 800);
  }

  private get<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : fallback;
    } catch {
      return fallback;
    }
  }

  private set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore quota errors gracefully
    }
    this.scheduleServerSync();
  }

  // Audit Logger
  logAudit(
    module: string,
    action: AuditLog['action'],
    recordId: string,
    description: string,
    oldValue?: any,
    newValue?: any
  ) {
    const user = this.getCurrentUser();
    const logs = this.get<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
    let oldValStr: string | undefined;
    let newValStr: string | undefined;
    try {
      oldValStr = oldValue ? JSON.stringify(oldValue) : undefined;
    } catch {
      oldValStr = undefined;
    }
    try {
      newValStr = newValue ? JSON.stringify(newValue) : undefined;
    } catch {
      newValStr = undefined;
    }

    const newLog: AuditLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      userId: user?.id || 'sys',
      userName: user?.name || 'System',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString(),
      module,
      action,
      recordId,
      oldValue: oldValStr,
      newValue: newValStr,
      description,
    };
    logs.unshift(newLog);
    // Keep max 500 logs locally
    if (logs.length > 500) logs.pop();
    this.set(STORAGE_KEYS.AUDIT_LOGS, logs);
  }

  getAuditLogs(): AuditLog[] {
    return this.get<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
  }

  // Auth & Current User
  getCurrentUser(): User | null {
    return this.get<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  }

  setCurrentUser(user: User | null): void {
    this.set(STORAGE_KEYS.CURRENT_USER, user);
    if (user) {
      this.logAudit('Auth', 'LOGIN', user.id, `User ${user.username} (${user.role}) logged in.`);
    }
  }

  getUsers(): User[] {
    const users = this.get<User[]>(STORAGE_KEYS.USERS, []);
    return users.map((u) => {
      if (!u.password) {
        let defaultPass = 'admin123';
        if (u.role === 'REPO OFFICER') defaultPass = 'repo123';
        else if (u.role === 'COLLECTION OFFICER') defaultPass = 'officer123';
        else if (u.role === 'SUPERVISOR') defaultPass = 'super123';
        else if (u.role === 'SUPER ADMIN' || u.role === 'ADMIN') defaultPass = 'admin123';
        else defaultPass = 'staff123';
        return { ...u, password: defaultPass };
      }
      return u;
    });
  }

  addUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const users = this.getUsers();
    let defaultPass = user.password || 'admin123';
    if (!user.password) {
      if (user.role === 'REPO OFFICER') defaultPass = 'repo123';
      else if (user.role === 'COLLECTION OFFICER') defaultPass = 'officer123';
      else if (user.role === 'SUPERVISOR') defaultPass = 'super123';
      else if (user.role === 'SUPER ADMIN' || user.role === 'ADMIN') defaultPass = 'admin123';
      else defaultPass = 'staff123';
    }
    const newUser: User = {
      ...user,
      password: defaultPass,
      id: 'usr-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    this.set(STORAGE_KEYS.USERS, users);
    this.logAudit('User Management', 'CREATE', newUser.id, `Created user ${newUser.username}`, undefined, newUser);
    return newUser;
  }

  resetPassword(id: string, newPass: string): boolean {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return false;
    users[idx].password = newPass;
    this.set(STORAGE_KEYS.USERS, users);
    this.logAudit('User Management', 'UPDATE', id, `Reset password for user ${users[idx].username}`);
    return true;
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    const old = users[idx];
    const updated = { ...old, ...updates };
    users[idx] = updated;
    this.set(STORAGE_KEYS.USERS, users);
    this.logAudit('User Management', 'UPDATE', id, `Updated user ${updated.username}`, old, updated);
    return updated;
  }

  deleteUser(id: string): boolean {
    const users = this.getUsers();
    const target = users.find((u) => u.id === id);
    if (!target) return false;
    const remaining = users.filter((u) => u.id !== id);
    this.set(STORAGE_KEYS.USERS, remaining);
    this.logAudit('User Management', 'DELETE', id, `Deleted user ${target.username} (${target.name})`, target);
    return true;
  }

  // Permissions & Settings
  getPermissions(): PermissionMatrix {
    return this.get<PermissionMatrix>(STORAGE_KEYS.PERMISSIONS, DEFAULT_PERMISSIONS);
  }

  savePermissions(matrix: PermissionMatrix): void {
    this.set(STORAGE_KEYS.PERMISSIONS, matrix);
    this.logAudit('Permissions', 'UPDATE', 'matrix', 'Updated Role Permission Matrix');
  }

  hasPermission(module: string, action: 'view' | 'add' | 'edit' | 'delete' | 'import' | 'export' | 'approve'): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    if (user.role === 'SUPER ADMIN') return true;
    const matrix = this.getPermissions();
    return matrix[user.role]?.[module]?.[action] ?? false;
  }

  getSettings(): AppSettings {
    const s = this.get<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    return {
      ...DEFAULT_SETTINGS,
      ...s,
      dashboardWidgets: s?.dashboardWidgets || DEFAULT_SETTINGS.dashboardWidgets,
      paymentModes: s?.paymentModes || DEFAULT_SETTINGS.paymentModes,
      collectionTypes: s?.collectionTypes || DEFAULT_SETTINGS.collectionTypes,
      caseStatuses: s?.caseStatuses || DEFAULT_SETTINGS.caseStatuses,
      repoStatuses: s?.repoStatuses || DEFAULT_SETTINGS.repoStatuses,
      vehicleStatuses: s?.vehicleStatuses || DEFAULT_SETTINGS.vehicleStatuses,
      expenseCategories: s?.expenseCategories || DEFAULT_SETTINGS.expenseCategories,
      officerDesignations: s?.officerDesignations || DEFAULT_SETTINGS.officerDesignations,
      attendanceStatuses: s?.attendanceStatuses || DEFAULT_SETTINGS.attendanceStatuses,
      payoutTypes: s?.payoutTypes || DEFAULT_SETTINGS.payoutTypes,
      salaryComponents: s?.salaryComponents || DEFAULT_SETTINGS.salaryComponents,
      yardNames: s?.yardNames || DEFAULT_SETTINGS.yardNames,
      visitTypes: s?.visitTypes || DEFAULT_SETTINGS.visitTypes,
      casePriorities: s?.casePriorities || DEFAULT_SETTINGS.casePriorities,
      documentTypes: s?.documentTypes || DEFAULT_SETTINGS.documentTypes,
    };
  }

  saveSettings(settings: AppSettings): void {
    this.set(STORAGE_KEYS.SETTINGS, settings);
    this.logAudit('Settings', 'UPDATE', 'settings', 'Updated system configurations & lists');
  }

  // Finance Companies Master
  getFinanceCompanies(): FinanceCompany[] {
    return this.get<FinanceCompany[]>(STORAGE_KEYS.FINANCE_COMPANIES, []);
  }

  addFinanceCompany(data: Omit<FinanceCompany, 'id' | 'createdAt'>): FinanceCompany {
    const companies = this.getFinanceCompanies();
    const newCo: FinanceCompany = {
      ...data,
      id: 'fc-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    companies.push(newCo);
    this.set(STORAGE_KEYS.FINANCE_COMPANIES, companies);
    this.logAudit('Finance Company', 'CREATE', newCo.id, `Added Finance Company ${newCo.name}`, undefined, newCo);
    return newCo;
  }

  updateFinanceCompany(id: string, updates: Partial<FinanceCompany>): FinanceCompany | null {
    const companies = this.getFinanceCompanies();
    const idx = companies.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    const old = companies[idx];
    const updated = { ...old, ...updates };
    companies[idx] = updated;
    this.set(STORAGE_KEYS.FINANCE_COMPANIES, companies);
    this.logAudit('Finance Company', 'UPDATE', id, `Updated ${updated.name}`, old, updated);
    return updated;
  }

  deleteFinanceCompany(id: string): boolean {
    const companies = this.getFinanceCompanies();
    const target = companies.find((c) => c.id === id);
    if (!target) return false;
    const remaining = companies.filter((c) => c.id !== id);
    this.set(STORAGE_KEYS.FINANCE_COMPANIES, remaining);
    this.logAudit('Finance Company', 'DELETE', id, `Deleted finance company ${target.name}`, target);
    return true;
  }

  // Cases
  getCases(): CaseRecord[] {
    return this.get<CaseRecord[]>(STORAGE_KEYS.CASES, []);
  }

  getCaseById(id: string): CaseRecord | undefined {
    return this.getCases().find((c) => c.id === id);
  }

  addCase(data: Omit<CaseRecord, 'id' | 'createdAt' | 'updatedAt'>): CaseRecord {
    const cases = this.getCases();
    const newCase: CaseRecord = {
      ...data,
      id: 'case-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    cases.push(newCase);
    this.set(STORAGE_KEYS.CASES, cases);
    this.logAudit('Case', 'CREATE', newCase.id, `Created case ${newCase.loanAgreementNumber} for ${newCase.customerName}`);
    return newCase;
  }

  updateCase(id: string, updates: Partial<CaseRecord>): CaseRecord | null {
    const cases = this.getCases();
    const idx = cases.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    const old = cases[idx];
    const updated = { ...old, ...updates, updatedAt: new Date().toISOString() };
    cases[idx] = updated;
    this.set(STORAGE_KEYS.CASES, cases);
    this.logAudit(
      'Case',
      old.status !== updated.status ? 'STATUS_CHANGE' : 'UPDATE',
      id,
      `Updated case ${updated.loanAgreementNumber}. Status: ${old.status} -> ${updated.status}`,
      old,
      updated
    );
    return updated;
  }

  deleteCase(id: string): boolean {
    const cases = this.getCases();
    const c = cases.find((item) => item.id === id);
    if (!c) return false;
    const filtered = cases.filter((item) => item.id !== id);
    this.set(STORAGE_KEYS.CASES, filtered);
    this.logAudit('Case', 'DELETE', id, `Archived/Deleted case ${c.loanAgreementNumber} (${c.customerName})`, c);
    return true;
  }

  deleteCasesByCompany(companyNameOrId: string): number {
    const cases = this.getCases();
    const remaining = cases.filter(
      (c) => c.financeCompanyId !== companyNameOrId && c.financeCompanyName !== companyNameOrId
    );
    const count = cases.length - remaining.length;
    this.set(STORAGE_KEYS.CASES, remaining);
    this.logAudit('Case', 'DELETE', companyNameOrId, `Deleted ${count} case entries for ${companyNameOrId}`);
    return count;
  }

  clearAllCases(): void {
    const count = this.getCases().length;
    this.set(STORAGE_KEYS.CASES, []);
    this.logAudit('Case', 'DELETE', 'all', `Cleared all ${count} case entries`);
  }

  clearAllCollections(): void {
    const count = this.getCollections().length;
    this.set(STORAGE_KEYS.COLLECTIONS, []);
    this.logAudit('Collection', 'DELETE', 'all', `Cleared all ${count} collection entries`);
  }

  clearAllEntries(): void {
    this.set(STORAGE_KEYS.CASES, []);
    this.set(STORAGE_KEYS.COLLECTIONS, []);
    this.set(STORAGE_KEYS.DAILY_HISAB, []);
    this.set(STORAGE_KEYS.REPO_RELEASES, []);
    this.logAudit('System', 'DELETE', 'all', 'Cleared all cases, collections, hisab and repo entries');
  }

  deleteCollection(id: string): boolean {
    const list = this.getCollections();
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    const removed = list.splice(idx, 1)[0];
    this.set(STORAGE_KEYS.COLLECTIONS, list);
    this.logAudit('Collection', 'DELETE', id, `Deleted collection receipt ${removed.receiptNumber} for ₹${removed.collectionAmount}`);
    if (removed.date) {
      try {
        this.refreshDailyHisabTotals(removed.date);
      } catch {}
    }
    return true;
  }

  // Bulk Import Cases (Supports updating existing or inserting new)
  bulkImportCases(records: Partial<CaseRecord>[]): {
    inserted: number;
    updated: number;
    errors: string[];
  } {
    const cases = this.getCases();
    const companies = this.getFinanceCompanies();
    const officers = this.getOfficers();
    let inserted = 0;
    let updated = 0;
    const errors: string[] = [];

    records.forEach((raw, idx) => {
      const rowNum = idx + 1;
      const loanNo = String(raw.loanAgreementNumber || '').trim();
      const customerName = String(raw.customerName || '').trim();

      if (!loanNo) {
        errors.push(`Row ${rowNum}: Missing Loan Agreement Number`);
        return;
      }
      if (!customerName) {
        errors.push(`Row ${rowNum} (${loanNo}): Missing Customer Name`);
        return;
      }

      // Match Finance Company by name or id
      let finCo = companies.find(
        (fc) =>
          fc.id === raw.financeCompanyId ||
          fc.name.toLowerCase() === String(raw.financeCompanyName || '').toLowerCase() ||
          fc.shortName.toLowerCase() === String(raw.financeCompanyName || '').toLowerCase()
      );
      if (!finCo) {
        const coName = String(raw.financeCompanyName || '').trim() || 'General Financier';
        finCo = {
          id: 'fc-' + Date.now() + '-' + idx,
          name: coName,
          shortName: coName,
          contactPerson: '',
          mobile: '',
          email: '',
          address: '',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
        };
        companies.push(finCo);
        this.set(STORAGE_KEYS.FINANCE_COMPANIES, companies);
      }

      // Match Officer if given
      let officer = officers.find(
        (o) =>
          o.id === raw.assignedOfficerId ||
          o.name.toLowerCase() === String(raw.assignedOfficerName || '').toLowerCase() ||
          o.employeeId.toLowerCase() === String(raw.assignedOfficerName || '').toLowerCase()
      );

      const existingIdx = cases.findIndex(
        (c) =>
          c.loanAgreementNumber.toLowerCase() === loanNo.toLowerCase() ||
          (raw.applicationId && c.applicationId.toLowerCase() === String(raw.applicationId).toLowerCase())
      );

      const caseData: CaseRecord = {
        id: existingIdx !== -1 ? cases[existingIdx].id : 'case-imp-' + Date.now() + '-' + idx,
        financeCompanyId: finCo.id,
        financeCompanyName: finCo.shortName,
        loanAgreementNumber: loanNo,
        applicationId: raw.applicationId ? String(raw.applicationId) : 'APP-' + Math.floor(100000 + Math.random() * 900000),
        customerName: customerName,
        customerMobile: String(raw.customerMobile || '9800000000'),
        alternateMobile: raw.alternateMobile ? String(raw.alternateMobile) : '',
        customerAddress: String(raw.customerAddress || 'Dahod District'),
        city: String(raw.city || 'Dahod'),
        state: String(raw.state || 'Gujarat'),
        pincode: String(raw.pincode || '389151'),
        loanAmount: Number(raw.loanAmount) || 50000,
        emiAmount: Number(raw.emiAmount) || 2500,
        tenure: Number(raw.tenure) || 24,
        paidEmi: Number(raw.paidEmi) || 0,
        pendingEmi: Number(raw.pendingEmi) || 1,
        tos: Number(raw.tos) || Number(raw.emiAmount || 2500),
        pos: Number(raw.pos) || Number(raw.loanAmount || 50000),
        bkt: String(raw.bkt || 'BKT-1'),
        assetMake: String(raw.assetMake || 'Two Wheeler'),
        model: String(raw.model || 'Standard Model'),
        registrationNumber: String(raw.registrationNumber || 'GJ-20-REG-PENDING'),
        engineNumber: raw.engineNumber ? String(raw.engineNumber) : '',
        chassisNumber: raw.chassisNumber ? String(raw.chassisNumber) : '',
        loanBookingDate: raw.loanBookingDate ? String(raw.loanBookingDate) : '2024-01-01',
        loanMaturityDate: raw.loanMaturityDate ? String(raw.loanMaturityDate) : '2026-01-01',
        dealerName: raw.dealerName ? String(raw.dealerName) : '',
        referenceName: raw.referenceName ? String(raw.referenceName) : '',
        referenceMobile: raw.referenceMobile ? String(raw.referenceMobile) : '',
        referenceAddress: raw.referenceAddress ? String(raw.referenceAddress) : '',
        assignedOfficerId: officer?.id || raw.assignedOfficerId,
        assignedOfficerName: officer?.name || raw.assignedOfficerName,
        priority: (raw.priority as any) || 'MEDIUM',
        status: String(raw.status || 'NEW').toUpperCase(),
        remarks: raw.remarks ? String(raw.remarks) : 'Imported via Excel Batch',
        customFields: raw.customFields || {},
        createdAt: existingIdx !== -1 ? cases[existingIdx].createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (existingIdx !== -1) {
        cases[existingIdx] = caseData;
        updated++;
      } else {
        cases.push(caseData);
        inserted++;
      }
    });

    this.set(STORAGE_KEYS.CASES, cases);
    this.logAudit(
      'Excel Import',
      'IMPORT',
      `batch-${Date.now()}`,
      `Imported ${records.length} rows. Inserted: ${inserted}, Updated: ${updated}, Errors: ${errors.length}`
    );

    return { inserted, updated, errors };
  }

  // Collections
  getCollections(): CollectionRecord[] {
    return this.get<CollectionRecord[]>(STORAGE_KEYS.COLLECTIONS, []);
  }

  addCollection(
    data: Omit<CollectionRecord, 'id' | 'receiptNumber' | 'createdAt'>
  ): { collection: CollectionRecord; caseUpdated?: CaseRecord } {
    const collections = this.getCollections();
    const count = collections.length + 1;
    const receiptNumber = `LGA-REC-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;

    const newCol: CollectionRecord = {
      ...data,
      id: 'col-' + Date.now(),
      receiptNumber,
      createdAt: new Date().toISOString(),
    };
    collections.unshift(newCol);
    this.set(STORAGE_KEYS.COLLECTIONS, collections);

    // Auto-update Case: decrease TOS, increment paidEmi, set status
    let caseUpdated: CaseRecord | undefined;
    if (data.caseId) {
      const c = this.getCaseById(data.caseId);
      if (c) {
        const newTos = Math.max(0, c.tos - data.collectionAmount);
        const newPaidEmi = c.emiAmount > 0 ? c.paidEmi + Math.floor(data.collectionAmount / c.emiAmount) : c.paidEmi;
        const newPendingEmi = Math.max(0, c.pendingEmi - Math.floor(data.collectionAmount / (c.emiAmount || 1)));
        const newStatus = newTos === 0 ? 'PAID' : 'PARTIAL PAID';

        caseUpdated = this.updateCase(c.id, {
          tos: newTos,
          paidEmi: newPaidEmi,
          pendingEmi: newPendingEmi,
          status: newStatus,
        }) || undefined;
      }
    }

    // Auto-calculate Payout if officer is assigned
    if (data.officerId) {
      this.evaluatePayoutsForCollection(newCol);
    }

    // Auto-update Daily Hisab collection total for today
    this.refreshDailyHisabTotals(data.date);

    this.logAudit(
      'Collection',
      'CREATE',
      newCol.id,
      `Recorded collection ₹${newCol.collectionAmount} from ${newCol.customerName}. Receipt: ${newCol.receiptNumber}`
    );

    return { collection: newCol, caseUpdated };
  }

  // Daily Hisab
  getDailyHisabList(): DailyHisabRecord[] {
    return this.get<DailyHisabRecord[]>(STORAGE_KEYS.DAILY_HISAB, []);
  }

  getDailyHisabByDate(dateStr: string): DailyHisabRecord {
    const list = this.getDailyHisabList();
    let record = list.find((h) => h.date === dateStr);
    if (!record) {
      // Find previous day's closing amount to use as opening
      const sorted = [...list].sort((a, b) => b.date.localeCompare(a.date));
      const prev = sorted.find((h) => h.date < dateStr);
      const opening = prev ? (Number(prev.closingAmount) || 0) : 0;

      record = {
        id: 'hisab-' + dateStr,
        date: dateStr,
        openingAmount: opening,
        collectionTotal: 0,
        expensesTotal: 0,
        payoutTotal: 0,
        otherDeductions: 0,
        closingAmount: opening,
        isLocked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      list.push(record);
      this.set(STORAGE_KEYS.DAILY_HISAB, list);
    }
    return record;
  }

  refreshDailyHisabTotals(dateStr: string): DailyHisabRecord {
    const list = this.getDailyHisabList();
    let record = this.getDailyHisabByDate(dateStr);

    const collections = this.getCollections().filter((c) => c.date === dateStr);
    const colTotal = collections.reduce((acc, c) => acc + c.collectionAmount, 0);

    const expenses = this.getExpenses().filter((e) => e.date === dateStr);
    const expTotal = expenses.reduce((acc, e) => acc + e.amount, 0);

    const payouts = this.getPayouts().filter((p) => p.date === dateStr && p.status === 'PAID');
    const payTotal = payouts.reduce((acc, p) => acc + p.payoutAmount, 0);

    record.collectionTotal = colTotal;
    record.expensesTotal = expTotal;
    record.payoutTotal = payTotal;
    record.closingAmount =
      record.openingAmount + colTotal - expTotal - payTotal - (record.otherDeductions || 0);
    record.updatedAt = new Date().toISOString();

    const idx = list.findIndex((h) => h.date === dateStr);
    if (idx !== -1) list[idx] = record;
    this.set(STORAGE_KEYS.DAILY_HISAB, list);
    return record;
  }

  saveDailyHisab(record: DailyHisabRecord): DailyHisabRecord {
    const list = this.getDailyHisabList();
    record.closingAmount =
      record.openingAmount +
      record.collectionTotal -
      record.expensesTotal -
      record.payoutTotal -
      (record.otherDeductions || 0);
    record.updatedAt = new Date().toISOString();

    const idx = list.findIndex((h) => h.id === record.id || h.date === record.date);
    if (idx !== -1) {
      list[idx] = record;
    } else {
      list.push(record);
    }
    this.set(STORAGE_KEYS.DAILY_HISAB, list);
    this.logAudit('Daily Hisab', 'UPDATE', record.id, `Updated Hisab for ${record.date}. Closing: ₹${record.closingAmount}`);
    return record;
  }

  getPreviousDayClosingBalance(dateStr: string): number {
    const list = this.getDailyHisabList();
    const sorted = [...list].sort((a, b) => b.date.localeCompare(a.date));
    const prev = sorted.find((h) => h.date < dateStr);
    return prev ? (Number(prev.closingAmount) || 0) : 0;
  }

  setDailyBalances(params: {
    date: string;
    openingAmount: number;
    otherDeductions?: number;
    notes?: string;
    isLocked?: boolean;
    denominations?: DailyHisabRecord['denominations'];
  }): DailyHisabRecord {
    const hisab = this.getDailyHisabByDate(params.date);
    hisab.openingAmount = Number(params.openingAmount) || 0;
    if (params.otherDeductions !== undefined) {
      hisab.otherDeductions = Number(params.otherDeductions) || 0;
    }
    if (params.notes !== undefined) {
      hisab.notes = params.notes;
    }
    if (params.isLocked !== undefined) {
      hisab.isLocked = params.isLocked;
    }
    if (params.denominations !== undefined) {
      hisab.denominations = params.denominations;
    }
    const saved = this.saveDailyHisab(hisab);
    this.logAudit(
      'Daily Hisab',
      'UPDATE',
      saved.id,
      `Balance updated for ${params.date}: Opening ₹${saved.openingAmount}, Closing ₹${saved.closingAmount}`
    );
    return saved;
  }

  // Expenses
  getExpenses(): ExpenseRecord[] {
    return this.get<ExpenseRecord[]>(STORAGE_KEYS.EXPENSES, []);
  }

  addExpense(data: Omit<ExpenseRecord, 'id' | 'createdAt'>): ExpenseRecord {
    const expenses = this.getExpenses();
    const newExp: ExpenseRecord = {
      ...data,
      id: 'exp-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    expenses.unshift(newExp);
    this.set(STORAGE_KEYS.EXPENSES, expenses);
    this.refreshDailyHisabTotals(data.date);
    this.logAudit('Expense', 'CREATE', newExp.id, `Recorded ₹${newExp.amount} for ${newExp.category} (${newExp.paidTo})`);
    return newExp;
  }

  deleteExpense(id: string): boolean {
    const expenses = this.getExpenses();
    const target = expenses.find((e) => e.id === id);
    if (!target) return false;
    const remaining = expenses.filter((e) => e.id !== id);
    this.set(STORAGE_KEYS.EXPENSES, remaining);
    this.refreshDailyHisabTotals(target.date);
    this.logAudit('Expense', 'DELETE', id, `Deleted ₹${target.amount} expense for ${target.category} (${target.paidTo})`, target);
    return true;
  }

  // Officers
  getOfficers(): OfficerRecord[] {
    return this.get<OfficerRecord[]>(STORAGE_KEYS.OFFICERS, []);
  }

  addOfficer(data: Omit<OfficerRecord, 'id' | 'createdAt'>): OfficerRecord {
    const officers = this.getOfficers();
    const newOfficer: OfficerRecord = {
      ...data,
      id: 'off-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    officers.push(newOfficer);
    this.set(STORAGE_KEYS.OFFICERS, officers);
    this.logAudit('Officer', 'CREATE', newOfficer.id, `Added Officer ${newOfficer.name} (${newOfficer.employeeId})`);
    return newOfficer;
  }

  updateOfficer(id: string, updates: Partial<OfficerRecord>): OfficerRecord | null {
    const officers = this.getOfficers();
    const idx = officers.findIndex((o) => o.id === id);
    if (idx === -1) return null;
    const old = officers[idx];
    const updated = { ...old, ...updates };
    officers[idx] = updated;
    this.set(STORAGE_KEYS.OFFICERS, officers);
    this.logAudit('Officer', 'UPDATE', id, `Updated officer ${updated.name}`, old, updated);
    return updated;
  }

  deleteOfficer(id: string): boolean {
    const officers = this.getOfficers();
    const idx = officers.findIndex((o) => o.id === id);
    if (idx === -1) return false;
    const removed = officers.splice(idx, 1)[0];
    this.set(STORAGE_KEYS.OFFICERS, officers);
    this.logAudit('Officer', 'DELETE', id, `Deleted officer ${removed.name} (${removed.employeeId})`);
    return true;
  }

  clearAllOfficers(): void {
    const count = this.getOfficers().length;
    this.set(STORAGE_KEYS.OFFICERS, []);
    this.logAudit('Officer', 'DELETE', 'all', `Cleared all ${count} officer entries`);
  }

  // Attendance
  getAttendance(): AttendanceRecord[] {
    return this.get<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, []);
  }

  markAttendance(data: Omit<AttendanceRecord, 'id' | 'createdAt'>): AttendanceRecord {
    const list = this.getAttendance();
    const existingIdx = list.findIndex((a) => a.officerId === data.officerId && a.date === data.date);
    const record: AttendanceRecord = {
      ...data,
      id: existingIdx !== -1 ? list[existingIdx].id : 'att-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    if (existingIdx !== -1) {
      list[existingIdx] = record;
    } else {
      list.push(record);
    }
    this.set(STORAGE_KEYS.ATTENDANCE, list);
    this.logAudit('Attendance', 'CREATE', record.id, `Marked ${record.status} for ${record.officerName} on ${record.date}`);
    return record;
  }

  // Salaries
  getSalaries(): SalaryRecord[] {
    return this.get<SalaryRecord[]>(STORAGE_KEYS.SALARIES, []);
  }

  calculateSalaryForOfficer(officerId: string, month: string): SalaryRecord {
    const officer = this.getOfficers().find((o) => o.id === officerId);
    if (!officer) {
      return {
        id: `sal-${officerId}-${month}`,
        officerId,
        officerName: 'Staff Member',
        month,
        basicSalary: 20000,
        incentive: 0,
        collectionIncentive: 0,
        repoIncentive: 0,
        deduction: 0,
        advance: 0,
        other: 0,
        netSalary: 20000,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };
    }

    const basicSalary = officer.salary || 20000;

    // Calculate collections made by officer in this month
    const collections = this.getCollections().filter(
      (c) => c.officerId === officerId && c.date.startsWith(month)
    );
    const totalCollected = collections.reduce((acc, c) => acc + c.collectionAmount, 0);

    // Collection incentive: e.g. 1.5% if target met, else 1%
    const isTargetMet = totalCollected >= (officer.target || 200000);
    const collectionIncentive = Math.round(totalCollected * (isTargetMet ? 0.02 : 0.01));

    // Repos completed by this officer
    const repos = this.getVehicleYards().filter(
      (v) => (v.repoAgentName?.includes(officer.name) || v.repoAgentMobile === officer.mobile) && v.repoDate.startsWith(month)
    );
    const repoIncentive = repos.length * 500; // ₹500 per repo

    const deduction = 0;
    const advance = 0;
    const other = 0;
    const incentive = isTargetMet ? 2000 : 0; // ₹2000 target bonus

    const netSalary = basicSalary + incentive + collectionIncentive + repoIncentive - deduction - advance + other;

    const record: SalaryRecord = {
      id: `sal-${officerId}-${month}`,
      officerId,
      officerName: officer.name,
      month,
      basicSalary,
      incentive,
      collectionIncentive,
      repoIncentive,
      deduction,
      advance,
      other,
      netSalary,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    return record;
  }

  saveSalary(record: SalaryRecord): SalaryRecord {
    const salaries = this.getSalaries();
    const idx = salaries.findIndex((s) => s.id === record.id || (s.officerId === record.officerId && s.month === record.month));
    record.netSalary =
      record.basicSalary +
      record.incentive +
      record.collectionIncentive +
      record.repoIncentive -
      record.deduction -
      record.advance +
      record.other;

    if (idx !== -1) {
      salaries[idx] = record;
    } else {
      salaries.push(record);
    }
    this.set(STORAGE_KEYS.SALARIES, salaries);
    this.logAudit('Salary', 'UPDATE', record.id, `Salary saved for ${record.officerName} (${record.month}): Net ₹${record.netSalary}`);
    return record;
  }

  // Payouts
  getPayoutRules(): PayoutRule[] {
    return this.get<PayoutRule[]>(STORAGE_KEYS.PAYOUT_RULES, []);
  }

  savePayoutRule(rule: PayoutRule): PayoutRule {
    const rules = this.getPayoutRules();
    const idx = rules.findIndex((r) => r.id === rule.id);
    if (idx !== -1) {
      rules[idx] = rule;
    } else {
      rules.push(rule);
    }
    this.set(STORAGE_KEYS.PAYOUT_RULES, rules);
    this.logAudit('Payout Rules', 'UPDATE', rule.id, `Saved payout rule: ${rule.title}`);
    return rule;
  }

  getPayouts(): PayoutRecord[] {
    return this.get<PayoutRecord[]>(STORAGE_KEYS.PAYOUTS, []);
  }

  private evaluatePayoutsForCollection(col: CollectionRecord): void {
    if (!col.officerId || !col.collectionAmount) return;
    const rules = this.getPayoutRules().filter((r) => r.status === 'ACTIVE');
    const officer = this.getOfficers().find((o) => o.id === col.officerId);
    if (!officer) return;

    for (const rule of rules) {
      if (rule.officerId && rule.officerId !== col.officerId) continue;
      if (rule.financeCompanyId && rule.financeCompanyId !== col.financeCompanyId) continue;
      if (rule.collectionType && rule.collectionType !== col.collectionType) continue;

      let payoutAmount = 0;
      if (rule.method === 'PER_RECEIPT') {
        payoutAmount = rule.rate;
      } else {
        payoutAmount = Math.round((col.collectionAmount * rule.rate) / 100);
      }

      const payoutRecord: PayoutRecord = {
        id: 'pay-' + Date.now(),
        collectionId: col.id,
        officerId: officer.id,
        officerName: officer.name,
        financeCompanyName: col.financeCompanyName,
        collectionAmount: col.collectionAmount,
        payoutMethod: rule.method,
        payoutRate: rule.rate,
        payoutAmount,
        date: col.date,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };

      const payouts = this.getPayouts();
      payouts.unshift(payoutRecord);
      this.set(STORAGE_KEYS.PAYOUTS, payouts);
      break; // apply highest priority matching rule
    }
  }

  updatePayoutStatus(id: string, status: PayoutRecord['status']): void {
    const payouts = this.getPayouts();
    const idx = payouts.findIndex((p) => p.id === id);
    if (idx === -1) return;
    payouts[idx].status = status;
    this.set(STORAGE_KEYS.PAYOUTS, payouts);
    this.refreshDailyHisabTotals(payouts[idx].date);
    this.logAudit('Payout', 'APPROVE', id, `Updated payout status to ${status} for ${payouts[idx].officerName}`);
  }

  // Vehicles & Yard
  getVehicleYards(): VehicleYardRecord[] {
    return this.get<VehicleYardRecord[]>(STORAGE_KEYS.VEHICLE_YARDS, []);
  }

  addVehicleYard(data: Omit<VehicleYardRecord, 'id' | 'createdAt' | 'updatedAt'>): VehicleYardRecord {
    const list = this.getVehicleYards();
    const newRecord: VehicleYardRecord = {
      ...data,
      id: 'yard-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.unshift(newRecord);
    this.set(STORAGE_KEYS.VEHICLE_YARDS, list);

    // Update case status if linked
    if (data.caseId) {
      this.updateCase(data.caseId, { status: 'REPO' });
    }

    this.logAudit('Vehicle Yard', 'CREATE', newRecord.id, `Logged vehicle ${newRecord.vehicleNumber} into ${newRecord.yardName}`);
    return newRecord;
  }

  updateVehicleYard(id: string, updates: Partial<VehicleYardRecord>): VehicleYardRecord | null {
    const list = this.getVehicleYards();
    const idx = list.findIndex((v) => v.id === id);
    if (idx === -1) return null;
    const old = list[idx];
    const updated = { ...old, ...updates, updatedAt: new Date().toISOString() };
    list[idx] = updated;
    this.set(STORAGE_KEYS.VEHICLE_YARDS, list);
    this.logAudit('Vehicle Yard', 'UPDATE', id, `Updated vehicle ${updated.vehicleNumber}`, old, updated);
    return updated;
  }

  deleteVehicleYard(id: string): boolean {
    const list = this.getVehicleYards();
    const target = list.find((v) => v.id === id);
    if (!target) return false;
    const remaining = list.filter((v) => v.id !== id);
    this.set(STORAGE_KEYS.VEHICLE_YARDS, remaining);
    this.logAudit('Vehicle Yard', 'DELETE', id, `Deleted vehicle entry ${target.vehicleNumber} (${target.customerName}) from ${target.yardName}`, target);
    return true;
  }

  // Repo Releases
  getRepoReleases(): RepoReleaseRecord[] {
    return this.get<RepoReleaseRecord[]>(STORAGE_KEYS.REPO_RELEASES, []);
  }

  deleteRepoRelease(id: string): boolean {
    const list = this.getRepoReleases();
    const target = list.find((r) => r.id === id);
    if (!target) return false;
    const remaining = list.filter((r) => r.id !== id);
    this.set(STORAGE_KEYS.REPO_RELEASES, remaining);
    this.logAudit('Repo Release', 'DELETE', id, `Deleted release entry for vehicle ${target.vehicleNumber} (${target.customerName})`, target);
    return true;
  }

  // SAME-DAY RELEASE (ATOMIC 1-STEP TRANSACTION)
  processSameDayRelease(params: {
    vehicleYardId?: string;
    caseId?: string;
    financeCompanyId: string;
    financeCompanyName: string;
    vehicleNumber: string;
    customerName: string;
    loanAgreementNumber: string;
    vehicleMake: string;
    model: string;
    repoDate: string;
    repoTime: string;
    releaseDate: string;
    releaseTime: string;
    yardName: string;
    yardTime: string;
    customerReleasePayment: number;
    paymentMode: string;
    repoAgentName: string;
    repoAgentMobile: string;
    repoAgentCharge: number;
    otherCharges: number;
    remarks: string;
  }): {
    repoRelease: RepoReleaseRecord;
    collection: CollectionRecord;
    vehicleYard: VehicleYardRecord;
  } {
    const today = params.releaseDate || new Date().toISOString().split('T')[0];

    // 1. Create or Update Vehicle Yard Record
    let yardRecord: VehicleYardRecord;
    if (params.vehicleYardId) {
      const existing = this.getVehicleYards().find((v) => v.id === params.vehicleYardId);
      if (existing) {
        yardRecord = this.updateVehicleYard(params.vehicleYardId, {
          vehicleStatus: 'RELEASED SAME DAY',
          releaseDate: params.releaseDate,
          releaseTime: params.releaseTime,
          releaseRemarks: `Same-day release executed. Paid ₹${params.customerReleasePayment}`,
          parkingCharges: params.otherCharges,
          repoAgentCharge: params.repoAgentCharge,
          totalExpense: params.repoAgentCharge + params.otherCharges,
        })!;
      } else {
        throw new Error('Vehicle yard record not found');
      }
    } else {
      yardRecord = this.addVehicleYard({
        caseId: params.caseId,
        financeCompanyId: params.financeCompanyId,
        financeCompanyName: params.financeCompanyName,
        vehicleNumber: params.vehicleNumber,
        customerName: params.customerName,
        loanAgreementNumber: params.loanAgreementNumber,
        vehicleMake: params.vehicleMake,
        model: params.model,
        repoDate: params.repoDate,
        repoTime: params.repoTime,
        yardName: params.yardName,
        yardEntryTime: params.yardTime,
        vehicleCondition: 'Same day custody release',
        parkingCharges: params.otherCharges,
        otherCharges: 0,
        totalExpense: params.repoAgentCharge + params.otherCharges,
        vehicleStatus: 'RELEASED SAME DAY',
        releaseDate: params.releaseDate,
        releaseTime: params.releaseTime,
        releaseRemarks: params.remarks,
        repoAgentName: params.repoAgentName,
        repoAgentMobile: params.repoAgentMobile,
        repoAgentCharge: params.repoAgentCharge,
      });
    }

    // 2. Create Collection Record for Customer Release Payment
    const { collection } = this.addCollection({
      date: today,
      caseId: params.caseId || '',
      loanAgreementNumber: params.loanAgreementNumber,
      customerName: params.customerName,
      vehicleNumber: params.vehicleNumber,
      financeCompanyId: params.financeCompanyId,
      financeCompanyName: params.financeCompanyName,
      collectionAmount: params.customerReleasePayment,
      paymentMode: params.paymentMode,
      collectionType: 'Repo Release Payment',
      remarks: `Same-Day Release settlement: ${params.remarks}`,
    });

    // 3. Create Repo Expense Record for Agent charge
    if (params.repoAgentCharge > 0) {
      this.addExpense({
        date: today,
        category: 'Repo Agent Charge',
        amount: params.repoAgentCharge,
        paidTo: params.repoAgentName || 'Repo Agent',
        receiptNumber: `RPO-EXP-${Date.now().toString().slice(-4)}`,
        remarks: `Repo incentive for ${params.vehicleNumber}`,
      });
    }

    // 4. Create RepoRelease record
    const releases = this.getRepoReleases();
    const repoReleaseRecord: RepoReleaseRecord = {
      id: 'rel-' + Date.now(),
      vehicleYardId: yardRecord.id,
      caseId: params.caseId,
      financeCompanyId: params.financeCompanyId,
      financeCompanyName: params.financeCompanyName,
      vehicleNumber: params.vehicleNumber,
      customerName: params.customerName,
      loanAgreementNumber: params.loanAgreementNumber,
      repoAgentName: params.repoAgentName,
      repoAgentMobile: params.repoAgentMobile,
      repoDate: params.repoDate,
      repoTime: params.repoTime,
      yardName: params.yardName,
      yardTime: params.yardTime,
      vehicleStatus: 'RELEASED SAME DAY',
      releaseDate: params.releaseDate,
      releaseTime: params.releaseTime,
      customerReleasePayment: params.customerReleasePayment,
      repoAgentCharge: params.repoAgentCharge,
      otherCharges: params.otherCharges,
      paymentMode: params.paymentMode,
      receiptNumber: collection.receiptNumber,
      isSameDayRelease: true,
      remarks: params.remarks,
      createdAt: new Date().toISOString(),
    };
    releases.unshift(repoReleaseRecord);
    this.set(STORAGE_KEYS.REPO_RELEASES, releases);

    // 5. Update Case Status if linked
    if (params.caseId) {
      this.updateCase(params.caseId, {
        status: 'PAID',
        remarks: `Vehicle repossessed and released same day. Payment: ₹${params.customerReleasePayment}`,
      });
    }

    // 6. Refresh Daily Hisab
    this.refreshDailyHisabTotals(today);

    // 7. Audit Log
    this.logAudit(
      'Repo Release',
      'CREATE',
      repoReleaseRecord.id,
      `Executed SAME-DAY RELEASE for ${params.vehicleNumber} (${params.customerName}). Collection: ₹${params.customerReleasePayment}, Repo Charge: ₹${params.repoAgentCharge}`
    );

    return {
      repoRelease: repoReleaseRecord,
      collection,
      vehicleYard: yardRecord,
    };
  }

  // Visits
  getVisits(): VisitRecord[] {
    return this.get<VisitRecord[]>(STORAGE_KEYS.VISITS, []);
  }

  addVisit(data: Omit<VisitRecord, 'id' | 'createdAt'>): VisitRecord {
    const list = this.getVisits();
    const newVisit: VisitRecord = {
      ...data,
      id: 'vis-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    list.unshift(newVisit);
    this.set(STORAGE_KEYS.VISITS, list);

    // Update case status if PTP or other
    if (data.status === 'Promise to Pay' && data.ptpDate) {
      this.updateCase(data.caseId, {
        status: 'PROMISE TO PAY',
        remarks: `PTP recorded on visit: ${data.remarks} (Date: ${data.ptpDate})`,
      });
    }

    this.logAudit('Field Visit', 'CREATE', newVisit.id, `Visit logged for case ${newVisit.caseId} by ${newVisit.officerName}`);
    return newVisit;
  }

  // Custom Fields Builder
  getCustomFields(module?: string): CustomFieldDefinition[] {
    const fields = this.get<CustomFieldDefinition[]>(STORAGE_KEYS.CUSTOM_FIELDS, []);
    if (module) {
      return fields.filter((f) => f.module === module && f.active).sort((a, b) => a.fieldOrder - b.fieldOrder);
    }
    return fields.sort((a, b) => a.fieldOrder - b.fieldOrder);
  }

  saveCustomField(def: CustomFieldDefinition): CustomFieldDefinition {
    const fields = this.get<CustomFieldDefinition[]>(STORAGE_KEYS.CUSTOM_FIELDS, []);
    const idx = fields.findIndex((f) => f.id === def.id);
    if (idx !== -1) {
      fields[idx] = def;
    } else {
      fields.push(def);
    }
    this.set(STORAGE_KEYS.CUSTOM_FIELDS, fields);
    this.logAudit('Custom Field', 'UPDATE', def.id, `Saved field ${def.displayName} for ${def.module}`);
    return def;
  }

  deleteCustomField(id: string): void {
    const fields = this.get<CustomFieldDefinition[]>(STORAGE_KEYS.CUSTOM_FIELDS, []);
    const idx = fields.findIndex((f) => f.id === id);
    if (idx !== -1) {
      // Soft disable so historic data isn't deleted
      fields[idx].active = false;
      this.set(STORAGE_KEYS.CUSTOM_FIELDS, fields);
      this.logAudit('Custom Field', 'DELETE', id, `Deactivated custom field ${fields[idx].displayName}`);
    }
  }

  // Dashboard Aggregates Calculation (Real-time from Database)
  getDashboardMetrics() {
    const cases = this.getCases();
    const collections = this.getCollections();
    const yards = this.getVehicleYards();
    const officers = this.getOfficers().filter((o) => o.status === 'ACTIVE');
    const attendance = this.getAttendance();

    const todayStr = new Date().toISOString().split('T')[0];
    const currentMonth = todayStr.substring(0, 7); // YYYY-MM

    const totalCases = cases.length;
    const totalPos = cases.reduce((acc, c) => acc + (Number(c.pos) || 0), 0);
    const totalTos = cases.reduce((acc, c) => acc + (Number(c.tos) || 0), 0);

    const paidCases = cases.filter((c) => c.status === 'PAID').length;
    const unpaidCases = cases.filter((c) => c.status !== 'PAID').length;
    const pendingCases = cases.filter((c) => ['NEW', 'ALLOCATED', 'CONTACTED', 'REPO PENDING'].includes(c.status)).length;

    // Collections
    const todayCollections = collections.filter((c) => c.date === todayStr);
    const todayCollectionAmount = todayCollections.reduce((acc, c) => acc + c.collectionAmount, 0);

    const monthlyCollections = collections.filter((c) => c.date.startsWith(currentMonth));
    const monthlyCollectionAmount = monthlyCollections.reduce((acc, c) => acc + c.collectionAmount, 0);

    // Repo & Release
    const todayRepoCount = yards.filter((y) => y.repoDate === todayStr).length;
    const todayReleaseCount = yards.filter((y) => y.releaseDate === todayStr).length;
    const sameDayReleaseCount = yards.filter((y) => y.vehicleStatus === 'RELEASED SAME DAY' && y.releaseDate === todayStr).length;

    const vehiclesInYard = yards.filter((y) => ['REPO', 'IN YARD'].includes(y.vehicleStatus)).length;

    // Attendance
    const todayPresentCount = attendance.filter((a) => a.date === todayStr && a.status === 'Present').length;

    // Targets & DRR (Daily Run Rate)
    const totalTarget = officers.reduce((acc, o) => acc + (Number(o.target) || 250000), 0);
    const shortfall = Math.max(0, totalTarget - monthlyCollectionAmount);

    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const remainingDays = Math.max(1, daysInMonth - now.getDate() + 1);
    const drr = Math.round(shortfall / remainingDays);

    // Today's Daily Hisab & Safe Balances
    const todayHisab = this.getDailyHisabByDate(todayStr);
    const openingBalance = Number(todayHisab.openingAmount) || 0;
    const closingBalance = Number(todayHisab.closingAmount) || 0;
    const todayExpensesAmount = Number(todayHisab.expensesTotal) || 0;
    const todayPayoutsAmount = Number(todayHisab.payoutTotal) || 0;
    const todayDeductionsAmount = Number(todayHisab.otherDeductions) || 0;
    const isHisabLocked = Boolean(todayHisab.isLocked);

    return {
      totalCases,
      totalPos,
      totalTos,
      paidCases,
      unpaidCases,
      pendingCases,
      todayCollectionAmount,
      todayCollectionCount: todayCollections.length,
      monthlyCollectionAmount,
      todayRepoCount,
      todayReleaseCount,
      sameDayReleaseCount,
      vehiclesInYard,
      activeOfficersCount: officers.length,
      todayAttendanceCount: todayPresentCount,
      totalTarget,
      shortfall,
      remainingDays,
      drr,
      openingBalance,
      closingBalance,
      todayExpensesAmount,
      todayPayoutsAmount,
      todayDeductionsAmount,
      isHisabLocked,
    };
  }

  // Backup & Restore
  exportDatabaseJson(): string {
    const dump = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      company: 'LION GROUP AGENCY, DAHOD',
      users: this.getUsers(),
      financeCompanies: this.getFinanceCompanies(),
      cases: this.getCases(),
      collections: this.getCollections(),
      expenses: this.getExpenses(),
      dailyHisab: this.getDailyHisabList(),
      officers: this.getOfficers(),
      attendance: this.getAttendance(),
      salaries: this.getSalaries(),
      payoutRules: this.getPayoutRules(),
      payouts: this.getPayouts(),
      vehicleYards: this.getVehicleYards(),
      repoReleases: this.getRepoReleases(),
      visits: this.getVisits(),
      customFields: this.getCustomFields(),
      auditLogs: this.getAuditLogs(),
      settings: this.getSettings(),
      permissions: this.getPermissions(),
    };
    return JSON.stringify(dump, null, 2);
  }

  restoreDatabaseJson(jsonString: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonString);
      if (!data.cases || !data.financeCompanies) {
        return { success: false, message: 'Invalid backup file format' };
      }
      if (data.users) this.set(STORAGE_KEYS.USERS, data.users);
      if (data.financeCompanies) this.set(STORAGE_KEYS.FINANCE_COMPANIES, data.financeCompanies);
      if (data.cases) this.set(STORAGE_KEYS.CASES, data.cases);
      if (data.collections) this.set(STORAGE_KEYS.COLLECTIONS, data.collections);
      if (data.expenses) this.set(STORAGE_KEYS.EXPENSES, data.expenses);
      if (data.dailyHisab) this.set(STORAGE_KEYS.DAILY_HISAB, data.dailyHisab);
      if (data.officers) this.set(STORAGE_KEYS.OFFICERS, data.officers);
      if (data.attendance) this.set(STORAGE_KEYS.ATTENDANCE, data.attendance);
      if (data.salaries) this.set(STORAGE_KEYS.SALARIES, data.salaries);
      if (data.payoutRules) this.set(STORAGE_KEYS.PAYOUT_RULES, data.payoutRules);
      if (data.payouts) this.set(STORAGE_KEYS.PAYOUTS, data.payouts);
      if (data.vehicleYards) this.set(STORAGE_KEYS.VEHICLE_YARDS, data.vehicleYards);
      if (data.repoReleases) this.set(STORAGE_KEYS.REPO_RELEASES, data.repoReleases);
      if (data.visits) this.set(STORAGE_KEYS.VISITS, data.visits);
      if (data.customFields) this.set(STORAGE_KEYS.CUSTOM_FIELDS, data.customFields);
      if (data.settings) this.set(STORAGE_KEYS.SETTINGS, data.settings);
      if (data.permissions) this.set(STORAGE_KEYS.PERMISSIONS, data.permissions);

      this.logAudit('Database Backup', 'IMPORT', 'restore', `Restored database backup from ${data.timestamp || 'file'}`);
      return { success: true, message: 'Database successfully restored!' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Failed to parse JSON file' };
    }
  }

  resetToDefault(): void {
    if (typeof window === 'undefined') return;
    localStorage.clear();
    this.initDatabase();
    this.logAudit('System', 'DELETE', 'reset', 'Database reset to initial Lion Group Agency factory defaults');
  }

  // Clear demo operational data while preserving real system setup:
  // Preserves: Finance Companies (TVS, HDFC, Hero, Hinduja), Admin logins, Settings, Roles, Custom fields
  // Clears: Cases, Collections, Expenses, Hisab, Yard vehicles, Repo releases, Payouts, Attendance
  clearDemoDataForProduction(): void {
    this.set(STORAGE_KEYS.CASES, []);
    this.set(STORAGE_KEYS.COLLECTIONS, []);
    this.set(STORAGE_KEYS.EXPENSES, []);
    this.set(STORAGE_KEYS.DAILY_HISAB, []);
    this.set(STORAGE_KEYS.VEHICLE_YARDS, []);
    this.set(STORAGE_KEYS.REPO_RELEASES, []);
    this.set(STORAGE_KEYS.PAYOUTS, []);
    this.set(STORAGE_KEYS.ATTENDANCE, []);
    this.set(STORAGE_KEYS.SALARIES, []);
    this.set(STORAGE_KEYS.VISITS, []);
    this.logAudit(
      'System',
      'DELETE',
      'clear-demo',
      'Demo operational data cleared. Ready for real Lion Group Agency recovery cases & Excel import.'
    );
  }
}

export const storage = new StorageService();
