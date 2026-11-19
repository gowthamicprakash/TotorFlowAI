import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  UserPlus,
  Search,
  Pencil,
  Layers,
  Power,
  Users,
  Phone,
  UserCheck,
  UserX,
  GraduationCap,
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
  Field,
  Input,
  LoadingBlock,
  Modal,
  PageHeader,
  Select,
} from '../components/ui';
import { cn, formatDate, getErrorMessage, todayIso } from '../utils/format';

const emptyForm = {
  fullName: '',
  contactNumber: '',
  parentOrGuardianName: '',
  age: '',
  dateOfBirth: '',
  joiningDate: todayIso(),
  batchId: '',
};

export default function Students() {
  const { selectedBranch } = useApp();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [batchFilter, setBatchFilter] = useState('all');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [assigning, setAssigning] = useState(null);
  const [assignBatchId, setAssignBatchId] = useState('');
  const [assignSaving, setAssignSaving] = useState(false);

  const load = async () => {
    if (!selectedBranch) return;
    setLoading(true);
    setError('');
    try {
      const [studentsRes, batchesRes] = await Promise.all([
        api.get(`/students?branchId=${selectedBranch.id}`),
        api.get(`/batches?branchId=${selectedBranch.id}`),
      ]);
      setStudents(studentsRes.data || []);
      setBatches(batchesRes.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [selectedBranch?.id]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, joiningDate: todayIso() });
    setFormError('');
    setFormOpen(true);
  };

  const openEdit = (student) => {
    setEditing(student);
    setForm({
      fullName: student.fullName || '',
      contactNumber: student.contactNumber || '',
      parentOrGuardianName: student.parentOrGuardianName || '',
      age: student.age ?? '',
      dateOfBirth: student.dateOfBirth || '',
      joiningDate: student.joiningDate || '',
      batchId: student.batchId ? String(student.batchId) : '',
    });
    setFormError('');
    setFormOpen(true);
  };

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      openCreate();
      setSearchParams({}, { replace: true });
    }
    const batchParam = searchParams.get('batch');
    if (batchParam) {
      setBatchFilter(batchParam);
    }
  }, [searchParams]);

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return students.filter((student) => {
      if (statusFilter === 'active' && !student.active) return false;
      if (statusFilter === 'inactive' && student.active) return false;
      if (batchFilter === 'none' && student.batchId) return false;
      if (batchFilter !== 'all' && batchFilter !== 'none' && String(student.batchId) !== batchFilter) return false;
      if (!query) return true;
      return [student.fullName, student.contactNumber, student.parentOrGuardianName]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query));
    });
  }, [students, search, statusFilter, batchFilter]);

  const activeCount = students.filter((student) => student.active).length;
  const unassignedCount = students.filter((student) => !student.batchId).length;

  const handleSave = async (event) => {
    event.preventDefault();
    setFormError('');
    if (!form.fullName.trim() || !form.contactNumber.trim()) {
      setFormError('Student name and contact number are required.');
      return;
    }
    setSaving(true);
    const payload = {
      branchId: selectedBranch.id,
      fullName: form.fullName.trim(),
      contactNumber: form.contactNumber.trim(),
      parentOrGuardianName: form.parentOrGuardianName.trim() || null,
      age: form.age === '' ? null : Number(form.age),
      dateOfBirth: form.dateOfBirth || null,
      joiningDate: form.joiningDate || null,
      batchId: form.batchId ? Number(form.batchId) : null,
      active: editing ? editing.active : true,
    };
    try {
      if (editing) {
        await api.put(`/students/${editing.id}`, payload);
        toast.success(`${payload.fullName} updated.`);
      } else {
        await api.post('/students', payload);
        toast.success(`${payload.fullName} added to ${selectedBranch.name}.`);
      }
      setFormOpen(false);
      await load();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (student) => {
    try {
      await api.put(`/students/${student.id}`, {
        branchId: student.branchId,
        fullName: student.fullName,
        contactNumber: student.contactNumber,
        parentOrGuardianName: student.parentOrGuardianName,
        age: student.age,
        dateOfBirth: student.dateOfBirth,
        joiningDate: student.joiningDate,
        batchId: student.batchId,
        active: !student.active,
      });
      toast.success(`${student.fullName} marked ${student.active ? 'inactive' : 'active'}.`);
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const openAssign = (student) => {
    setAssigning(student);
    setAssignBatchId(student.batchId ? String(student.batchId) : '');
  };

  const handleAssign = async () => {
    if (!assignBatchId) {
      toast.error('Select a batch first.');
      return;
    }
    setAssignSaving(true);
    try {
      await api.put(`/students/${assigning.id}/assign-batch/${assignBatchId}`);
      toast.success(`${assigning.fullName} assigned to a batch.`);
      setAssigning(null);
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAssignSaving(false);
    }
  };

  if (!selectedBranch) return <NoBranchState />;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow={
          <span className="rounded-md border border-indigo-200/50 bg-indigo-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-indigo-600">
            Student registry
          </span>
        }
        title="Students"
        subtitle={`All students enrolled at ${selectedBranch.name}.`}
        actions={
          <Button icon={UserPlus} onClick={openCreate}>
            Add student
          </Button>
        }
      />

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Total students', value: students.length, icon: Users, tone: 'text-indigo-500' },
          { label: 'Active', value: activeCount, icon: UserCheck, tone: 'text-emerald-500' },
          { label: 'Inactive', value: students.length - activeCount, icon: UserX, tone: 'text-rose-500' },
          { label: 'No batch yet', value: unassignedCount, icon: GraduationCap, tone: 'text-amber-500' },
        ].map(({ label, value, icon: Icon, tone }) => (
          <Card key={label} className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
              <Icon className={cn('h-4 w-4', tone)} />
            </div>
            <p className="mt-1.5 text-xl font-black text-slate-900">{value}</p>
          </Card>
        ))}
      </div>

      <Card className="p-0">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search name, contact or guardian…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="w-auto">
              <option value="all">All statuses</option>
              <option value="active">Active only</option>
              <option value="inactive">Inactive only</option>
            </Select>
            <Select value={batchFilter} onChange={(event) => setBatchFilter(event.target.value)} className="w-auto">
              <option value="all">All batches</option>
              <option value="none">No batch</option>
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {loading ? (
          <LoadingBlock label="Loading students…" />
        ) : filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Users}
              title={students.length === 0 ? 'No students yet' : 'No students match your filters'}
              description={
                students.length === 0
                  ? `Add your first student to ${selectedBranch.name}. Name, contact number and branch are all you need.`
                  : 'Try a different search term or clear the filters.'
              }
              action={
                students.length === 0 ? (
                  <Button icon={UserPlus} size="sm" onClick={openCreate}>
                    Add student
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSearch('');
                      setStatusFilter('all');
                      setBatchFilter('all');
                    }}
                  >
                    Clear filters
                  </Button>
                )
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Batch</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((student) => (
                  <tr key={student.id} className="text-xs transition-colors hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={student.fullName} />
                        <div className="min-w-0">
                          <p className="truncate font-bold text-slate-900">{student.fullName}</p>
                          <p className="truncate text-[10px] text-slate-400">
                            {student.parentOrGuardianName
                              ? `Guardian: ${student.parentOrGuardianName}`
                              : student.age
                                ? `${student.age} years`
                                : 'Guardian not set'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 font-medium text-slate-600">
                        <Phone className="h-3 w-3 text-slate-400" />
                        {student.contactNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {student.batchName ? (
                        <Badge tone="indigo">{student.batchName}</Badge>
                      ) : (
                        <span className="text-[10px] font-semibold text-amber-600">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-500">{formatDate(student.joiningDate)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={student.active ? 'emerald' : 'slate'}>
                        {student.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          title="Assign batch"
                          onClick={() => openAssign(student)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
                        >
                          <Layers className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Edit student"
                          onClick={() => openEdit(student)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          title={student.active ? 'Mark inactive' : 'Mark active'}
                          onClick={() => handleToggleActive(student)}
                          className={cn(
                            'rounded-lg p-1.5',
                            student.active
                              ? 'text-slate-400 hover:bg-rose-50 hover:text-rose-600'
                              : 'text-emerald-500 hover:bg-emerald-50 hover:text-emerald-600'
                          )}
                        >
                          <Power className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit student' : 'Add a new student'}
        subtitle={`${selectedBranch.name} · ${editing ? 'Update student details' : 'Name and contact number are required'}`}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}>
              {editing ? 'Save changes' : 'Add student'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && <ErrorBanner message={formError} onDismiss={() => setFormError('')} />}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Student name" required>
              <Input required value={form.fullName} onChange={update('fullName')} placeholder="Rahul Verma" />
            </Field>
            <Field label="Contact number" required>
              <Input
                required
                value={form.contactNumber}
                onChange={update('contactNumber')}
                placeholder="+91 98765 43210"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Parent / guardian">
              <Input
                value={form.parentOrGuardianName}
                onChange={update('parentOrGuardianName')}
                placeholder="Optional"
              />
            </Field>
            <Field label="Batch">
              <Select value={form.batchId} onChange={update('batchId')}>
                <option value="">Not assigned yet</option>
                {batches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Age">
              <Input type="number" min="1" max="120" value={form.age} onChange={update('age')} placeholder="Optional" />
            </Field>
            <Field label="Date of birth">
              <Input type="date" value={form.dateOfBirth} onChange={update('dateOfBirth')} />
            </Field>
            <Field label="Joining date">
              <Input type="date" value={form.joiningDate} onChange={update('joiningDate')} />
            </Field>
          </div>

          <button type="submit" className="hidden" aria-hidden="true" />
        </form>
      </Modal>

      <Modal
        open={Boolean(assigning)}
        onClose={() => setAssigning(null)}
        title="Assign to batch"
        subtitle={assigning ? `${assigning.fullName} · ${selectedBranch.name}` : ''}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setAssigning(null)}>
              Cancel
            </Button>
            <Button onClick={handleAssign} loading={assignSaving} disabled={!assignBatchId}>
              Assign batch
            </Button>
          </div>
        }
      >
        <Field label="Batch" required>
          <Select value={assignBatchId} onChange={(event) => setAssignBatchId(event.target.value)}>
            <option value="">Select a batch</option>
            {batches.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.name} {batch.maxCapacity ? `· ${batch.studentCount}/${batch.maxCapacity}` : ''}
              </option>
            ))}
          </Select>
        </Field>
      </Modal>
    </div>
  );
}
