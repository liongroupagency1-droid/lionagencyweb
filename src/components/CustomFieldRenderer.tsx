import React from 'react';
import { CustomFieldDefinition } from '../types';

interface CustomFieldRendererProps {
  fields: CustomFieldDefinition[];
  values: Record<string, any>;
  onChange: (fieldName: string, value: any) => void;
}

export const CustomFieldRenderer: React.FC<CustomFieldRendererProps> = ({
  fields,
  values,
  onChange,
}) => {
  if (!fields || fields.length === 0) return null;

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center gap-2 border-b border-slate-700/60 pb-2">
        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
          Custom Fields (Admin Configured)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => {
          const val = values[field.fieldName] ?? field.defaultValue ?? '';

          switch (field.fieldType) {
            case 'Dropdown':
              return (
                <div key={field.id} className="space-y-1">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                    {field.displayName}
                    {field.required && <span className="text-red-400">*</span>}
                  </label>
                  <select
                    value={val}
                    onChange={(e) => onChange(field.fieldName, e.target.value)}
                    required={field.required}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- Select {field.displayName} --</option>
                    {(field.dropdownOptions || []).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              );

            case 'Yes/No':
              return (
                <div key={field.id} className="space-y-1">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                    {field.displayName}
                    {field.required && <span className="text-red-400">*</span>}
                  </label>
                  <select
                    value={val}
                    onChange={(e) => onChange(field.fieldName, e.target.value)}
                    required={field.required}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              );

            case 'Number':
            case 'Currency':
              return (
                <div key={field.id} className="space-y-1">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                    {field.displayName} {field.fieldType === 'Currency' && '(₹)'}
                    {field.required && <span className="text-red-400">*</span>}
                  </label>
                  <input
                    type="number"
                    value={val}
                    onChange={(e) => onChange(field.fieldName, Number(e.target.value))}
                    required={field.required}
                    placeholder={`Enter ${field.displayName}`}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              );

            case 'Date':
              return (
                <div key={field.id} className="space-y-1">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                    {field.displayName}
                    {field.required && <span className="text-red-400">*</span>}
                  </label>
                  <input
                    type="date"
                    value={val}
                    onChange={(e) => onChange(field.fieldName, e.target.value)}
                    required={field.required}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              );

            case 'Time':
              return (
                <div key={field.id} className="space-y-1">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                    {field.displayName}
                    {field.required && <span className="text-red-400">*</span>}
                  </label>
                  <input
                    type="time"
                    value={val}
                    onChange={(e) => onChange(field.fieldName, e.target.value)}
                    required={field.required}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              );

            case 'Long Text':
              return (
                <div key={field.id} className="md:col-span-2 space-y-1">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                    {field.displayName}
                    {field.required && <span className="text-red-400">*</span>}
                  </label>
                  <textarea
                    rows={2}
                    value={val}
                    onChange={(e) => onChange(field.fieldName, e.target.value)}
                    required={field.required}
                    placeholder={`Enter ${field.displayName}`}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              );

            default:
              return (
                <div key={field.id} className="space-y-1">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                    {field.displayName}
                    {field.required && <span className="text-red-400">*</span>}
                  </label>
                  <input
                    type={field.fieldType === 'Mobile Number' ? 'tel' : field.fieldType === 'Email' ? 'email' : 'text'}
                    value={val}
                    onChange={(e) => onChange(field.fieldName, e.target.value)}
                    required={field.required}
                    placeholder={`Enter ${field.displayName}`}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              );
          }
        })}
      </div>
    </div>
  );
};
