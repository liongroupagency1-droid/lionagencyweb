import React, { useState } from 'react';
import {
  Sliders,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Save,
  CheckCircle,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
} from 'lucide-react';
import { storage } from '../services/storage';
import { AppSettings } from '../types';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(() => storage.getSettings());
  const [activeCategory, setActiveCategory] = useState<keyof AppSettings>('paymentModes');
  const [newItemText, setNewItemText] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [saveNotice, setSaveNotice] = useState(false);
  const [errorNotice, setErrorNotice] = useState('');

  const categories: { key: keyof AppSettings; label: string }[] = [
    { key: 'paymentModes', label: 'Payment Modes' },
    { key: 'collectionTypes', label: 'Collection Types' },
    { key: 'caseStatuses', label: 'Case Statuses' },
    { key: 'repoStatuses', label: 'Repo Statuses' },
    { key: 'vehicleStatuses', label: 'Vehicle / Yard Statuses' },
    { key: 'expenseCategories', label: 'Expense Categories' },
    { key: 'officerDesignations', label: 'Officer Designations' },
    { key: 'attendanceStatuses', label: 'Attendance Statuses' },
    { key: 'yardNames', label: 'Yard Names / Locations' },
    { key: 'visitTypes', label: 'Field Visit Types' },
    { key: 'casePriorities', label: 'Case Priorities' },
    { key: 'documentTypes', label: 'Document Types' },
    { key: 'dashboardWidgets', label: 'Dashboard Widgets' },
  ];

  const handleAddItem = () => {
    setErrorNotice('');
    if (!newItemText.trim()) return;
    const currentList = settings[activeCategory] as string[];
    if (currentList.includes(newItemText.trim())) {
      setErrorNotice('Item already exists in this list.');
      setTimeout(() => setErrorNotice(''), 3000);
      return;
    }
    const updated = {
      ...settings,
      [activeCategory]: [...currentList, newItemText.trim()],
    };
    storage.saveSettings(updated);
    setSettings(updated);
    setNewItemText('');
    showSuccess();
  };

  const handleSaveEdit = (idx: number) => {
    if (!editingValue.trim()) return;
    const currentList = [...(settings[activeCategory] as string[])];
    currentList[idx] = editingValue.trim();
    const updated = {
      ...settings,
      [activeCategory]: currentList,
    };
    storage.saveSettings(updated);
    setSettings(updated);
    setEditingIndex(null);
    showSuccess();
  };

  const handleDeleteItem = (idx: number) => {
    const currentList = [...(settings[activeCategory] as string[])];
    currentList.splice(idx, 1);
    const updated = {
      ...settings,
      [activeCategory]: currentList,
    };
    storage.saveSettings(updated);
    setSettings(updated);
    showSuccess();
  };

  const handleMove = (idx: number, direction: 'up' | 'down') => {
    const currentList = [...(settings[activeCategory] as string[])];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= currentList.length) return;

    const temp = currentList[idx];
    currentList[idx] = currentList[targetIdx];
    currentList[targetIdx] = temp;

    const updated = {
      ...settings,
      [activeCategory]: currentList,
    };
    storage.saveSettings(updated);
    setSettings(updated);
  };

  const handleToggleWidget = (widgetId: string) => {
    const widgets = [...settings.dashboardWidgets];
    const target = widgets.find((w) => w.id === widgetId);
    if (target) {
      target.visible = !target.visible;
      const updated = { ...settings, dashboardWidgets: widgets };
      storage.saveSettings(updated);
      setSettings(updated);
    }
  };

  const showSuccess = () => {
    setSaveNotice(true);
    setTimeout(() => setSaveNotice(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white">System Settings &amp; Business Rules</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure system dropdown options, statuses, yards &amp; dashboard widgets without code changes
          </p>
        </div>

        {saveNotice && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-xs font-semibold animate-in fade-in">
            <CheckCircle className="w-4 h-4" />
            Settings Saved
          </div>
        )}

        {errorNotice && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs font-semibold animate-in fade-in">
            <span>{errorNotice}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Navigation Categories */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Configuration Modules
          </div>
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => {
                setActiveCategory(cat.key);
                setEditingIndex(null);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeCategory === cat.key
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{cat.label}</span>
              <span className="text-[10px] opacity-70">
                {Array.isArray(settings[cat.key]) ? (settings[cat.key] as any[]).length : ''}
              </span>
            </button>
          ))}
        </div>

        {/* Right Content Editor */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white">
                {categories.find((c) => c.key === activeCategory)?.label}
              </h2>
              <p className="text-xs text-slate-400">
                Add, rename, reorder, or remove options. Updates appear instantly across all forms.
              </p>
            </div>
          </div>

          {/* Special case: Dashboard Widgets */}
          {activeCategory === 'dashboardWidgets' ? (
            <div className="space-y-3">
              {settings.dashboardWidgets.map((widget) => (
                <div
                  key={widget.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-850 border border-slate-800 text-xs"
                >
                  <span className="font-semibold text-slate-200">{widget.name}</span>
                  <button
                    onClick={() => handleToggleWidget(widget.id)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold border transition-colors ${
                      widget.visible
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                        : 'bg-slate-800 text-slate-500 border-slate-700'
                    }`}
                  >
                    {widget.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    {widget.visible ? 'VISIBLE' : 'HIDDEN'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Add New Item Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Add new ${categories.find((c) => c.key === activeCategory)?.label}...`}
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={handleAddItem}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Option
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                {(settings[activeCategory] as string[]).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-850 border border-slate-800 text-xs hover:border-slate-700 transition-colors"
                  >
                    {editingIndex === idx ? (
                      <div className="flex items-center gap-2 flex-1 mr-2">
                        <input
                          type="text"
                          autoFocus
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(idx)}
                          className="flex-1 px-2.5 py-1 rounded bg-slate-900 border border-amber-500 text-xs text-white"
                        />
                        <button
                          onClick={() => handleSaveEdit(idx)}
                          className="p-1 rounded bg-emerald-950 text-emerald-400"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingIndex(null)}
                          className="p-1 rounded bg-slate-800 text-slate-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="font-medium text-slate-200">{item}</span>
                    )}

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMove(idx, 'up')}
                        disabled={idx === 0}
                        title="Move Up"
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-20"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMove(idx, 'down')}
                        disabled={idx === (settings[activeCategory] as string[]).length - 1}
                        title="Move Down"
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-20"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingIndex(idx);
                          setEditingValue(item);
                        }}
                        className="p-1 text-slate-400 hover:text-amber-400"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(idx)}
                        className="p-1 text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
