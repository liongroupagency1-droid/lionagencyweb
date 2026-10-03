import React from 'react';
import { X, Printer, CheckCircle } from 'lucide-react';
import { CollectionRecord } from '../types';

interface ReceiptPrintModalProps {
  receipt: CollectionRecord | null;
  onClose: () => void;
}

export const ReceiptPrintModal: React.FC<ReceiptPrintModalProps> = ({ receipt, onClose }) => {
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col">
        {/* Modal Controls */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <span className="text-sm font-semibold text-white flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Collection Receipt Generated
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print Receipt
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div className="p-6 bg-white text-slate-900 overflow-y-auto max-h-[75vh]" id="printable-receipt">
          {/* Header */}
          <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
            <h1 className="text-xl font-black uppercase tracking-wider text-slate-900">
              LION GROUP AGENCY
            </h1>
            <p className="text-xs font-semibold text-slate-700">
              Vehicle Finance Recovery, Collection &amp; Repossession Services
            </p>
            <p className="text-[11px] text-slate-600">
              Main Road, Dahod - 389151, Gujarat, India | Contact: +91 98250 98250
            </p>
            <div className="mt-2 inline-block px-3 py-0.5 bg-slate-100 border border-slate-400 text-xs font-bold uppercase rounded">
              Official Payment Receipt
            </div>
          </div>

          {/* Receipt Info Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs mb-4">
            <div>
              <span className="text-slate-500">Receipt No:</span>{' '}
              <strong className="font-mono text-slate-900">{receipt.receiptNumber}</strong>
            </div>
            <div className="text-right">
              <span className="text-slate-500">Date:</span>{' '}
              <strong className="text-slate-900">{receipt.date}</strong>
            </div>
            <div>
              <span className="text-slate-500">Finance Co:</span>{' '}
              <strong className="text-slate-900">{receipt.financeCompanyName}</strong>
            </div>
            <div className="text-right">
              <span className="text-slate-500">Loan Agreement:</span>{' '}
              <strong className="font-mono text-slate-900">{receipt.loanAgreementNumber}</strong>
            </div>
          </div>

          {/* Customer & Asset Details Box */}
          <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs space-y-1.5 mb-4">
            <div className="flex justify-between">
              <span className="text-slate-500">Customer Name:</span>
              <strong className="text-slate-900 uppercase font-semibold">{receipt.customerName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Vehicle Number:</span>
              <strong className="font-mono text-slate-900">{receipt.vehicleNumber || 'N/A'}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Collection Purpose:</span>
              <strong className="text-slate-800">{receipt.collectionType}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Mode:</span>
              <strong className="text-slate-800">{receipt.paymentMode}</strong>
            </div>
            {receipt.transactionReference && (
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction Ref / Txn ID:</span>
                <span className="font-mono text-slate-700">{receipt.transactionReference}</span>
              </div>
            )}
            {receipt.remarks && (
              <div className="flex justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-200">
                <span>Remarks:</span>
                <span>{receipt.remarks}</span>
              </div>
            )}
          </div>

          {/* Payment Amount Box */}
          <div className="border-2 border-emerald-600 bg-emerald-50/50 rounded p-3 flex items-center justify-between mb-6">
            <div>
              <span className="text-xs uppercase font-bold text-slate-600">Total Amount Received</span>
              <p className="text-xs text-slate-500 italic">Inclusive of all authorized agency charges</p>
            </div>
            <div className="text-2xl font-black text-emerald-800 font-mono">
              ₹{receipt.collectionAmount?.toLocaleString('en-IN')}
            </div>
          </div>

          {/* Officer & Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-300 text-xs">
            <div>
              <p className="text-slate-500">Collected By:</p>
              <p className="font-bold text-slate-800 mt-1">{receipt.officerName || 'Lion Office Staff'}</p>
              <p className="text-[10px] text-slate-500">Authorized Recovery Executive</p>
            </div>
            <div className="text-right">
              <div className="h-8"></div>
              <p className="border-t border-slate-400 pt-1 font-bold text-slate-800">
                For Lion Group Agency
              </p>
              <p className="text-[10px] text-slate-500">Authorized Signatory &amp; Stamp</p>
            </div>
          </div>

          <div className="mt-6 pt-2 border-t border-dashed border-slate-300 text-center text-[10px] text-slate-400">
            * This is a computer-generated money receipt issued by Lion Group Agency, Dahod, Gujarat.
          </div>
        </div>
      </div>
    </div>
  );
};
