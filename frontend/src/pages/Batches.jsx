import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Plus,
  CalendarDays,
  Clock,
  MapPin,
  Pencil,
  Trash2,
  Users,
  Layers,
  CalendarPlus,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import NoBranchState from '../components/NoBranchState';
import { useToast } from '../components/Toast';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorBanner,
  Field,
  Input,
  LoadingBlock,
  Modal,
  PageHeader,
  Select,
} from '../components/ui';
import {
  cn,
  formatTimeRange,
  getErrorMessage,
  sortByStartTime,
} from '../utils/format';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const emptyBatch = { name: '', subjectOrProgramme: '', scheduleDays: '', timings: '', maxCapacity: '' };
const emptySchedule = { batchId: '', dayOfWeek: 'MONDAY', startTime: '10:00', endTime: '11:30', roomOrLocation: '' };

export default function Batches() {
  const { selectedBranch } = useApp();
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') === 'schedule' ? 'schedule' : 'batches';

  const [batches, setBatches] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [batchOpen, setBatchOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [batchForm, setBatchForm] = useState(emptyBatch);
  const [batchSaving, setBatchSaving] = useState(false);
  const [batchError, setBatchError] = useState('');

  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [scheduleForm, setScheduleForm] = useState(emptySchedule);
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [scheduleError, setScheduleError] = useState('');
  const [deletingSchedule, setDeletingSchedule] = useState(null);
  const [deleteSaving, setDeleteSaving] = useState(false);

  const load = async () => {
    if (!selectedBranch) return;
    setLoading(true);
    setError('');
    try {
      const [batchesRes, schedulesRes] = await Promise.all([
        api.get(`/batches?branchId=${selectedBranch.id}`),
        api.get(`/schedules/branch/${selectedBranch.id}`),
      ]);
      setBatches(batchesRes.data || []);
      setSchedules(schedulesRes.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [selectedBranch?.id]);

  const setTab = (nextTab) => {
    if (nextTab === 'schedule') setSearchParams({ tab: 'schedule' });
    else setSearchParams({});
  };

  const openCreateBatch = () => {
    setEditingBatch(null);
    setBatchForm(emptyBatch);
    setBatchError('');
    setBatchOpen(true);
  };

  const openEditBatch = (batch) => {
    setEditingBatch(batch);
    setBatchForm({
      name: batch.name || '',
      subjectOrProgramme: batch.subjectOrProgramme || '',
      scheduleDays: batch.scheduleDays || '',
      timings: batch.timings || '',
      maxCapacity: batch.maxCapacity ?? '',
    });
    setBatchError('');
    setBatchOpen(true);
  };

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      openCreateBatch();
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);

  const updateBatch = (field) => (event) =>
    setBatchForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSaveBatch = async (event) => {
    event?.preventDefault?.();
    setBatchError('');
    if (!batchForm.name.trim()) {
      setBatchError('Batch name is required.');
      return;
    }
    setBatchSaving(true);
    const payload = {
      branchId: selectedBranch.id,
      name: batchForm.name.trim(),
      subjectOrProgramme: batchForm.subjectOrProgramme.trim() || null,
      scheduleDays: batchForm.scheduleDays.trim() || null,
      timings: batchForm.timings.trim() || null,
      maxCapacity: batchForm.maxCapacity === '' ? null : Number(batchForm.maxCapacity),
    };
    try {
      if (editingBatch) {
        await api.put(`/batches/${editingBatch.id}`, payload);
        toast.success(`${payload.name} updated.`);
      } else {
        await api.post('/batches', payload);
        toast.success(`${payload.name} created.`);
      }
      setBatchOpen(false);
      await load();
    } catch (err) {
      setBatchError(getErrorMessage(err));
    } finally {
      setBatchSaving(false);
    }
  };

  const openCreateSchedule = () => {
    if (batches.length === 0) {
      setTab('batches');
      openCreateBatch();
      return;
    }
    setEditingSchedule(null);
    setScheduleForm({ ...emptySchedule, batchId: String(batches[0].id) });
    setScheduleError('');
    setScheduleOpen(true);
  };

  const openEditSchedule = (schedule) => {
    setEditingSchedule(schedule);
    setScheduleForm({
      batchId: String(schedule.batchId),
      dayOfWeek: schedule.dayOfWeek,
      startTime: String(schedule.startTime).slice(0, 5),
      endTime: String(schedule.endTime).slice(0, 5),
      roomOrLocation: schedule.roomOrLocation || '',
    });
    setScheduleError('');
    setScheduleOpen(true);
  };

  const updateSchedule = (field) => (event) =>
    setScheduleForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSaveSchedule = async (event) => {
    event?.preventDefault?.();
    setScheduleError('');
    if (!scheduleForm.batchId) {
      setScheduleError('Select a batch for this class.');
      return;
    }
    if (scheduleForm.endTime <= scheduleForm.startTime) {
      setScheduleError('End time must be after the start time.');
      return;
    }
    setScheduleSaving(true);
    const payload = {
      branchId: selectedBranch.id,
      batchId: Number(scheduleForm.batchId),
      dayOfWeek: scheduleForm.dayOfWeek,
      startTime: scheduleForm.startTime,
      endTime: scheduleForm.endTime,
      roomOrLocation: scheduleForm.roomOrLocation.trim() || null,
    };
    try {
      if (editingSchedule) {
        await api.put(`/schedules/${editingSchedule.id}`, payload);
        toast.success('Class schedule updated.');
      } else {
        await api.post('/schedules', payload);
        toast.success('Class added to the weekly schedule.');
      }
      setScheduleOpen(false);
      await load();
    } catch (err) {
      setScheduleError(getErrorMessage(err));
    } finally {
      setScheduleSaving(false);
    }
  };

  const handleDeleteSchedule = async () => {
    if (!deletingSchedule) return;
    setDeleteSaving(true);
    try {
      await api.delete(`/schedules/${deletingSchedule.id}`);
      toast.success('Class removed from the schedule.');
      setDeletingSchedule(null);
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleteSaving(false);
    }
  };

  const schedulesByDay = useMemo(() => {
    const grouped = DAYS.reduce((acc, day) => ({ ...acc, [day]: [] }), {});
    schedules.forEach((schedule) => {
      if (grouped[schedule.dayOfWeek]) grouped[schedule.dayOfWeek].push(schedule);
    });
    DAYS.forEach((day) => {
      grouped[day] = sortByStartTime(grouped[day]);
    });
    return grouped;
  }, [schedules]);

  const totalEnrolled = batches.reduce((sum, batch) => sum + (batch.studentCount || 0), 0);

  if (!selectedBranch) return <NoBranchState />;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow={
          <span className="rounded-md border border-indigo-200/50 bg-indigo-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-indigo-600">
            Programmes & timetable
          </span>
        }
        title="Batches & schedule"
        subtitle={`${batches.length} batches · ${schedules.length} weekly sessions · ${totalEnrolled} enrolled students at ${selectedBranch.name}.`}
        actions={
          <>
            <Button variant="secondary" icon={CalendarPlus} onClick={openCreateSchedule}>
              Add class
            </Button>
            <Button icon={Plus} onClick={openCreateBatch}>
              New batch
            </Button>
          </>
        }
      />

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      <div className="flex w-fit items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
        {[
          { key: 'batches', label: 'Batches', icon: Layers },
          { key: 'schedule', label: 'Weekly schedule', icon: CalendarDays },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all',
              tab === key ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingBlock label="Loading batches and schedule…" />
      ) : tab === 'batches' ? (
        batches.length === 0 ? (
          <Card>
            <EmptyState
              icon={Layers}
              title="No batches yet"
              description="Create a batch to group students by programme, days and timings."
              action={
                <Button icon={Plus} size="sm" onClick={openCreateBatch}>
                  Create first batch
                </Button>
              }
            />
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {batches.map((batch) => {
              const capacity = batch.maxCapacity || 0;
              const fill = capacity > 0 ? Math.min(100, Math.round((batch.studentCount / capacity) * 100)) : 0;
              const daySessions = schedules.filter((schedule) => schedule.batchId === batch.id);
              return (
                <Card key={batch.id} className="flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-extrabold tracking-tight text-slate-900">{batch.name}</h3>
                      <p className="truncate text-[11px] text-slate-500">
                        {batch.subjectOrProgramme || 'Programme not set'}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditBatch(batch)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1.5 text-[11px] text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                      <span className="font-medium">{batch.scheduleDays || 'Days not set'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span className="font-medium">
                        {daySessions.length > 0
                          ? [...new Set(daySessions.map((session) => formatTimeRange(session.startTime, session.endTime)))].join(' · ')
                          : batch.timings || 'Timing not set'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span className="font-medium">
                        {[...new Set(daySessions.map((session) => session.roomOrLocation).filter(Boolean))].join(', ') ||
                          'Room not set'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        {batch.studentCount} students
                      </span>
                      {capacity > 0 && (
                        <Badge tone={fill >= 100 ? 'rose' : fill >= 80 ? 'amber' : 'emerald'}>
                          {batch.studentCount}/{capacity}
                        </Badge>
                      )}
                    </div>
                    {capacity > 0 && (
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={cn('h-full rounded-full', fill >= 100 ? 'bg-rose-500' : 'bg-indigo-500')}
                          style={{ width: `${fill}%` }}
                        />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => navigate(`/students?batch=${batch.id}`)}
                      className="mt-3 flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:underline"
                    >
                      View students <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )
      ) : schedules.length === 0 ? (
        <Card>
          <EmptyState
            icon={GraduationCap}
            title="Weekly schedule is empty"
            description="Add class days and timings so today's schedule and attendance are ready each day."
            action={
              <Button icon={CalendarPlus} size="sm" onClick={openCreateSchedule}>
                Add first class
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {DAYS.map((day) => (
            <Card key={day} className={cn('p-4', schedulesByDay[day].length === 0 && 'bg-slate-50/60')}>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {day.charAt(0) + day.slice(1).toLowerCase()}
                </h3>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                  {schedulesByDay[day].length}
                </span>
              </div>

              {schedulesByDay[day].length === 0 ? (
                <p className="py-4 text-center text-[11px] text-slate-400">No classes</p>
              ) : (
                <div className="space-y-2">
                  {schedulesByDay[day].map((session) => (
                    <div key={session.id} className="rounded-xl border border-slate-100 bg-white p-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-slate-800">{session.batchName}</p>
                          <p className="text-[10px] font-semibold text-indigo-600">
                            {formatTimeRange(session.startTime, session.endTime)}
                          </p>
                          <p className="truncate text-[10px] text-slate-400">
                            {session.roomOrLocation || 'Room not set'}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-0.5">
                          <button
                            type="button"
                            onClick={() => openEditSchedule(session)}
                            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingSchedule(session)}
                            className="rounded-md p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={batchOpen}
        onClose={() => setBatchOpen(false)}
        title={editingBatch ? 'Edit batch' : 'Create a batch'}
        subtitle={selectedBranch.name}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setBatchOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveBatch} loading={batchSaving}>
              {editingBatch ? 'Save changes' : 'Create batch'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveBatch} className="space-y-4">
          {batchError && <ErrorBanner message={batchError} onDismiss={() => setBatchError('')} />}
          <Field label="Batch name" required>
            <Input required value={batchForm.name} onChange={updateBatch('name')} placeholder="Kathak Beginners" />
          </Field>
          <Field label="Subject or programme">
            <Input
              value={batchForm.subjectOrProgramme}
              onChange={updateBatch('subjectOrProgramme')}
              placeholder="Bharatanatyam foundation"
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Class days" hint="e.g. Tue, Thu, Sat">
              <Input value={batchForm.scheduleDays} onChange={updateBatch('scheduleDays')} placeholder="Tue, Thu" />
            </Field>
            <Field label="Timings" hint="e.g. 5:00 PM – 6:30 PM">
              <Input value={batchForm.timings} onChange={updateBatch('timings')} placeholder="5:00 PM – 6:30 PM" />
            </Field>
          </div>
          <Field label="Maximum capacity" hint="Leave blank for no limit">
            <Input
              type="number"
              min="1"
              value={batchForm.maxCapacity}
              onChange={updateBatch('maxCapacity')}
              placeholder="20"
            />
          </Field>
          <button type="submit" className="hidden" aria-hidden="true" />
        </form>
      </Modal>

      <Modal
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        title={editingSchedule ? 'Edit class session' : 'Add class to schedule'}
        subtitle={`Weekly timetable · ${selectedBranch.name}`}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setScheduleOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSchedule} loading={scheduleSaving}>
              {editingSchedule ? 'Save changes' : 'Add class'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveSchedule} className="space-y-4">
          {scheduleError && <ErrorBanner message={scheduleError} onDismiss={() => setScheduleError('')} />}
          <Field label="Batch" required>
            <Select value={scheduleForm.batchId} onChange={updateSchedule('batchId')}>
              <option value="">Select a batch</option>
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Day of week" required>
            <Select value={scheduleForm.dayOfWeek} onChange={updateSchedule('dayOfWeek')}>
              {DAYS.map((day) => (
                <option key={day} value={day}>
                  {day.charAt(0) + day.slice(1).toLowerCase()}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start time" required>
              <Input type="time" required value={scheduleForm.startTime} onChange={updateSchedule('startTime')} />
            </Field>
            <Field label="End time" required>
              <Input type="time" required value={scheduleForm.endTime} onChange={updateSchedule('endTime')} />
            </Field>
          </div>
          <Field label="Room or location">
            <Input
              value={scheduleForm.roomOrLocation}
              onChange={updateSchedule('roomOrLocation')}
              placeholder="Studio A"
            />
          </Field>
          <button type="submit" className="hidden" aria-hidden="true" />
        </form>
      </Modal>

      <Modal
        open={Boolean(deletingSchedule)}
        onClose={() => setDeletingSchedule(null)}
        title="Remove class from schedule?"
        subtitle={deletingSchedule ? `${deletingSchedule.batchName} · ${deletingSchedule.dayOfWeek}` : ''}
        maxWidth="max-w-md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDeletingSchedule(null)}>
              Keep class
            </Button>
            <Button variant="danger" onClick={handleDeleteSchedule} loading={deleteSaving}>
              Remove class
            </Button>
          </div>
        }
      >
        <p className="text-xs leading-relaxed text-slate-600">
          This removes the recurring session from the weekly timetable. Attendance already recorded for past
          dates is not affected.
        </p>
      </Modal>
    </div>
  );
}
