/**
 * Lion Group Agency - Excel & CSV Processing Service
 * Provides fast parsing, auto-column mapping, duplicate detection,
 * batch import for large datasets (thousands/lakhs of rows), and export.
 */

import * as XLSX from 'xlsx';
import { CaseRecord } from '../types';

export interface ColumnMapping {
  fileHeader: string;
  targetField: string;
}

export const CASE_FIELD_DEFINITIONS: { field: keyof CaseRecord | string; label: string; required?: boolean }[] = [
  { field: 'loanAgreementNumber', label: 'Loan Agreement Number', required: true },
  { field: 'customerName', label: 'Customer Name', required: true },
  { field: 'customerMobile', label: 'Customer Mobile', required: true },
  { field: 'financeCompanyName', label: 'Finance Company', required: true },
  { field: 'registrationNumber', label: 'Vehicle / Reg Number' },
  { field: 'assetMake', label: 'Asset Make / Manufacturer' },
  { field: 'model', label: 'Model' },
  { field: 'pos', label: 'POS (Principal Outstanding)' },
  { field: 'tos', label: 'TOS (Total Outstanding)' },
  { field: 'emiAmount', label: 'EMI Amount' },
  { field: 'pendingEmi', label: 'Pending EMIs' },
  { field: 'bkt', label: 'Bucket / DPD' },
  { field: 'applicationId', label: 'Application ID' },
  { field: 'customerAddress', label: 'Address' },
  { field: 'city', label: 'City' },
  { field: 'pincode', label: 'Pincode' },
  { field: 'alternateMobile', label: 'Alternate Mobile' },
  { field: 'engineNumber', label: 'Engine Number' },
  { field: 'chassisNumber', label: 'Chassis Number' },
  { field: 'dealerName', label: 'Dealer Name' },
  { field: 'referenceName', label: 'Guarantor / Ref Name' },
  { field: 'referenceMobile', label: 'Guarantor Mobile' },
  { field: 'assignedOfficerName', label: 'Assigned Officer' },
  { field: 'priority', label: 'Priority (CRITICAL/HIGH/MEDIUM/LOW)' },
  { field: 'status', label: 'Status' },
  { field: 'remarks', label: 'Remarks' },
];

// Heuristic keyword aliases for auto-mapping columns from bank/NBFC dumps
const FIELD_ALIASES: Record<string, string[]> = {
  loanAgreementNumber: ['loan agreement', 'lan', 'agreement', 'loan no', 'loan_no', 'contract', 'agreement_no', 'account no', 'loan id'],
  customerName: ['customer', 'borrower', 'client name', 'party name', 'customer name', 'name', 'applicant name', 'cust_name'],
  customerMobile: ['mobile', 'phone', 'contact', 'customer mobile', 'cell', 'mobile no', 'contact no', 'tel'],
  financeCompanyName: ['financier', 'bank', 'finance co', 'company', 'nbfe', 'lender', 'client', 'finance company'],
  registrationNumber: ['reg no', 'registration', 'vehicle no', 'veh no', 'reg_no', 'vehicle number', 'registration number', 'asset no'],
  assetMake: ['make', 'brand', 'manufacturer', 'asset make', 'oem', 'vehicle make'],
  model: ['model', 'variant', 'asset model', 'vehicle model'],
  pos: ['pos', 'principal', 'principal outstanding', 'balance pos', 'curr pos'],
  tos: ['tos', 'total outstanding', 'overdue', 'total overdue', 'balance overdue', 'net balance'],
  emiAmount: ['emi', 'installment', 'emi amount', 'monthly installment', 'instalment amount'],
  pendingEmi: ['overdue emi', 'pending emi', 'overdue installments', 'bounces', 'bounce count'],
  bkt: ['bucket', 'bkt', 'dpd bucket', 'cycle', 'dpd', 'delinquency'],
  applicationId: ['app id', 'application id', 'proposal no', 'lead id'],
  customerAddress: ['address', 'residence address', 'customer address', 'addr', 'location'],
  city: ['city', 'town', 'taluka', 'district'],
  pincode: ['pin', 'pincode', 'postal code', 'zip'],
  engineNumber: ['engine no', 'engine number', 'eng no'],
  chassisNumber: ['chassis no', 'chassis number', 'vin', 'chas no'],
  assignedOfficerName: ['officer', 'agent', 'executive', 'assigned to', 'assigned officer', 'fe'],
  priority: ['priority', 'urgency'],
  status: ['status', 'case status', 'stage'],
};

export class ExcelService {
  /**
   * Parse an uploaded File (.xlsx, .xls, .csv) into raw array of rows and detected headers
   */
  static async parseFile(
    file: File
  ): Promise<{ headers: string[]; rows: any[]; totalRows: number }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array', cellDates: true });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          // Parse as array of arrays or objects
          const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: '',
            blankrows: false,
          });

          if (!rawJson || rawJson.length === 0) {
            throw new Error('The uploaded file is empty');
          }

          // First non-empty row is headers
          const headerRowIdx = rawJson.findIndex((r) => Array.isArray(r) && r.some((c) => String(c).trim() !== ''));
          if (headerRowIdx === -1) {
            throw new Error('No header row detected');
          }

          const rawHeaders = (rawJson[headerRowIdx] as any[]).map((h, i) =>
            h ? String(h).trim() : `Column_${i + 1}`
          );

          // Convert subsequent rows into object array
          const rows: any[] = [];
          for (let i = headerRowIdx + 1; i < rawJson.length; i++) {
            const rowArr = rawJson[i];
            if (!Array.isArray(rowArr) || !rowArr.some((c) => String(c).trim() !== '')) {
              continue;
            }
            const rowObj: Record<string, any> = {};
            rawHeaders.forEach((h, colIdx) => {
              rowObj[h] = rowArr[colIdx] !== undefined ? rowArr[colIdx] : '';
            });
            rows.push(rowObj);
          }

          resolve({
            headers: rawHeaders,
            rows,
            totalRows: rows.length,
          });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Auto-suggest column mappings based on header text matching and aliases
   */
  static suggestMappings(headers: string[]): Record<string, string> {
    const mappings: Record<string, string> = {};

    headers.forEach((header) => {
      const norm = header.toLowerCase().replace(/[^a-z0-9]/g, '');

      // Direct exact match
      for (const def of CASE_FIELD_DEFINITIONS) {
        const defNorm = def.field.toLowerCase();
        const labelNorm = def.label.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (norm === defNorm || norm === labelNorm) {
          mappings[header] = def.field as string;
          return;
        }
      }

      // Alias matching
      for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
        for (const alias of aliases) {
          const aliasNorm = alias.replace(/[^a-z0-9]/g, '');
          if (norm.includes(aliasNorm) || aliasNorm.includes(norm)) {
            mappings[header] = field;
            return;
          }
        }
      }
    });

    return mappings;
  }

  /**
   * Convert mapped raw rows into CaseRecord drafts
   */
  static transformRows(
    rows: any[],
    mappings: Record<string, string>
  ): Partial<CaseRecord>[] {
    return rows.map((row) => {
      const item: Record<string, any> = { customFields: {} };

      Object.entries(mappings).forEach(([fileHeader, targetField]) => {
        if (!targetField || targetField === '__skip__') return;

        let val = row[fileHeader];
        if (val instanceof Date) {
          val = val.toISOString().split('T')[0];
        }

        if (targetField.startsWith('cf_')) {
          const cfKey = targetField.replace('cf_', '');
          item.customFields[cfKey] = val;
        } else {
          item[targetField] = val;
        }
      });

      return item as Partial<CaseRecord>;
    });
  }

  /**
   * Download a clean Excel template with pre-filled sample rows
   */
  static downloadCaseTemplate(): void {
    const templateData = [
      {
        'Loan Agreement Number': 'LGA-DEMO-001',
        'Customer Name': 'Dilipbhai Mohanlal Rathod',
        'Customer Mobile': '9825100011',
        'Alternate Mobile': '9825100022',
        'Finance Company': 'TVS Credit',
        'Vehicle / Reg Number': 'GJ-20-AA-1122',
        'Asset Make': 'TVS',
        'Model': 'Apache 160 RTR',
        'Engine Number': 'ENG-77881',
        'Chassis Number': 'CHAS-99001',
        'Loan Amount': 90000,
        'EMI Amount': 3750,
        'Tenure': 24,
        'Paid EMI': 14,
        'Pending EMI': 3,
        'POS': 28000,
        'TOS': 11250,
        'Bucket': 'BKT-2',
        'Address': 'Station Road, Dahod',
        'City': 'Dahod',
        'Pincode': '389151',
        'Guarantor Name': 'Mohanlal Rathod',
        'Guarantor Mobile': '9825100033',
        'Assigned Officer': 'Rajesh Parmar',
        'Priority': 'HIGH',
        'Status': 'NEW',
        'Remarks': 'Field visit pending',
      },
      {
        'Loan Agreement Number': 'LGA-DEMO-002',
        'Customer Name': 'Kailash Govind Damor',
        'Customer Mobile': '9426200022',
        'Alternate Mobile': '',
        'Finance Company': 'Hero FinCorp',
        'Vehicle / Reg Number': 'GJ-20-BB-3344',
        'Asset Make': 'Hero',
        'Model': 'Splendor Plus',
        'Engine Number': 'ENG-44551',
        'Chassis Number': 'CHAS-22331',
        'Loan Amount': 75000,
        'EMI Amount': 3100,
        'Tenure': 24,
        'Paid EMI': 8,
        'Pending EMI': 5,
        'POS': 34000,
        'TOS': 15500,
        'Bucket': 'BKT-3+',
        'Address': 'Sukhsar Road, Fatehpura',
        'City': 'Fatehpura',
        'Pincode': '389172',
        'Guarantor Name': 'Govind Damor',
        'Guarantor Mobile': '9426200044',
        'Assigned Officer': 'Rajesh Parmar',
        'Priority': 'CRITICAL',
        'Status': 'REPO PENDING',
        'Remarks': 'Notice served',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cases_Template');

    XLSX.writeFile(workbook, 'Lion_Group_Agency_Case_Import_Template.xlsx');
  }

  /**
   * Generic export of any array of objects to Excel
   */
  static exportToExcel(data: any[], fileName: string, sheetName: string = 'Sheet1'): void {
    const exportData = data && data.length > 0 ? data : [{ Message: 'No records found to export' }];
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
  }
}
