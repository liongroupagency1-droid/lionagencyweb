/**
 * Lion Group Agency - Recovery & Collection Management System
 * Dahod, Gujarat, India
 * Core Type Definitions
 */

export type UserRole =
  | 'SUPER ADMIN'
  | 'ADMIN'
  | 'SUPERVISOR'
  | 'COLLECTION OFFICER'
  | 'REPO OFFICER'
  | 'OFFICE STAFF'
  | 'ACCOUNT STAFF';

export interface User {
  id: string;
  username: string;
  name: string;
  email?: string;
  mobile: string;
  role: UserRole;
  officerId?: string; // Links to Officer record if collection/repo officer
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  password?: string;
}

export interface PermissionMatrix {
  [role: string]: {
    [module: string]: {
      view: boolean;
      add: boolean;
      edit: boolean;
      delete: boolean;
      import: boolean;
      export: boolean;
      approve: boolean;
    };
  };
}

export interface FinanceCompany {
  id: string;
  name: string;
  shortName: string;
  contactPerson: string;
  mobile: string;
  email: string;
  address: string;
  remarks?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export type CasePriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface CaseRecord {
  id: string;
  financeCompanyId: string;
  financeCompanyName: string;
  loanAgreementNumber: string;
  applicationId: string;
  customerName: string;
  customerMobile: string;
  alternateMobile?: string;
  customerAddress: string;
  city: string;
  state: string;
  pincode: string;
  loanAmount: number;
  emiAmount: number;
  tenure: number;
  paidEmi: number;
  pendingEmi: number;
  tos: number; // Total Outstanding
  pos: number; // Principal Outstanding
  bkt: string; // Bucket e.g. BKT-1, BKT-2, BKT-3+
  assetMake: string;
  model: string;
  registrationNumber: string;
  engineNumber?: string;
  chassisNumber?: string;
  loanBookingDate: string;
  loanMaturityDate: string;
  dealerName?: string;
  referenceName?: string;
  referenceMobile?: string;
  referenceAddress?: string;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  priority: CasePriority;
  status: string; // Dynamic status e.g. NEW, ALLOCATED, CONTACTED, PROMISE TO PAY, PAID, PARTIAL PAID, UNPAID, REPO PENDING, REPO, CLOSED
  remarks?: string;
  customFields?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionRecord {
  id: string;
  receiptNumber: string;
  date: string;
  caseId: string;
  loanAgreementNumber: string;
  customerName: string;
  vehicleNumber: string;
  financeCompanyId: string;
  financeCompanyName: string;
  officerId?: string;
  officerName?: string;
  collectionAmount: number;
  paymentMode: string; // Cash, UPI, Bank Transfer, Cheque, Online, Other
  collectionType: string; // EMI, Part Payment, Foreclosure, Settlement, Repo Release Payment, Other
  transactionReference?: string;
  paymentProofUrl?: string;
  remarks?: string;
  customFields?: Record<string, any>;
  createdAt: string;
}

export interface ExpenseRecord {
  id: string;
  date: string;
  category: string; // Petrol, Office Expense, Vehicle Expense, Courier, Staff Expense, Other
  amount: number;
  paidTo: string;
  receiptNumber?: string;
  remarks?: string;
  createdAt: string;
}

export interface DailyHisabRecord {
  id: string;
  date: string;
  openingAmount: number;
  collectionTotal: number;
  expensesTotal: number;
  payoutTotal: number;
  otherDeductions: number;
  closingAmount: number;
  isLocked: boolean;
  notes?: string;
  denominations?: {
    note500?: number;
    note200?: number;
    note100?: number;
    note50?: number;
    note20?: number;
    note10?: number;
    coins?: number;
    physicalCashTotal?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OfficerRecord {
  id: string;
  name: string;
  employeeId: string;
  mobile: string;
  address: string;
  joiningDate: string;
  designation: string;
  salary: number;
  target: number;
  assignedFinanceCompanyIds: string[];
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  officerId: string;
  officerName: string;
  date: string;
  officeInTime?: string;
  officeOutTime?: string;
  status: string; // Present, Absent, Half Day, Leave
  workingHours?: number;
  remarks?: string;
  createdAt: string;
}

export interface SalaryRecord {
  id: string;
  officerId: string;
  officerName: string;
  month: string; // YYYY-MM
  basicSalary: number;
  incentive: number;
  collectionIncentive: number;
  repoIncentive: number;
  deduction: number;
  advance: number;
  other: number;
  netSalary: number; // calculated: basic + incentive + colIncentive + repoIncentive - deduction - advance + other
  status: 'PENDING' | 'APPROVED' | 'PAID';
  paymentDate?: string;
  remarks?: string;
  createdAt: string;
}

export interface PayoutRule {
  id: string;
  title: string;
  method: 'PER_RECEIPT' | 'PERCENTAGE';
  rate: number; // e.g., 100 for Rs.100/receipt, or 2 for 2%
  officerId?: string; // optional specific officer or all
  financeCompanyId?: string; // optional specific finance company or all
  collectionType?: string; // optional specific collection type or all
  status: 'ACTIVE' | 'INACTIVE';
}

export interface PayoutRecord {
  id: string;
  collectionId: string;
  officerId: string;
  officerName: string;
  financeCompanyName: string;
  collectionAmount: number;
  payoutMethod: 'PER_RECEIPT' | 'PERCENTAGE';
  payoutRate: number;
  payoutAmount: number;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'PAID';
  createdAt: string;
}

export interface VehicleYardRecord {
  id: string;
  caseId?: string;
  financeCompanyId: string;
  financeCompanyName: string;
  vehicleNumber: string;
  customerName: string;
  loanAgreementNumber: string;
  vehicleMake: string;
  model: string;
  engineNumber?: string;
  chassisNumber?: string;
  repoDate: string;
  repoTime: string;
  yardName: string;
  yardEntryTime: string;
  vehicleCondition: string;
  vehicleCost?: number;
  parkingCharges: number;
  otherCharges: number;
  totalExpense: number;
  vehicleStatus: string; // REPO, IN YARD, RELEASED, RELEASED SAME DAY, RELEASED LATER, SOLD, CLOSED
  releaseDate?: string;
  releaseTime?: string;
  releaseRemarks?: string;
  repoAgentName?: string;
  repoAgentMobile?: string;
  repoAgentCharge?: number;
  createdAt: string;
  updatedAt: string;
}

export interface RepoReleaseRecord {
  id: string;
  vehicleYardId: string;
  caseId?: string;
  financeCompanyId: string;
  financeCompanyName: string;
  vehicleNumber: string;
  customerName: string;
  loanAgreementNumber: string;
  repoAgentName: string;
  repoAgentMobile: string;
  repoDate: string;
  repoTime: string;
  yardName: string;
  yardTime: string;
  vehicleStatus: string;
  releaseDate?: string;
  releaseTime?: string;
  customerReleasePayment: number;
  repoAgentCharge: number;
  otherCharges: number;
  paymentMode: string;
  receiptNumber?: string;
  isSameDayRelease: boolean;
  remarks?: string;
  createdAt: string;
}

export interface VisitRecord {
  id: string;
  caseId: string;
  officerId: string;
  officerName: string;
  date: string;
  time: string;
  customerContacted: boolean;
  visitType: string; // Home Visit, Office Visit, Guarantor Visit, Yard Visit, Other
  status: string; // Promise to Pay, Refused to Pay, Not Available, Dispute, Cash Collected, Repo Initiated
  ptpDate?: string;
  ptpAmount?: number;
  remarks: string;
  location?: string;
  createdAt: string;
}

export type CustomFieldType =
  | 'Text'
  | 'Number'
  | 'Date'
  | 'Time'
  | 'Date & Time'
  | 'Dropdown'
  | 'Multi-select'
  | 'Yes/No'
  | 'Currency'
  | 'Mobile Number'
  | 'Email'
  | 'Long Text';

export type CustomFieldModule =
  | 'Case'
  | 'Customer'
  | 'Collection'
  | 'Repo'
  | 'Vehicle'
  | 'Officer'
  | 'Attendance'
  | 'Salary'
  | 'Payout';

export interface CustomFieldDefinition {
  id: string;
  module: CustomFieldModule;
  fieldName: string; // machine key
  displayName: string;
  fieldType: CustomFieldType;
  required: boolean;
  active: boolean;
  fieldOrder: number;
  defaultValue?: string;
  dropdownOptions?: string[]; // array of options if Dropdown or Multi-select
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  date: string;
  time: string;
  module: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE' | 'IMPORT' | 'EXPORT' | 'APPROVE' | 'LOGIN';
  recordId: string;
  oldValue?: string;
  newValue?: string;
  description: string;
}

export interface AppSettings {
  paymentModes: string[];
  collectionTypes: string[];
  caseStatuses: string[];
  repoStatuses: string[];
  vehicleStatuses: string[];
  expenseCategories: string[];
  officerDesignations: string[];
  attendanceStatuses: string[];
  payoutTypes: string[];
  salaryComponents: string[];
  yardNames: string[];
  visitTypes: string[];
  casePriorities: string[];
  documentTypes: string[];
  dashboardWidgets: {
    id: string;
    name: string;
    visible: boolean;
    order: number;
  }[];
}
