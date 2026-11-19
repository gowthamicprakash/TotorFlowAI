import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Users,
  Check,
  X,
  Clock3,
  ShieldCheck,
  Save,
  CheckCheck,
  Ban,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import NoBranchState from '../components/NoBranchState';
import { useToast } from '../components/Toast';
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorBanner,
  LoadingBlock,
  PageHeader,
  Select,
} from '../components/ui';
import { cn, formatDate, getErrorMessage, shiftIso, todayIso } from '../utils/format';

const STATUS_OPTIONS = [
  { value: 'PRESENT', label: 'Present', short: 'P', tone: 'bg-emerald-600 text-white border-emerald-600', icon: Check },
  { value: 'ABSENT', label: 'Absent', short: 'A', tone: 'bg-rose-600 text-white border-rose-600', icon: X },
  { value: 'LATE', label: 'Late', short: 'L', tone: 'bg-amber-500 text-white border-amber-500', icon: Clock3 },
  { value: 'EXCUSED', label: 'Excused', short: 'E', tone: 'bg-slate-600 text-white border-slate-600', icon: ShieldCheck },
];

export default function Attendance() {
  const { selectedBranch } = useApp();
  const toast = useToast();
  const [searchParams] = useSearchParams();

  const [batches, setBatches] = useState([]);
  const [batchId, setBatchId] = useState(searchParams.get('batchId') || '');
  const [date, setDate] = useState(todayIso());
  const [roster, setRoster] = useState([]);
  const [entries, setEntries] = useState({});
  const [branchRecords, setBranchRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedBranch) return;
    api
      .get(`/batches?branchId=${selectedBranch.id}`)
      .then((res) => {
        const list = res.data || [];
        setBatches(list);
        setBatchId((current) => {
          if (current && list.some((batch) => String(batch.id) === current)) return current;
          return list.length > 0 ? String(list[0].id) : '';
        });
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, [selectedBranch?.id]);

  useEffect(() => {
    if (!selectedBranch) return;
    let active = true;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const requests = [api.get(`/attendance/branch/${selectedBranch.id}?date=${date}`)];
        if (batchId) {
          requests.push(api.get(`/students?batchId=${batchId}`));
          requests.push(api.get(`/attendance/batch/${batchId}?date=${date}`));
        }
        const [branchRes, studentsRes, batchRes] = await Promise.all(requests);
        if (!active) return;

        setBranchRecords(branchRes.data || []);

        if (studentsRes) {
          const students = studentsRes.data || [];
          setRoster(students);
          const existing = new Map((batchRes?.data || []).map((record) => [record.studentId, record]));
          const nextEntries = {};
          students.forEach((student) => {
            const record = existing.get(student.id);
            nextEntries[student.id] = {
              status: record?.status || 'PRESENT',
              remarks: record?.remarks || '',
              saved: Boolean(record),
            };
          });
          setEntries(nextEntries);
        } else {
          setRoster([]);
          setEntries({});
        }
      } catch (err) {
        if (active) setError(getErrorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [selectedBranch?.id, batchId, date]);

  const stats = useMemo(() => {
    const count = (status) => branchRecords.filter((record) => record.status === status).length;
    const present = count('PRESENT');
    const absent = count('ABSENT');
    const late = count('LATE');
    const excused = count('EXCUSED');
    const total = branchRecords.length;
    return {
      total,
      present,
      absent,
      late,
      excused,
      rate: total > 0 ? Math.round(((present + late) / total) * 100) : 0,
    };
  }, [branchRecords]);

  const rosterStats = useMemo(() => {
    const values = Object.values(entries);
    return {
      total: values.length,
      present: values.filter((entry) => entry.status === 'PRESENT').length,
      absent: values.filter((entry) => entry.status === 'ABSENT').length,
      late: values.filter((entry) => entry.status === 'LATE').length,
      excused: values.filter((entry) => entry.status === 'EXCUSED').length,
    };
  }, [entries]);

  const setAll = (status) => {
    setEntries((current) => {
      const next = {};
      Object.keys(current).forEach((studentId) => {
        next[studentId] = { ...current[studentId], status };
      });
      return next;
    });
  };

  const setStatus = (studentId, status) => {
    setEntries((current) => ({
      ...current,
      [studentId]: { ...current[studentId], status },
    }));
  };

  const handleSave = async () => {
    if (!batchId || roster.length === 0) return;
    setSaving(true);
    setError('');
    try {
      await api.post('/attendance/bulk', {
        branchId: selectedBranch.id,
        batchId: Number(batchId),
        attendanceDate: date,
        records: roster.map((student) => ({
          studentId: student.id,
          status: entries[student.id]?.status || 'PRESENT',
          remarks: entries[student.id]?.remarks || null,
        })),
      });
      toast.success(`Attendance saved for ${formatDate(date)}.`);
      const branchRes = await api.get(`/attendance/branch/${selectedBranch.id}?date=${date}`);
      setBranchRecords(branchRes.data || []);
      setEntries((current) => {
        const next = {};
        Object.entries(current).forEach(([key, value]) => {
          next[key] = { ...value, saved: true };
        });
        return next;
      });
    } catch (err) {
      setError(getErrorMessage(err));
      toast.error('Attendance could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const selectedBatch = batches.find((batch) => String(batch.id) === batchId);

  if (!selectedBranch) return <NoBranchState />;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow={
          <span className="rounded-md border border-indigo-200/50 bg-indigo-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-indigo-600">
            Daily register
          </span>
        }
        title="Attendance"
        subtitle={`Record and review attendance for ${selectedBranch.name}.`}
        actions={
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setDate((current) => shiftIso(current, -1))}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1.5 px-2 text-xs font-bold text-slate-700">
              <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
              {formatDate(date)}
            </div>
            <button
              type="button"
              onClick={() => setDate((current) => shiftIso(current, 1))}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setDate(todayIso())}
              className="ml-1 rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-50"
            >
              Today
            </button>
          </div>
        }
      />

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {[
          { label: 'Marked', value: stats.total, tone: 'text-slate-900' },
          { label: 'Present', value: stats.present, tone: 'text-emerald-600' },
          { label: 'Absent', value: stats.absent, tone: 'text-rose-600' },
          { label: 'Late / excused', value: stats.late + stats.excused, tone: 'text-amber-600' },
          { label: 'Branch rate', value: `${stats.rate}%`, tone: 'text-indigo-600' },
        ].map((item) => (
          <Card key={item.label} className="p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.label}</p>
            <p className={cn('mt-1 text-xl font-black', item.tone)}>{item.value}</p>
          </Card>
        ))}
      </div>

      <Card className="p-0">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
            <Select
              value={batchId}
              onChange={(event) => setBatchId(event.target.value)}
              className="sm:max-w-xs"
              disabled={batches.length === 0}
            >
              {batches.length === 0 ? (
                <option value="">No batches available</option>
              ) : (
                batches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.name}
                  </option>
                ))
              )}
            </Select>
            {selectedBatch && (
              <span className="text-[11px] font-medium text-slate-500">
                {selectedBatch.scheduleDays || 'Days not set'} · {selectedBatch.timings || 'Timing not set'}
              </span>
            )}
          </div>

          {roster.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="secondary" size="sm" icon={CheckCheck} onClick={() => setAll('PRESENT')}>
                All present
              </Button>
              <Button variant="secondary" size="sm" icon={Ban} onClick={() => setAll('ABSENT')}>
                All absent
              </Button>
              <Button size="sm" icon={Save} loading={saving} onClick={handleSave}>
                Save attendance
              </Button>
            </div>
          )}
        </div>

        {loading ? (
          <LoadingBlock label="Loading attendance…" />
        ) : batches.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={CheckSquare}
              title="Create a batch first"
              description="Attendance is recorded per batch. Add a batch and assign students to start marking."
            />
          </div>
        ) : roster.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Users}
              title="No students in this batch"
              description="Assign students to this batch from the Students page, then return here to mark attendance."
            />
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-4 py-2.5 text-[11px] font-semibold text-slate-500">
              <span>{rosterStats.total} students</span>
              <span className="text-emerald-600">{rosterStats.present} present</span>
              <span className="text-rose-600">{rosterStats.absent} absent</span>
              <span className="text-amber-600">{rosterStats.late} late</span>
              <span className="text-slate-600">{rosterStats.excused} excused</span>
              <span className="ml-auto font-medium text-slate-400">
                Saving will update existing records for this date.
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {roster.map((student) => {
                const entry = entries[student.id] || { status: 'PRESENT' };
                return (
                  <div
                    key={student.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-slate-50/50"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Avatar name={student.fullName} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-xs font-bold text-slate-900">{student.fullName}</p>
                          {!student.active && <Badge tone="slate">Inactive</Badge>}
                          {entry.saved && <Badge tone="indigo">Saved</Badge>}
                        </div>
                        <p className="text-[10px] text-slate-400">{student.contactNumber}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {STATUS_OPTIONS.map((option) => {
                        const active = entry.status === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            title={option.label}
                            onClick={() => setStatus(student.id, option.value)}
                            className={cn(
                              'flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[10px] font-bold transition-all',
                              active
                                ? option.tone
                                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                            )}
                          >
                            <option.icon className="h-3 w-3" />
                            <span className="hidden sm:inline">{option.label}</span>
                            <span className="sm:hidden">{option.short}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>

      <Card>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Branch register · {formatDate(date)}</h2>
            <p className="text-[11px] text-slate-400">All attendance records saved across every batch.</p>
          </div>
          <Badge tone="indigo">{branchRecords.length} records</Badge>
        </div>

        {branchRecords.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-400">No attendance recorded for this date yet.</p>
        ) : (
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-2 pr-4">Student</th>
                  <th className="py-2 pr-4">Batch</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {branchRecords.map((record) => (
                  <tr key={record.id} className="text-xs">
                    <td className="py-2 pr-4 font-semibold text-slate-800">{record.studentName}</td>
                    <td className="py-2 pr-4 text-slate-500">{record.batchName}</td>
                    <td className="py-2 pr-4">
                      <Badge
                        tone={
                          record.status === 'PRESENT'
                            ? 'emerald'
                            : record.status === 'ABSENT'
                              ? 'rose'
                              : record.status === 'LATE'
                                ? 'amber'
                                : 'slate'
                        }
                      >
                        {record.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
