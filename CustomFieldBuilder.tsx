import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  X,
  Save,
  Sliders,
  Check,
} from 'lucide-react';
import { storage } from '../services/storage';
import {
  CustomFieldDefinition,
  CustomFieldModule,
  CustomFieldType,
} from '../types';

export const CustomFieldBuilder: React.FC = () => {
  const [fields, setFields] = useState<CustomFieldDefinition[]>(() =>
    storage.getCustomFields()
  );

  const [selectedModule, setSelectedModule] = useState<CustomFieldModule>('Case');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomFieldDefinition | null>(null);
  const [formError, setFormError] = useState('');

  const modules: CustomFieldModule[] = [
    'Case',
    'Customer',
    'Collection',
    'Repo',
    'Vehicle',
    'Officer',
    'Attendance',
    'Salary',
    'Payout',
  ];

  const fieldTypes: CustomFieldType[] = [
    'Text',
    'Number',
    'Date',
    'Time',
    'Date & Time',
    'Dropdown',
    'Multi-select',
    'Yes/No',
    'Currency',
    'Mobile Number',
    'Email',
    'Long Text',
  ];

  const initialForm: Partial<CustomFieldDefinition> = {
    module: selectedModule,
    fieldName: '',
    displayName: '',
    fieldType: 'Text',
    required: false,
    active: true,
    fieldOrder: 1,
    defaultValue: '',
    dropdownOptions: ['Option 1', 'Option 2'],
  };

  const [formData, setFormData] = useState<Partial<CustomFieldDefinition>>(initialForm);
  const [optionsText, setOptionsText] = useState('Option 1, Option 2');

  const refreshList = () => {
    setFields([...storage.getCustomFields()]);
  };

  const currentModuleFields = fields
    .filter((f) => f.module === selectedModule)
    .sort((a, b) => a.fieldOrder - b.fieldOrder);

  const handleOpenAdd = () => {
    setEditingField(null);
    setFormData({
      ...initialForm,
      module: selectedModule,
      fieldOrder: currentModuleFields.length + 1,
    });
    setOptionsText('Option 1, Option 2');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (f: CustomFieldDefinition) => {
    setEditingField(f);
    setFormData({ ...f });
    setOptionsText((f.dropdownOptions || []).join(', '));
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!formData.displayName) {
      setFormError('Display Name is required.');
      return;
    }

    const fieldKey =
      formData.fieldName?.trim() ||
      formData.displayName
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, '_')
        .replace(/^_+|_+$/g, '');

    const opts = optionsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: CustomFieldDefinition = {
      id: editingField?.id || 'cf-' + Date.now(),
      module: selectedModule,
      fieldName: fieldKey,
      displayName: formData.displayName,
      fieldType: formData.fieldType || 'Text',
      required: Boolean(formData.required),
      active: formData.active !== undefined ? formData.active : true,
      fieldOrder: Number(formData.fieldOrder) || 1,
      defaultValue: formData.defaultValue || '',
      dropdownOptions: opts.length > 0 ? opts : undefined,
    };

    storage.saveCustomField(payload);
    setIsModalOpen(false);
    refreshList();
  };

  const handleToggleActive = (f: CustomFieldDefinition) => {
    storage.saveCustomField({
      ...f,
      active: !f.active,
    });
    refreshList();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white">Custom Field Builder &amp; Form Customizer</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Zero-code field expansion. Add custom inputs (police jurisdiction, GPS fitted, fuel level, guarantor details) without modifying code.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/10"
        >
          <Plus className="w-4 h-4" />
          Add Custom Field to {selectedModule}
        </button>
      </div>

      {/* Module Selector Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap gap-1.5">
        {modules.map((mod) => (
          <button
            key={mod}
            onClick={() => setSelectedModule(mod)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedModule === mod
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-850 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {mod} Module
          </button>
        ))}
      </div>

      {/* Fields List for Selected Module */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Custom Fields for {selectedModule} Module ({currentModuleFields.length})
          </h3>
          <span className="text-xs text-slate-400">
            Historical data preserved even if a field is deactivated.
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Order</th>
                <th className="py-2.5 px-3">Display Name</th>
                <th className="py-2.5 px-3">Field Key</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Required</th>
                <th className="py-2.5 px-3">Options / Default</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {currentModuleFields.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 text-xs">
                    No custom fields configured for {selectedModule}. Click "Add Custom Field" above.
                  </td>
                </tr>
              ) : (
                currentModuleFields.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-mono text-slate-400">#{f.fieldOrder}</td>
                    <td className="py-2.5 px-3 font-semibold text-white">{f.displayName}</td>
                    <td className="py-2.5 px-3 font-mono text-amber-300 text-[11px]">{f.fieldName}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                        {f.fieldType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] font-bold ${f.required ? 'text-rose-400' : 'text-slate-500'}`}>
                        {f.required ? 'YES (*)' : 'Optional'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px] truncate max-w-[200px]">
                      {f.dropdownOptions ? f.dropdownOptions.join(', ') : f.defaultValue || '—'}
                    </td>
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => handleToggleActive(f)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                          f.active
                            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                            : 'bg-slate-800 text-slate-500 border-slate-700'
                        }`}
                      >
                        {f.active ? 'ACTIVE' : 'INACTIVE'}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(f)}
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Custom Field Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in duration-150">
            <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                {editingField ? `Edit Field: ${editingField.displayName}` : `Add Custom Field (${selectedModule})`}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs">
                  {formError}
                </div>
              )}
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">
                  Display Label (User Facing) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Police Station Jurisdiction"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Field Type</label>
                  <select
                    value={formData.fieldType}
                    onChange={(e) => setFormData({ ...formData, fieldType: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {fieldTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Display Order</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.fieldOrder}
                    onChange={(e) => setFormData({ ...formData, fieldOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>

              {(formData.fieldType === 'Dropdown' || formData.fieldType === 'Multi-select') && (
                <div className="space-y-1">
                  <label className="font-semibold text-amber-400">
                    Dropdown Options (Comma separated)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Dahod Town, Jhalod, Limkheda, Fatehpura"
                    value={optionsText}
                    onChange={(e) => setOptionsText(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Default Value (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. None"
                  value={formData.defaultValue}
                  onChange={(e) => setFormData({ ...formData, defaultValue: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.required}
                    onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                    className="rounded text-amber-500"
                  />
                  <span>Is Required Field?</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="rounded text-amber-500"
                  />
                  <span>Is Active?</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs shadow-md"
                >
                  Save Custom Field
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
