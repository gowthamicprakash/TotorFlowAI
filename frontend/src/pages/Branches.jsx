import React, { useEffect, useState } from 'react';
import {
  Building2,
  Plus,
  Pencil,
  MapPin,
  Phone,
  Mail,
  Users,
  CalendarDays,
  Wallet,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import api from '../services/api';
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
} from '../components/ui';
import { cn, formatCurrency, getErrorMessage } from '../utils/format';

const emptyForm = { name: '', address: '', contactNumber: '', email: '' };

export default function Branches() {
  const { branches, selectedBranch, changeBranch, refreshBranches } = useApp();
  const toast = useToast();

  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    let active = true;

    const loadStats = async () => {
      if (branches.length === 0) {
        setStats({});
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const results = await Promise.all(
          branches.map((branch) => api.get(`/overview/branch/${branch.id}`))
        );
        if (!active) return;
        const map = {};
        results.forEach((res) => {
          map[res.data.branchId] = res.data;
        });
        setStats(map);
      } catch (err) {
        if (active) setError(getErrorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    };

    loadStats();
    return () => {
      active = false;
    };
  }, [branches]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError('');
    setOpen(true);
  };

  const openEdit = (branch) => {
    setEditing(branch);
    setForm({
      name: branch.name || '',
      address: branch.address || '',
      contactNumber: branch.contactNumber || '',
      email: branch.email || '',
    });
    setFormError('');
    setOpen(true);
  };

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSave = async (event) => {
    event?.preventDefault?.();
    setFormError('');
    if (!form.name.trim()) {
      setFormError('Branch name is required.');
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      address: form.address.trim() || null,
      contactNumber: form.contactNumber.trim() || null,
      email: form.email.trim() || null,
    };
    try {
      if (editing) {
        await api.put(`/branches/${editing.id}`, payload);
        toast.success(`${payload.name} updated.`);
      } else {
        const res = await api.post('/branches', payload);
        toast.success(`${payload.name} created.`);
        await refreshBranches();
        changeBranch(res.data);
      }
      setOpen(false);
      if (editing) await refreshBranches();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow={
          <span className="rounded-md border border-indigo-200/50 bg-indigo-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-indigo-600">
            Campus management
          </span>
        }
        title="Branches"
        subtitle="Each branch has its own students, batches, attendance, schedule and fee ledger."
        actions={
          <Button icon={Plus} onClick={openCreate}>
            Add branch
          </Button>
        }
      />

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      {loading ? (
        <LoadingBlock label="Loading branches…" />
      ) : branches.length === 0 ? (
        <Card>
          <EmptyState
            icon={Building2}
            title="No branches yet"
            description="Add a campus to start enrolling students and tracking fees."
            action={
              <Button icon={Plus} size="sm" onClick={openCreate}>
                Add branch
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {branches.map((branch) => {
            const branchStats = stats[branch.id];
            const isSelected = selectedBranch?.id === branch.id;
            return (
              <Card
                key={branch.id}
                className={cn('flex flex-col', isSelected && 'border-indigo-300 ring-2 ring-indigo-500/10')}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-extrabold tracking-tight text-slate-900">
                        {branch.name}
                      </h3>
                      {isSelected && <Badge tone="indigo">Active</Badge>}
                    </div>
                    <p className="mt-0.5 text-[10px] font-semibold text-slate-400">Branch #{branch.id}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openEdit(branch)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mt-3 space-y-1.5 text-[11px] text-slate-600">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span className="font-medium">{branch.address || 'Address not set'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-medium">{branch.contactNumber || 'Contact not set'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span className="truncate font-medium">{branch.email || 'Email not set'}</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
                  <div>
                    <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      <Users className="h-3 w-3" /> Students
                    </span>
                    <p className="mt-0.5 text-sm font-black text-slate-900">{branchStats?.totalStudents ?? '—'}</p>
                  </div>
                  <div>
                    <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      <CalendarDays className="h-3 w-3" /> Batches
                    </span>
                    <p className="mt-0.5 text-sm font-black text-slate-900">{branchStats?.activeBatches ?? '—'}</p>
                  </div>
                  <div>
                    <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      <Wallet className="h-3 w-3" /> Pending
                    </span>
                    <p className="mt-0.5 truncate text-sm font-black text-rose-600">
                      {branchStats ? formatCurrency(branchStats.pendingFees) : '—'}
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  {isSelected ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Selected for dashboard
                    </span>
                  ) : (
                    <Button variant="secondary" size="sm" onClick={() => changeBranch(branch)} className="w-full">
                      Switch to this branch
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit branch' : 'Add a branch'}
        subtitle={editing ? `Branch #${editing.id}` : 'New campuses start with an empty student registry'}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}>
              {editing ? 'Save changes' : 'Create branch'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && <ErrorBanner message={formError} onDismiss={() => setFormError('')} />}
          <Field label="Branch name" required>
            <Input required value={form.name} onChange={update('name')} placeholder="Indiranagar Center" />
          </Field>
          <Field label="Address">
            <Input
              value={form.address}
              onChange={update('address')}
              placeholder="100 Feet Road, Indiranagar, Bengaluru"
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Contact number">
              <Input value={form.contactNumber} onChange={update('contactNumber')} placeholder="+91 80 4123 4567" />
            </Field>
            <Field label="Email">
              <Input type="email" value={form.email} onChange={update('email')} placeholder="branch@academy.com" />
            </Field>
          </div>
          <button type="submit" className="hidden" aria-hidden="true" />
        </form>
      </Modal>
    </div>
  );
}
