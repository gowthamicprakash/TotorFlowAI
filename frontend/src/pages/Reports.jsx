import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Users,
  CalendarDays,
  Wallet,
  CheckCircle2,
  ArrowUpRight,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import NoBranchState from '../components/NoBranchState';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorBanner,
  LoadingBlock,
  PageHeader,
} from '../components/ui';
import { cn, formatCurrency, formatDate, getErrorMessage, todayIso } from '../utils/format';

export default function Reports() {
  const { selectedBranch } = useApp();
  const [report, setReport] = useState(null);
  const [batches, setBatches] = useState([]);
  const [records, setRecords] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedBranch) return;
    let active = true;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [reportRes, batchesRes, recordsRes, attendanceRes] = await Promise.all([
          api.get(`/reports/branch/${selectedBranch.id}`),
          api.get(`/batches?branchId=${selectedBranch.id}`),
          api.get(`/fees/records/branch/${selectedBranch.id}`),
          api.get(`/attendance/branch/${selectedBranch.id}?date=${todayIso()}`),
        ]);
        if (!active) return;
        setReport(reportRes.data);
        setBatches(batchesRes.data || []);
        setRecords(recordsRes.data || []);
        setAttendance(attendanceRes.data || []);
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
  }, [selectedBranch]);

  const feeStats = useMemo(() => {
    const collected = Number(report?.totalFeesCollected || 0);
    const pending = Number(report?.totalFeesPending || 0);
    const billed = collected + pending;
    const open = records.filter((record) => Number(record.pendingAmount) > 0);
    const overdue = open.filter((record) => record.dueDate && record.dueDate < todayIso());
    return {
      collected,
      pending,
      billed,
      rate: billed > 0 ? Math.round((collected / billed) * 100) : 0,
      open,
      overdue,
    };
  }, [report, records]);

  const attendanceStats = useMemo(() => {
    const present = attendance.filter((record) => record.status === 'PRESENT').length;
    const late = attendance.filter((record) => record.status === 'LATE').length;
    const absent = attendance.filter((record) => record.status === 'ABSENT').length;
    const excused = attendance.filter((record) => record.status === 'EXCUSED').length;
    const total = attendance.length;
    return { present, late, absent, excused, total, rate: total > 0 ? Math.round(((present + late) / total) * 100) : 0 };
  }, [attendance]);

  const topOutstanding = useMemo(
    () => [...feeStats.open].sort((a, b) => Number(b.pendingAmount) - Number(a.pendingAmount)).slice(0, 5),
    [feeStats.open]
  );

  if (!selectedBranch) return <NoBranchState />;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow={
          <span className="rounded-md border border-indigo-200/50 bg-indigo-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-indigo-600">
            Branch reporting
          </span>
        }
        title="Reports"
        subtitle={`Branch-specific summary for ${selectedBranch.name}. Cross-branch consolidation is not part of the MVP.`}
        actions={
          <Link to="/fees">
            <Button variant="secondary" icon={Wallet}>
              Open fee ledger
            </Button>
          </Link>
        }
      />

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      {loading ? (
        <LoadingBlock label="Building branch report…" />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Students</span>
                <Users className="h-4 w-4 text-indigo-500" />
              </div>
              <p className="mt-2 text-2xl font-black text-slate-900">{report?.totalStudents ?? 0}</p>
              <p className="mt-1 text-[10px] text-slate-400">Enrolled at {selectedBranch.name}</p>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Batches</span>
                <CalendarDays className="h-4 w-4 text-indigo-500" />
              </div>
              <p className="mt-2 text-2xl font-black text-slate-900">{report?.totalBatches ?? 0}</p>
              <p className="mt-1 text-[10px] text-slate-400">Programme groups running</p>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fees collected</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="mt-2 text-2xl font-black text-emerald-600">{formatCurrency(feeStats.collected)}</p>
              <p className="mt-1 text-[10px] text-slate-400">Across all recorded payments</p>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fees pending</span>
                <AlertCircle className="h-4 w-4 text-amber-500" />
              </div>
              <p className="mt-2 text-2xl font-black text-rose-600">{formatCurrency(feeStats.pending)}</p>
              <p className="mt-1 text-[10px] text-slate-400">{feeStats.overdue.length} overdue records</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-indigo-50 p-1.5 text-indigo-600">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-900">Fee collection</h2>
                </div>
                <Badge tone={feeStats.rate >= 80 ? 'emerald' : feeStats.rate >= 50 ? 'amber' : 'rose'}>
                  {feeStats.rate}%
                </Badge>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold">
                    <span className="text-slate-500">Collected</span>
                    <span className="text-emerald-600">{formatCurrency(feeStats.collected)}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${feeStats.rate}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold">
                    <span className="text-slate-500">Outstanding</span>
                    <span className="text-rose-600">{formatCurrency(feeStats.pending)}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-rose-500 transition-all"
                      style={{ width: `${feeStats.billed > 0 ? 100 - feeStats.rate : 0}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-center">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total billed</p>
                    <p className="mt-0.5 text-sm font-black text-slate-900">{formatCurrency(feeStats.billed)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Open accounts</p>
                    <p className="mt-0.5 text-sm font-black text-slate-900">{feeStats.open.length}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-900">Attendance today</h2>
                </div>
                <Badge tone="indigo">{formatDate(todayIso())}</Badge>
              </div>

              {attendanceStats.total === 0 ? (
                <EmptyState
                  icon={BarChart3}
                  title="No attendance marked today"
                  description="Attendance recorded from the register or the AI assistant will be summarised here."
                  action={
                    <Link to="/attendance">
                      <Button variant="secondary" size="sm">
                        Open register
                      </Button>
                    </Link>
                  }
                />
              ) : (
                <div className="mt-4 space-y-3">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-black text-slate-900">{attendanceStats.rate}%</p>
                      <p className="text-[11px] text-slate-400">
                        {attendanceStats.total} students marked across the branch
                      </p>
                    </div>
                    <Link to="/attendance" className="text-[11px] font-bold text-indigo-600 hover:underline">
                      View register
                    </Link>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: 'Present', value: attendanceStats.present, tone: 'text-emerald-600', bg: 'bg-emerald-50' },
                      { label: 'Absent', value: attendanceStats.absent, tone: 'text-rose-600', bg: 'bg-rose-50' },
                      { label: 'Late', value: attendanceStats.late, tone: 'text-amber-600', bg: 'bg-amber-50' },
                      { label: 'Excused', value: attendanceStats.excused, tone: 'text-slate-600', bg: 'bg-slate-50' },
                    ].map((item) => (
                      <div key={item.label} className={cn('rounded-xl p-2 text-center', item.bg)}>
                        <p className={cn('text-lg font-black', item.tone)}>{item.value}</p>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="p-0">
              <div className="flex items-center justify-between border-b border-slate-100 p-5">
                <h2 className="text-sm font-bold text-slate-900">Batch utilisation</h2>
                <Link to="/batches" className="text-[11px] font-bold text-indigo-600 hover:underline">
                  Manage batches
                </Link>
              </div>
              {batches.length === 0 ? (
                <div className="p-5">
                  <EmptyState icon={CalendarDays} title="No batches to report" />
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {batches.map((batch) => {
                    const capacity = batch.maxCapacity || 0;
                    const fill = capacity > 0 ? Math.min(100, Math.round((batch.studentCount / capacity) * 100)) : 0;
                    return (
                      <div key={batch.id} className="px-5 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-slate-800">{batch.name}</p>
                            <p className="truncate text-[10px] text-slate-400">
                              {batch.subjectOrProgramme || 'Programme not set'}
                            </p>
                          </div>
                          <span className="shrink-0 text-[11px] font-bold text-slate-600">
                            {batch.studentCount}
                            {capacity > 0 ? ` / ${capacity}` : ''}
                          </span>
                        </div>
                        {capacity > 0 && (
                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={cn('h-full rounded-full', fill >= 100 ? 'bg-rose-500' : 'bg-indigo-500')}
                              style={{ width: `${fill}%` }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            <Card className="p-0">
              <div className="flex items-center justify-between border-b border-slate-100 p-5">
                <h2 className="text-sm font-bold text-slate-900">Top outstanding accounts</h2>
                <Link to="/fees" className="text-[11px] font-bold text-indigo-600 hover:underline">
                  Open ledger
                </Link>
              </div>
              {topOutstanding.length === 0 ? (
                <div className="p-5">
                  <EmptyState icon={CheckCircle2} title="No outstanding fees" description="Every fee record for this branch is settled." />
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {topOutstanding.map((record) => (
                    <div key={record.id} className="flex items-center justify-between gap-3 px-5 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-slate-800">{record.studentName}</p>
                        <p className="truncate text-[10px] text-slate-400">
                          {record.title} · due {formatDate(record.dueDate)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-xs font-black text-rose-600">{formatCurrency(record.pendingAmount)}</span>
                        <Link
                          to={`/fees?studentId=${record.studentId}&recordId=${record.id}`}
                          className="rounded-lg border border-slate-200 bg-white p-1 text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
                        >
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
