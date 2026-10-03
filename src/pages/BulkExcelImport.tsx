import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  Database,
  FileCheck,
  XCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { ExcelService, CASE_FIELD_DEFINITIONS } from '../services/excelService';
import { storage } from '../services/storage';

export const BulkExcelImport: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<any[]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  // Result stats
  const [importSummary, setImportSummary] = useState<{
    total: number;
    inserted: number;
    updated: number;
    errors: string[];
  } | null>(null);

  // Drag and drop handler
  const handleFileChange = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsParsing(true);
    setImportSummary(null);

    try {
      const parsed = await ExcelService.parseFile(selectedFile);
      setHeaders(parsed.headers);
      setRawRows(parsed.rows);

      // Auto-suggest mappings
      const autoMappings = ExcelService.suggestMappings(parsed.headers);
      setMappings(autoMappings);
    } catch (err: any) {
      setErrorMessage(`Error reading Excel file: ${err.message}`);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleMappingChange = (header: string, targetField: string) => {
    setMappings((prev) => ({
      ...prev,
      [header]: targetField,
    }));
  };

  const handleStartImport = async () => {
    if (!rawRows.length) return;
    setErrorMessage('');

    // Check required mappings
    const mappedTargets = Object.values(mappings);
    if (!mappedTargets.includes('loanAgreementNumber') || !mappedTargets.includes('customerName')) {
      setErrorMessage('You must map at least "Loan Agreement Number" and "Customer Name" to proceed.');
      return;
    }

    setIsImporting(true);
    setProgress(10);

    // Transform raw rows
    const transformed = ExcelService.transformRows(rawRows, mappings);

    // Process with progress animation
    setTimeout(() => {
      setProgress(50);
      setTimeout(() => {
        const result = storage.bulkImportCases(transformed);
        setProgress(100);
        setIsImporting(false);
        setImportSummary({
          total: rawRows.length,
          inserted: result.inserted,
          updated: result.updated,
          errors: result.errors,
        });
      }, 500);
    }, 400);
  };

  const handleReset = () => {
    setFile(null);
    setHeaders([]);
    setRawRows([]);
    setMappings({});
    setImportSummary(null);
    setProgress(0);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-bold text-white">Bulk Excel &amp; CSV Case Importer</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Engineered for high-volume bank portfolio dumps (thousands/lakhs of cases). Auto-column detection, duplicate resolution, and instant update.
          </p>
        </div>

        <button
          onClick={ExcelService.downloadCaseTemplate}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 text-xs font-semibold transition-colors"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          Download Sample Excel Template
        </button>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="p-1 hover:text-white">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step 1: Upload or Dropzone */}
      {!file && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="bg-slate-900 border-2 border-dashed border-slate-700 hover:border-amber-500 rounded-2xl p-12 text-center transition-all cursor-pointer group shadow-xl"
        >
          <input
            type="file"
            id="excel-file-input"
            accept=".xlsx, .xls, .csv"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileChange(e.target.files[0]);
              }
            }}
            className="hidden"
          />
          <label htmlFor="excel-file-input" className="cursor-pointer space-y-4 block">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Drop your Excel (.xlsx, .xls) or .csv file here
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Supports all NBFC, Bank, and Custom Recovery Agency spreadsheets up to lakhs of rows.
              </p>
            </div>
            <div className="pt-2">
              <span className="inline-block px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md">
                Browse Files
              </span>
            </div>
          </label>
        </div>
      )}

      {/* Loading indicator */}
      {isParsing && (
        <div className="p-8 text-center text-slate-300 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
          <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
          <p className="text-sm font-semibold">Parsing spreadsheet headers and data structures...</p>
        </div>
      )}

      {/* Step 2: Mapping & Preview */}
      {file && !importSummary && !isParsing && (
        <div className="space-y-6">
          {/* File Meta Bar */}
          <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-3">
              <FileCheck className="w-6 h-6 text-emerald-400" />
              <div>
                <span className="font-bold text-white text-sm">{file.name}</span>
                <div className="text-xs text-slate-400">
                  Detected <strong className="text-amber-400">{rawRows.length}</strong> rows and{' '}
                  <strong className="text-slate-200">{headers.length}</strong> columns
                </div>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded bg-slate-800 border border-slate-700"
            >
              Choose Different File
            </button>
          </div>

          {/* Column Mapping Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Intelligent Column Mapping
                </h3>
                <p className="text-xs text-slate-400">
                  Verify or adjust auto-detected field assignments from your bank spreadsheet.
                </p>
              </div>

              <span className="text-[11px] text-slate-400 font-mono">
                {Object.values(mappings).filter(Boolean).length} / {headers.length} Columns Mapped
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="py-2.5 px-3">Excel Column Header</th>
                    <th className="py-2.5 px-3">Sample Value (Row 1)</th>
                    <th className="py-2.5 px-3">Maps To Lion Agency Case Field</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {headers.map((header) => {
                    const sampleVal = rawRows[0]?.[header];
                    const currentMapping = mappings[header] || '';

                    return (
                      <tr key={header} className="hover:bg-slate-800/40">
                        <td className="py-2 px-3 font-semibold text-white font-mono">{header}</td>
                        <td className="py-2 px-3 text-slate-400 truncate max-w-[200px]">
                          {sampleVal !== undefined && sampleVal !== '' ? String(sampleVal) : <span className="italic text-slate-600">empty</span>}
                        </td>
                        <td className="py-2 px-3">
                          <select
                            value={currentMapping}
                            onChange={(e) => handleMappingChange(header, e.target.value)}
                            className={`w-full max-w-xs px-2.5 py-1.5 rounded-lg text-xs focus:outline-none ${
                              currentMapping
                                ? 'bg-slate-800 border border-amber-500/50 text-amber-300 font-semibold'
                                : 'bg-slate-850 border border-slate-700 text-slate-400'
                            }`}
                          >
                            <option value="">-- Skip this column --</option>
                            {CASE_FIELD_DEFINITIONS.map((def) => (
                              <option key={def.field} value={def.field}>
                                {def.label} {def.required && '(* Required)'}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Existing loan agreements will be automatically updated with latest balances; new loans inserted.</span>
              </div>

              <button
                onClick={handleStartImport}
                disabled={isImporting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                {isImporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing {rawRows.length} Rows ({progress}%)...</span>
                  </>
                ) : (
                  <>
                    <span>Execute Bulk Import</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Import Summary & Report */}
      {importSummary && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Bulk Case Import Finished Successfully</h2>
                <p className="text-xs text-slate-400">
                  Processed {importSummary.total} rows into Lion Group Agency database.
                </p>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400"
            >
              Import Another File
            </button>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-850 p-4 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Total Rows</span>
              <div className="text-2xl font-black text-white font-mono mt-1">
                {importSummary.total}
              </div>
            </div>

            <div className="bg-slate-850 p-4 rounded-xl border border-emerald-800/40">
              <span className="text-emerald-400 text-[10px] uppercase font-semibold">New Cases Added</span>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                +{importSummary.inserted}
              </div>
            </div>

            <div className="bg-slate-850 p-4 rounded-xl border border-blue-800/40">
              <span className="text-blue-400 text-[10px] uppercase font-semibold">Existing Cases Updated</span>
              <div className="text-2xl font-black text-blue-400 font-mono mt-1">
                {importSummary.updated}
              </div>
            </div>

            <div className="bg-slate-850 p-4 rounded-xl border border-rose-800/40">
              <span className="text-rose-400 text-[10px] uppercase font-semibold">Errors / Skipped</span>
              <div className="text-2xl font-black text-rose-400 font-mono mt-1">
                {importSummary.errors.length}
              </div>
            </div>
          </div>

          {/* Errors list if any */}
          {importSummary.errors.length > 0 && (
            <div className="bg-red-950/30 border border-red-900/60 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-red-300 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>Rows with missing required data ({importSummary.errors.length}):</span>
              </div>
              <ul className="text-xs text-red-300/80 list-disc list-inside space-y-1 font-mono max-h-40 overflow-y-auto">
                {importSummary.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
