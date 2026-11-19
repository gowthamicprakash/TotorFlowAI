import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  Users,
  CalendarDays,
  Wallet,
  Clock,
  ArrowRight,
  AlertCircle,
  Mic,
  CreditCard,
  MapPin,
  Wrench,
} from 'lucide-react';
import { Avatar, Badge } from './ui';
import {
  cn,
  formatCurrency,
  formatDate,
  formatTimeRange,
  initialsOf,
} from '../utils/format';

const KIND_LABELS = {
  student: 'Student registry',
  overview: 'Branch overview',
  fees: 'Fee ledger query',
  schedule: 'Schedule sync',
  students: 'Student lookup',
  batches: 'Batch engine',
  attendance: 'Attendance ledger',
  payment: 'Payment recorded',
  error: 'Action failed',
};

function StudentCard({ data }) {
  return (
    <div className="mt-2.5 rounded-xl border border-emerald-200 bg-emerald-50/40 p-3">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Student created & enrolled
        </span>
        <Badge tone="emerald">Verified</Badge>
      </div>
      <div className="mt-2.5 flex items-center gap-3">
        <Avatar name={data.fullName} className="h-10 w-10 text-xs" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-900">{data.fullName}</p>
          <p className="text-[11px] text-slate-500">{data.contactNumber}</p>
        </div>
      </div>
      <div className="mt-2.5 grid grid-cols-2 gap-2 border-t border-emerald-200/60 pt-2 text-[10px]">
        <div>
          <span className="block font-bold uppercase tracking-wider text-slate-400">Branch</span>
          <span className="font-semibold text-slate-700">{data.branchName || '—'}</span>
        </div>
        <div>
          <span className="block font-bold uppercase tracking-wider text-slate-400">Batch</span>
          <span className="font-semibold text-slate-700">{data.batchName || 'Not assigned'}</span>
        </div>
      </div>
      <div className="mt-2.5 flex items-center justify-between border-t border-emerald-200/60 pt-2">
        <span className="text-[10px] font-semibold text-emerald-700">Database synced</span>
        <Link to="/students" className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:underline">
          View in Students <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

function OverviewCard({ data }) {
  const items = [
    { label: 'Students', value: data.totalStudents, icon: Users, tone: 'text-indigo-600 bg-indigo-50' },
    { label: 'Batches', value: data.activeBatches, icon: CalendarDays, tone: 'text-purple-600 bg-purple-50' },
    { label: 'Today’s classes', value: data.todayClasses, icon: Clock, tone: 'text-emerald-600 bg-emerald-50' },
    {
      label: 'Pending fees',
      value: formatCurrency(data.pendingFees),
      icon: Wallet,
      tone: 'text-rose-600 bg-rose-50',
    },
  ];
  return (
    <div className="mt-2.5 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {data.branchName} · branch snapshot
      </p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {items.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="rounded-lg border border-slate-200/70 bg-white p-2">
            <div className="flex items-center gap-1.5">
              <span className={cn('rounded-md p-1', tone)}>
                <Icon className="h-3 w-3" />
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
            </div>
            <p className="mt-1 text-sm font-black text-slate-900">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[10px] text-slate-400">
          Attendance today: {data.todayPresentAttendance}/{data.todayTotalAttendanceRecorded} present
        </span>
        <Link to="/overview" className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:underline">
          Open dashboard <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

function FeesCard({ data }) {
  return (
    <div className="mt-2.5 overflow-hidden rounded-xl border border-rose-200">
      <div className="flex items-center justify-between bg-rose-50 px-3 py-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-rose-500">Outstanding tuition</p>
          <p className="text-sm font-black text-rose-700">
            {formatCurrency(data.total)} pending
            <span className="ml-1 text-[11px] font-semibold text-rose-500">
              across {data.count} {data.count === 1 ? 'record' : 'records'}
            </span>
          </p>
        </div>
        <Badge tone="rose">Action</Badge>
      </div>
      {data.records?.length > 0 && (
        <div className="divide-y divide-slate-100 bg-white">
          {data.records.map((record) => (
            <div key={record.id} className="flex items-center justify-between gap-2 px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-[11px] font-bold text-slate-800">{record.studentName}</p>
                <p className="truncate text-[10px] text-slate-400">
                  {record.title} · due {formatDate(record.dueDate)}
                </p>
              </div>
              <span className="shrink-0 text-[11px] font-black text-rose-600">
                {formatCurrency(record.pendingAmount)}
              </span>
            </div>
          ))}
        </div>
      )}
      <Link
        to="/fees"
        className="flex items-center justify-center gap-1 border-t border-slate-100 bg-slate-50 px-3 py-2 text-[10px] font-bold text-indigo-600 hover:bg-slate-100"
      >
        Open full fee ledger <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

function ScheduleCard({ data }) {
  return (
    <div className="mt-2.5 overflow-hidden rounded-xl border border-slate-200">
      <div className="flex items-center justify-between bg-slate-50 px-3 py-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Today's classes</p>
        <Badge tone="indigo">{data.length} sessions</Badge>
      </div>
      <div className="divide-y divide-slate-100 bg-white">
        {data.map((session) => (
          <div key={session.id} className="flex items-center justify-between gap-2 px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-[11px] font-bold text-slate-800">{session.batchName}</p>
              <p className="flex items-center gap-1 text-[10px] text-slate-400">
                <MapPin className="h-2.5 w-2.5" />
                {session.roomOrLocation || 'Room not set'}
              </p>
            </div>
            <span className="shrink-0 rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-600">
              {formatTimeRange(session.startTime, session.endTime)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StudentList({ data }) {
  return (
    <div className="mt-2.5 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
      {data.map((student) => (
        <div key={student.id} className="flex items-center justify-between gap-2 px-3 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <Avatar name={student.fullName} className="h-7 w-7 text-[9px]" />
            <div className="min-w-0">
              <p className="truncate text-[11px] font-bold text-slate-800">{student.fullName}</p>
              <p className="truncate text-[10px] text-slate-400">
                {student.contactNumber} · {student.batchName || 'No batch'}
              </p>
            </div>
          </div>
          <Badge tone={student.active ? 'emerald' : 'slate'}>{student.active ? 'Active' : 'Inactive'}</Badge>
        </div>
      ))}
    </div>
  );
}

function BatchList({ data }) {
  return (
    <div className="mt-2.5 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
      {data.map((batch) => (
        <div key={batch.id} className="flex items-center justify-between gap-2 px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-[11px] font-bold text-slate-800">{batch.name}</p>
            <p className="truncate text-[10px] text-slate-400">
              {batch.scheduleDays || 'Days not set'} · {batch.timings || 'Timing not set'}
            </p>
          </div>
          <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
            {batch.studentCount}
            {batch.maxCapacity ? `/${batch.maxCapacity}` : ''} students
          </span>
        </div>
      ))}
    </div>
  );
}

function AttendanceCard({ data }) {
  return (
    <div className="mt-2.5 rounded-xl border border-emerald-200 bg-emerald-50/40 p-3">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Attendance saved
        </span>
        <Badge tone="emerald">Verified</Badge>
      </div>
      <p className="mt-1.5 text-[11px] text-slate-600">
        {data.count} {data.count === 1 ? 'student' : 'students'} marked{' '}
        <span className="font-bold text-slate-800">{data.status.toLowerCase()}</span>
        {data.batchName ? ` in ${data.batchName}` : ''}.
      </p>
      <Link to="/attendance" className="mt-2 flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:underline">
        Open attendance register <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

function PaymentCard({ data }) {
  return (
    <div className="mt-2.5 rounded-xl border border-emerald-200 bg-emerald-50/40 p-3">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
          <CreditCard className="h-3.5 w-3.5" />
          Payment recorded
        </span>
        <Badge tone="emerald">Ledger updated</Badge>
      </div>
      <div className="mt-2 flex items-end justify-between">
        <div>
          <p className="text-lg font-black text-slate-900">{formatCurrency(data.amount)}</p>
          <p className="text-[10px] text-slate-500">
            {data.studentName} · {formatDate(data.paymentDate)} ·{' '}
            {(data.paymentMethod || 'CASH').toLowerCase().replace('_', ' ')}
          </p>
        </div>
        <Link to="/fees" className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:underline">
          Fee ledger <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

function Body({ message }) {
  const { kind, data, text } = message;

  if (kind === 'error') {
    return (
      <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-[11px] font-medium text-rose-700">
        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>{text}</span>
      </div>
    );
  }

  return (
    <>
      {text && <p className="text-[11.5px] leading-relaxed text-slate-700">{text}</p>}
      {kind === 'student' && data && <StudentCard data={data} />}
      {kind === 'overview' && data && <OverviewCard data={data} />}
      {kind === 'fees' && data && <FeesCard data={data} />}
      {kind === 'schedule' && data && <ScheduleCard data={data} />}
      {kind === 'students' && data && <StudentList data={data} />}
      {kind === 'batches' && data && <BatchList data={data} />}
      {kind === 'attendance' && data && <AttendanceCard data={data} />}
      {kind === 'payment' && data && <PaymentCard data={data} />}
    </>
  );
}

export default function AiMessage({ message, userName }) {
  if (message.role === 'user') {
    return (
      <div className="flex animate-fade-in justify-end gap-2.5">
        <div className="max-w-[82%]">
          <div className="mb-1 flex items-center justify-end gap-1.5 text-[10px] font-medium text-slate-400">
            {message.source === 'voice' && (
              <span className="flex items-center gap-0.5 rounded bg-indigo-50 px-1 py-0.5 font-bold text-indigo-500">
                <Mic className="h-2.5 w-2.5" /> Voice
              </span>
            )}
            <span>{message.time}</span>
          </div>
          <div className="rounded-2xl rounded-tr-sm bg-indigo-600 px-4 py-2.5 text-xs font-medium leading-relaxed text-white shadow-sm shadow-indigo-200">
            {message.text}
          </div>
        </div>
        <div className="mt-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-[9px] font-bold text-white">
          {initialsOf(userName)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex animate-fade-in gap-2.5">
      <div className="mt-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm shadow-indigo-200">
        <Sparkles className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
          <span className="font-bold text-slate-700">TutorFlow Assistant</span>
          {KIND_LABELS[message.kind] && (
            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-500">
              {KIND_LABELS[message.kind]}
            </span>
          )}
          <span>{message.time}</span>
        </div>
        <div className="rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-4 py-3 shadow-2xs">
          <Body message={message} />
          {message.meta && (
            <div className="mt-2 flex items-center gap-1.5 border-t border-slate-100 pt-2 text-[9px] font-semibold text-slate-400">
              <Wrench className="h-2.5 w-2.5" />
              {message.meta}
              <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
