import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  CreditCard,
  MapPin,
  ArrowUpRight,
  Building2,
  Phone,
  Mail,
  CalendarClock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import NoBranchState from '../components/NoBranchState';
import { Badge, Button, Card, EmptyState, ErrorBanner, LoadingBlock, PageHeader } from '../components/ui';
import {
  cn,
  formatCurrency,
  formatTime,
  formatTimeRange,
  getErrorMessage,
  minutesOf,
  sortByStartTime,
  todayIso,
} from '../utils/format';

function sessionStatus(schedule, nowMinutes) {
  const start = minutesOf(schedule.startTime);
  const end = minutesOf(schedule.endTime);
  if (nowMinutes > end) return { label: 'Completed', tone: 'emerald' };
  if (nowMinutes >= start && nowMinutes <= end) return { label: 'In progress', tone: 'amber' };
  return { label: 'Upcoming', tone: 'indigo' };
}

export default function Overview() {
  const { selectedBranch, user } = useApp();
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [feeRecords, setFeeRecords] = useState([]);
  const [report, setReport] = useState(null);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedBranch) return;
    let active = true;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [overviewRes, feesRes, reportRes, batchesRes] = await Promise.all([
          api.get(`/overview/branch/${selectedBranch.id}`),
          api.get(`/fees/records/branch/${selectedBranch.id}`),
          api.get(`/reports/branch/${selectedBranch.id}`),
          api.get(`/batches?branchId=${selectedBranch.id}`),
        ]);
        if (!active) return;
        setOverview(overviewRes.data);
        setFeeRecords(feesRes.data || []);
        setReport(reportRes.data);
        setBatches(batchesRes.data || []);
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

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const schedules = useMemo(() => sortByStartTime(overview?.upcomingClasses || []), [overview]);
  const nextClass = useMemo(
    () => schedules.find((schedule) => minutesOf(schedule.endTime) >= nowMinutes) || null,
    [schedules, nowMinutes]
  );
  const attendanceRate =
    overview && overview.todayTotalAttendanceRecorded > 0
      ? Math.round((overview.todayPresentAttendance / overview.todayTotalAttendanceRecorded) * 100)
      : 0;

  const batchById = useMemo(() => {
    const map = new Map();
    batches.forEach((batch) => map.set(batch.id, batch));
    return map;
  }, [batches]);

  const pendingRecords = useMemo(
    () => feeRecords.filter((record) => Number(record.pendingAmount) > 0),
    [feeRecords]
  );
  const overdueRecords = useMemo(
    () => pendingRecords.filter((record) => record.dueDate && record.dueDate < todayIso()),
    [pendingRecords]
  );
  const topPending = useMemo(
    () =>
      [...pendingRecords]
        .sort((a, b) => Number(b.pendingAmount) - Number(a.pendingAmount))
        .slice(0, 3),
    [pendingRecords]
  );

  const collected = Number(report?.totalFeesCollected || 0);
  const pending = Number(report?.totalFeesPending || 0);
  const billed = collected + pending;
  const collectionRate = billed > 0 ? Math.round((collected / billed) * 100) : 0;

  if (!selectedBranch) {
    return <NoBranchState />;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-indigo-200/50 bg-indigo-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-indigo-600">
              Branch operations
            </span>
            <span className="flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live records
            </span>
          </div>
        }
        title="Branch overview"
        subtitle={
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-semibold text-slate-700">{selectedBranch.name}</span> ·{' '}
            {user?.businessName || 'Your academy'} · Branch #{selectedBranch.id}
          </span>
        }
        actions={
          <>
            <Button variant="secondary" icon={Plus} onClick={() => navigate('/students?new=1')}>
              Add student
            </Button>
            <Button variant="secondary" icon={CreditCard} onClick={() => navigate('/fees?new=1')}>
              Record payment
            </Button>
            <Button icon={CheckCircle2} onClick={() => navigate('/attendance')}>
              Mark attendance
            </Button>
          </>
        }
      />

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      {loading ? (
        <LoadingBlock label="Loading branch data…" />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
            <Card className="p-4">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total students</span>
                <Users className="h-4 w-4 text-indigo-500" />
              </div>
              <p className="mt-2 text-2xl font-black text-slate-900">{overview?.totalStudents ?? 0}</p>
              <p className="mt-1 text-[10px] text-slate-400">Enrolled in this branch</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Active batches</span>
                <Calendar className="h-4 w-4 text-indigo-500" />
              </div>
              <p className="mt-2 text-2xl font-black text-slate-900">{overview?.activeBatches ?? 0}</p>
              <p className="mt-1 text-[10px] text-slate-400">Batches running in this campus</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Today's classes</span>
                <Clock className="h-4 w-4 text-indigo-500" />
              </div>
              <p className="mt-2 text-2xl font-black text-slate-900">{overview?.todayClasses ?? 0}</p>
              <p className="mt-1 text-[10px] text-slate-400">
                {schedules.length > 0 ? 'On today’s timetable' : 'No sessions scheduled today'}
              </p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Attendance</span>
                <span className="text-xs font-bold text-emerald-600">%</span>
              </div>
              <p className="mt-2 text-2xl font-black text-slate-900">{attendanceRate}%</p>
              <p className="mt-1 text-[10px] text-slate-400">
                {overview?.todayPresentAttendance ?? 0} present ·{' '}
                {(overview?.todayTotalAttendanceRecorded ?? 0) - (overview?.todayPresentAttendance ?? 0)}{' '}
                absent · {overview?.todayTotalAttendanceRecorded ?? 0} marked
              </p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Pending fees</span>
                <AlertCircle className="h-4 w-4 text-amber-500" />
              </div>
              <p className="mt-2 text-2xl font-black text-slate-900">
                {formatCurrency(overview?.pendingFees ?? 0)}
              </p>
              <p className={cn('mt-1 text-[10px]', overdueRecords.length > 0 ? 'font-bold text-rose-500' : 'text-slate-400')}>
                {overdueRecords.length} overdue · {pendingRecords.length} open records
              </p>
            </Card>

            <div className="flex flex-col justify-between rounded-2xl bg-indigo-600 p-4 text-white shadow-md shadow-indigo-200">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-indigo-200">
                <span>Next class</span>
                {nextClass && <Badge tone="indigo" className="border-white/20 bg-white/20 text-white">Today</Badge>}
              </div>
              {nextClass ? (
                <>
                  <div className="my-1">
                    <p className="truncate text-sm font-extrabold tracking-tight">{nextClass.batchName}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-indigo-100">
                      <Clock className="h-3 w-3" />
                      {formatTimeRange(nextClass.startTime, nextClass.endTime)}
                    </p>
                  </div>
                  <p className="truncate text-[10px] text-indigo-200">
                    {nextClass.roomOrLocation || 'Room not set'} ·{' '}
                    {batchById.get(nextClass.batchId)?.studentCount ?? 0} students
                  </p>
                </>
              ) : (
                <div className="my-2 text-[11px] text-indigo-100">
                  No more classes today. {schedules.length} session{schedules.length === 1 ? '' : 's'} already done.
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Today's class schedule</h2>
                      <p className="text-[11px] text-slate-400">
                        Sessions synced from the schedule for {selectedBranch.name}
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/batches?tab=schedule"
                    className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:underline"
                  >
                    Manage schedule <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>

                {schedules.length === 0 ? (
                  <EmptyState
                    icon={CalendarClock}
                    title="No classes today"
                    description="Add a weekly schedule for your batches and today's sessions will appear here."
                    action={
                      <Button variant="secondary" size="sm" onClick={() => navigate('/batches?tab=schedule')}>
                        Open schedule
                      </Button>
                    }
                  />
                ) : (
                  <div className="mt-2 divide-y divide-slate-100">
                    {schedules.map((schedule) => {
                      const status = sessionStatus(schedule, nowMinutes);
                      return (
                        <div
                          key={schedule.id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-xl px-2 py-3.5 transition-colors hover:bg-slate-50/70"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-14 text-center">
                              <span className="block text-xs font-black text-slate-800">
                                {formatTime(schedule.startTime).replace(/\s?[AP]M/i, '')}
                              </span>
                              <span className="block text-[10px] font-medium text-slate-400">
                                {formatTime(schedule.startTime).match(/[AP]M/i)?.[0] || ''}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-bold text-slate-900">{schedule.batchName}</span>
                                {schedule.roomOrLocation && (
                                  <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-600">
                                    {schedule.roomOrLocation}
                                  </span>
                                )}
                              </div>
                              <p className="mt-0.5 text-[11px] text-slate-400">
                                {formatTimeRange(schedule.startTime, schedule.endTime)} ·{' '}
                                {batchById.get(schedule.batchId)?.studentCount ?? 0} students
                                {batchById.get(schedule.batchId)?.subjectOrProgramme
                                  ? ` · ${batchById.get(schedule.batchId).subjectOrProgramme}`
                                  : ''}
                              </p>
                            </div>
                          </div>
                          <Badge tone={status.tone}>{status.label}</Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>

              <Card>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-bold text-slate-900">Batches at a glance</h2>
                  <Link to="/batches" className="text-[11px] font-bold text-indigo-600 hover:underline">
                    View all
                  </Link>
                </div>
                {batches.length === 0 ? (
                  <EmptyState
                    icon={Calendar}
                    title="No batches yet"
                    description="Create a batch to group students and build a class schedule."
                    action={
                      <Button size="sm" variant="secondary" onClick={() => navigate('/batches?new=1')}>
                        Create batch
                      </Button>
                    }
                  />
                ) : (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {batches.slice(0, 4).map((batch) => {
                      const capacity = batch.maxCapacity || 0;
                      const fill = capacity > 0 ? Math.min(100, Math.round((batch.studentCount / capacity) * 100)) : 0;
                      return (
                        <div key={batch.id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold text-slate-800">{batch.name}</p>
                              <p className="truncate text-[10px] text-slate-400">
                                {batch.scheduleDays || 'Days not set'} · {batch.timings || 'Timing not set'}
                              </p>
                            </div>
                            <span className="shrink-0 text-[10px] font-bold text-slate-500">
                              {batch.studentCount}
                              {capacity > 0 ? `/${capacity}` : ''}
                            </span>
                          </div>
                          {capacity > 0 && (
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
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
            </div>

            <div className="space-y-6">
              <Card>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-900">
                    <CreditCard className="h-3.5 w-3.5 text-indigo-500" />
                    Fee collection
                  </span>
                  <Link to="/fees" className="text-[10px] font-bold text-indigo-600 hover:underline">
                    Open ledger
                  </Link>
                </div>

                <div className="my-5 flex flex-col items-center">
                  <div className="relative flex h-32 w-32 items-center justify-center">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-100"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-emerald-500 transition-all duration-700"
                        strokeDasharray={`${collectionRate}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-2xl font-black text-slate-900">{collectionRate}%</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Collected</span>
                    </div>
                  </div>

                  <div className="mt-4 grid w-full grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-center">
                    <div>
                      <span className="block text-[10px] font-bold uppercase text-slate-400">Collected</span>
                      <span className="text-sm font-black text-slate-900">{formatCurrency(collected)}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold uppercase text-slate-400">Pending</span>
                      <span className="text-sm font-black text-rose-600">{formatCurrency(pending)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-2 space-y-2 border-t border-slate-100 pt-4">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Top outstanding accounts
                  </span>
                  {topPending.length === 0 ? (
                    <p className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500">
                      No outstanding fees for this branch.
                    </p>
                  ) : (
                    topPending.map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50 p-2"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-[11px] font-bold text-slate-800">{record.studentName}</p>
                          <p className="truncate text-[10px] text-slate-400">
                            {record.title} · {formatCurrency(record.pendingAmount)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate(`/fees?studentId=${record.studentId}&recordId=${record.id}`)}
                          className="shrink-0 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-700 shadow-2xs hover:bg-slate-100"
                        >
                          Record
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              <Card className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-900">
                    <Building2 className="h-3.5 w-3.5 text-indigo-500" />
                    Branch details
                  </span>
                  <Link to="/branches" className="text-[10px] font-bold text-indigo-600 hover:underline">
                    Manage
                  </Link>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="block text-[10px] font-bold uppercase text-slate-400">Name</span>
                    <p className="font-semibold text-slate-700">{selectedBranch.name}</p>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase text-slate-400">Address</span>
                    <p className="font-medium text-slate-700">{selectedBranch.address || 'Not set'}</p>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-medium">{selectedBranch.contactNumber || 'Contact not set'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span className="truncate font-medium">{selectedBranch.email || 'Email not set'}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
