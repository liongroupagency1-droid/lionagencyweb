import React, { useState, useMemo } from 'react';
import {
  CalendarCheck,
  Plus,
  Search,
  Filter,
  Download,
  Clock,
  User as UserIcon,
  CheckCircle,
  XCircle,
  X,
  Save,
} from 'lucide-react';
import { storage } from '../services/storage';
import { AttendanceRecord, OfficerRecord } from '../types';
import { ExcelService } from '../services/excelService';

export const AttendanceModule: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(
    () => new Date().toISOString().split('T')[0]
  );
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() =>
    storage.getAttendance()
  );
  const officers = useMemo(() => storage.getOfficers().filter((o) => o.status === 'ACTIVE'), []);
  const settings = storage.getSettings();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    officerId: officers[0]?.id || '',
    date: selectedDate,
    officeInTime: '09:15',
    officeOutTime: '18:30',
    status: 'Present',
    remarks: 'Field recovery route completed',
  });

  const refreshList = () => {
    setAttendance([...storage.getAttendance()]);
  };

  const todayRecords = useMemo(() => {
    return attendance.filter((a) => a.date === selectedDate);
  }, [attendance, selectedDate]);

  // Quick mark attendance for an officer directly from table
  const handleQuickMark = (officer: OfficerRecord, status: string) => {
    let workingHours = 0;
    if (status === 'Present') workingHours = 9;
    if (status === 'Half Day') workingHours = 4.5;

    storage.markAttendance({
      officerId: officer.id,
      officerName: officer.name,
      date: selectedDate,
      officeInTime: status === 'Present' || status === 'Half Day' ? '09:15' : undefined,
      officeOutTime: status === 'Present' ? '18:30' : status === 'Half Day' ? '13:45' : undefined,
      status,
      workingHours,
      remarks: `Quick marked by agency admin`,
    });
    refreshList();
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    const off = officers.find((o) => o.id === formData.officerId);
    if (!off) return;

    // Calculate working hours roughly
    let hours = 0;
    if (formData.officeInTime && formData.officeOutTime) {
      const [inH, inM] = formData.officeInTime.split(':').map(Number);
      const [outH, outM] = formData.officeOutTime.split(':').map(Number);
      hours = Math.max(0, Number(((outH * 60 + outM - (inH * 60 + inM)) / 60).toFixed(2)));
    }

    storage.markAttendance({
      officerId: off.id,
      officerName: off.name,
      date: formData.date,
      officeInTime: formData.officeInTime,
      officeOutTime: formData.officeOutTime,
      status: formData.status,
      workingHours: hours,
      remarks: formData.remarks,
    });

    setIsModalOpen(false);
    refreshList();
  };

  const handleExport = () => {
    ExcelService.exportToExcel(attendance, 'Lion_Group_Agency_Attendance', 'Attendance');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white">Daily Officer Attendance &amp; Field Hours</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track office in-time, field departure, half days, leaves &amp; monthly attendance muster roll
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
          />

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Export
          </button>

          <button
            onClick={() => {
              setFormData((prev) => ({ ...prev, date: selectedDate }));
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md"
          >
            <Plus className="w-4 h-4" />
            Detailed Entry
          </button>
        </div>
      </div>

      {/* Roster Attendance Table for Selected Date */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Daily Muster Roll for {selectedDate}
          </h3>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-emerald-400 font-bold">
              Present: {todayRecords.filter((r) => r.status === 'Present').length}
            </span>
            <span className="text-rose-400 font-bold">
              Absent: {todayRecords.filter((r) => r.status === 'Absent').length}
            </span>
            <span className="text-amber-400 font-bold">
              Half Day: {todayRecords.filter((r) => r.status === 'Half Day').length}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Officer</th>
                <th className="py-2.5 px-3">Employee ID</th>
                <th className="py-2.5 px-3">Designation</th>
                <th className="py-2.5 px-3">In Time</th>
                <th className="py-2.5 px-3">Out Time</th>
                <th className="py-2.5 px-3">Hours</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Quick Mark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {officers.map((off) => {
                const rec = todayRecords.find((r) => r.officerId === off.id);
                const status = rec ? rec.status : 'Not Marked';

                let badge = 'bg-slate-800 text-slate-400 border-slate-700';
                if (status === 'Present') badge = 'bg-emerald-950/60 text-emerald-400 border-emerald-800';
                if (status === 'Absent') badge = 'bg-rose-950/60 text-rose-400 border-rose-800';
                if (status === 'Half Day') badge = 'bg-amber-950/60 text-amber-400 border-amber-800';
                if (status === 'Leave') badge = 'bg-blue-950/60 text-blue-400 border-blue-800';

                return (
                  <tr key={off.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-semibold text-white">{off.name}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{off.employeeId}</td>
                    <td className="py-2.5 px-3 text-slate-400">{off.designation}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">{rec?.officeInTime || '--:--'}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">{rec?.officeOutTime || '--:--'}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-amber-300">
                      {rec?.workingHours ? `${rec.workingHours} hrs` : '--'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge}`}>
                        {status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleQuickMark(off, 'Present')}
                          className="px-2 py-0.5 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-[10px] font-bold"
                        >
                          P
                        </button>
                        <button
                          onClick={() => handleQuickMark(off, 'Half Day')}
                          className="px-2 py-0.5 rounded bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 text-[10px] font-bold"
                        >
                          HD
                        </button>
                        <button
                          onClick={() => handleQuickMark(off, 'Absent')}
                          className="px-2 py-0.5 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 text-[10px] font-bold"
                        >
                          A
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Detailed Attendance Entry */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in duration-150">
            <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                Detailed Attendance Entry
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Select Officer</label>
                <select
                  value={formData.officerId}
                  onChange={(e) => setFormData({ ...formData, officerId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {officers.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Office In Time</label>
                  <input
                    type="time"
                    value={formData.officeInTime}
                    onChange={(e) => setFormData({ ...formData, officeInTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Office Out Time</label>
                  <input
                    type="time"
                    value={formData.officeOutTime}
                    onChange={(e) => setFormData({ ...formData, officeOutTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Attendance Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {settings.attendanceStatuses.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Field Route Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Limkheda, Jhalod recovery route"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                />
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
                  Record Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
