import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CreditCard,
  Plus,
  Wallet,
  AlertCircle,
  CheckCircle2,
  Search,
  Receipt,
  IndianRupee,
  Clock,
  ArrowDownLeft,
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
  Textarea,
} from '../components/ui';
import { cn, formatCurrency, formatDate, getErrorMessage, todayIso } from '../utils/format';

const PAYMENT_METHODS = ['CASH', 'UPI', 'BANK_TRANSFER', 'CARD', 'OTHER'];

const methodLabel = (method) =>
  (method || 'CASH')
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const emptyPayment = {
  studentId: '',
  recordId: '',
  amount: '',
  paymentDate: todayIso(),
  paymentMethod: 'CASH',
  notes: '',
};

const emptyFee = {
  studentId: '',
  title: '',
  amountDue: '',
  dueDate: todayIso(),
};

export default function Fees() {
  const { selectedBranch } = useApp();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [tab, setTab] = useState('records');
  const [records, setRecords] = useState([]);
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState(emptyPayment);
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const [feeOpen, setFeeOpen] = useState(false);
  const [feeForm, setFeeForm] = useState(emptyFee);
  const [feeSaving, setFeeSaving] = useState(false);
  const [feeError, setFeeError] = useState('');

  const load = async () => {
    if (!selectedBranch) return;
    setLoading(true);
    setError('');
    try {
      const [recordsRes, paymentsRes, studentsRes] = await Promise.all([
        api.get(`/fees/records/branch/${selectedBranch.id}`),
        api.get(`/fees/payments/branch/${selectedBranch.id}`),
        api.get(`/students?branchId=${selectedBranch.id}`),
      ]);
      setRecords(recordsRes.data || []);
      setPayments(paymentsRes.data || []);
      setStudents(studentsRes.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [selectedBranch?.id]);

  useEffect(() => {
    const studentParam = searchParams.get('studentId');
    const recordParam = searchParams.get('recordId');
    if (searchParams.get('new') === '1' || studentParam || recordParam) {
      openPayment(studentParam || '', recordParam || '');
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, records]);

  const openPayment = (studentId = '', recordId = '') => {
    const record = records.find((item) => String(item.id) === String(recordId));
    setPaymentForm({
      ...emptyPayment,
      studentId: studentId || (record ? String(record.studentId) : ''),
      recordId: recordId || '',
      amount: record ? String(record.pendingAmount) : '',
    });
    setPaymentError('');
    setPaymentOpen(true);
  };

  const openFee = () => {
    setFeeForm({ ...emptyFee, dueDate: todayIso() });
    setFeeError('');
    setFeeOpen(true);
  };

  const stats = useMemo(() => {
    const billed = records.reduce((sum, record) => sum + Number(record.amountDue || 0), 0);
    const paid = records.reduce((sum, record) => sum + Number(record.amountPaid || 0), 0);
    const pending = records.reduce((sum, record) => sum + Number(record.pendingAmount || 0), 0);
    const today = todayIso();
    const overdue = records.filter(
      (record) => Number(record.pendingAmount) > 0 && record.dueDate && record.dueDate < today
    ).length;
    return { billed, paid, pending, overdue, rate: billed > 0 ? Math.round((paid / billed) * 100) : 0 };
  }, [records]);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    const today = todayIso();
    return records.filter((record) => {
      const pending = Number(record.pendingAmount || 0);
      if (statusFilter === 'pending' && pending <= 0) return false;
      if (statusFilter === 'paid' && pending > 0) return false;
      if (
        statusFilter === 'overdue' &&
        !(pending > 0 && record.dueDate && record.dueDate < today)
      ) {
        return false;
      }
      if (!query) return true;
      return [record.studentName, record.title]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query));
    });
  }, [records, search, statusFilter]);

  const studentById = useMemo(() => {
    const map = new Map();
    students.forEach((student) => map.set(student.id, student));
    return map;
  }, [students]);

  const paymentRecords = useMemo(
    () =>
      records.filter(
        (record) =>
          String(record.studentId) === String(paymentForm.studentId) &&
          Number(record.pendingAmount) > 0
      ),
    [records, paymentForm.studentId]
  );

  const handleRecordPayment = async (event) => {
    event?.preventDefault?.();
    setPaymentError('');
    if (!paymentForm.studentId) {
      setPaymentError('Select the student making the payment.');
      return;
    }
    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) {
      setPaymentError('Enter a payment amount greater than zero.');
      return;
    }
    setPaymentSaving(true);
    try {
      await api.post('/fees/payments', {
        branchId: selectedBranch.id,
        studentId: Number(paymentForm.studentId),
        feeRecordId: paymentForm.recordId ? Number(paymentForm.recordId) : null,
        amount: Number(paymentForm.amount),
        paymentDate: paymentForm.paymentDate || todayIso(),
        paymentMethod: paymentForm.paymentMethod,
        notes: paymentForm.notes.trim() || null,
      });
      toast.success(`Payment of ${formatCurrency(paymentForm.amount)} recorded.`);
      setPaymentOpen(false);
      setTab('payments');
      await load();
    } catch (err) {
      setPaymentError(getErrorMessage(err));
    } finally {
      setPaymentSaving(false);
    }
  };

  const handleCreateFee = async (event) => {
    event?.preventDefault?.();
    setFeeError('');
    if (!feeForm.studentId) {
      setFeeError('Select a student.');
      return;
    }
    if (!feeForm.title.trim()) {
      setFeeError('Fee title is required.');
      return;
    }
    if (!feeForm.amountDue || Number(feeForm.amountDue) <= 0) {
      setFeeError('Amount must be greater than zero.');
      return;
    }
    setFeeSaving(true);
    try {
      await api.post('/fees/records', {
        branchId: selectedBranch.id,
        studentId: Number(feeForm.studentId),
        title: feeForm.title.trim(),
        amountDue: Number(feeForm.amountDue),
        dueDate: feeForm.dueDate || null,
      });
      toast.success('Fee record created.');
      setFeeOpen(false);
      setTab('records');
      await load();
    } catch (err) {
      setFeeError(getErrorMessage(err));
    } finally {
      setFeeSaving(false);
    }
  };

  const updatePayment = (field) => (event) => {
    const value = event.target.value;
    setPaymentForm((current) => {
      if (field === 'studentId') {
        return { ...current, studentId: value, recordId: '', amount: '' };
      }
      if (field === 'recordId') {
        const record = records.find((item) => String(item.id) === value);
        return {
          ...current,
          recordId: value,
          amount: record ? String(record.pendingAmount) : current.amount,
        };
      }
      return { ...current, [field]: value };
    });
  };

  const updateFee = (field) => (event) =>
    setFeeForm((current) => ({ ...current, [field]: event.target.value }));

  if (!selectedBranch) return <NoBranchState />;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow={
          <span className="rounded-md border border-indigo-200/50 bg-indigo-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-indigo-600">
            Fees & payments
          </span>
        }
        title="Fee ledger"
        subtitle={`Track dues, overdue accounts and payment history for ${selectedBranch.name}.`}
        actions={
          <>
            <Button variant="secondary" icon={Receipt} onClick={openFee}>
              Add fee record
            </Button>
            <Button icon={CreditCard} onClick={() => openPayment()}>
              Record payment
            </Button>
          </>
        }
      />

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total billed</span>
            <IndianRupee className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="mt-1.5 text-xl font-black text-slate-900">{formatCurrency(stats.billed)}</p>
          <p className="mt-0.5 text-[10px] text-slate-400">{records.length} fee records</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Collected</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-1.5 text-xl font-black text-emerald-600">{formatCurrency(stats.paid)}</p>
          <p className="mt-0.5 text-[10px] text-slate-400">{stats.rate}% of billed amount</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Outstanding</span>
            <Wallet className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-1.5 text-xl font-black text-rose-600">{formatCurrency(stats.pending)}</p>
          <p className="mt-0.5 text-[10px] text-slate-400">
            {records.filter((record) => Number(record.pendingAmount) > 0).length} open records
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Overdue</span>
            <AlertCircle className="h-4 w-4 text-rose-500" />
          </div>
          <p className="mt-1.5 text-xl font-black text-slate-900">{stats.overdue}</p>
          <p className="mt-0.5 text-[10px] text-slate-400">Past their due date</p>
        </Card>
      </div>

      <div className="flex w-fit items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
        {[
          { key: 'records', label: 'Fee records', icon: Receipt },
          { key: 'payments', label: 'Payments', icon: ArrowDownLeft },
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
        <LoadingBlock label="Loading fee ledger…" />
      ) : tab === 'records' ? (
        <Card className="p-0">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search student or fee title…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-auto"
            >
              <option value="all">All records</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
              <option value="paid">Fully paid</option>
            </Select>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Receipt}
                title={records.length === 0 ? 'No fee records yet' : 'No records match your filters'}
                description={
                  records.length === 0
                    ? 'Create a fee record for a student to start tracking dues and payments.'
                    : 'Try a different search or status filter.'
                }
                action={
                  records.length === 0 ? (
                    <Button icon={Receipt} size="sm" onClick={openFee}>
                      Add fee record
                    </Button>
                  ) : null
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Fee title</th>
                    <th className="px-4 py-3">Due date</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-right">Paid</th>
                    <th className="px-4 py-3 text-right">Pending</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.map((record) => {
                    const pending = Number(record.pendingAmount || 0);
                    const overdue = pending > 0 && record.dueDate && record.dueDate < todayIso();
                    const status = pending <= 0 ? 'Paid' : overdue ? 'Overdue' : Number(record.amountPaid) > 0 ? 'Partial' : 'Pending';
                    const tone = pending <= 0 ? 'emerald' : overdue ? 'rose' : Number(record.amountPaid) > 0 ? 'amber' : 'slate';
                    return (
                      <tr key={record.id} className="text-xs transition-colors hover:bg-slate-50/70">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={record.studentName} />
                            <div className="min-w-0">
                              <p className="truncate font-bold text-slate-900">{record.studentName}</p>
                              <p className="truncate text-[10px] text-slate-400">
                                {studentById.get(record.studentId)?.contactNumber || 'Contact not set'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-600">{record.title}</td>
                        <td className="px-4 py-3">
                          <span className={cn('font-medium', overdue ? 'text-rose-600' : 'text-slate-500')}>
                            {formatDate(record.dueDate)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-700">
                          {formatCurrency(record.amountDue)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                          {formatCurrency(record.amountPaid)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-rose-600">
                          {formatCurrency(record.pendingAmount)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge tone={tone}>{status}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {pending > 0 ? (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => openPayment(record.studentId, record.id)}
                            >
                              Record
                            </Button>
                          ) : (
                            <span className="text-[10px] font-semibold text-slate-400">Settled</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      ) : (
        <Card className="p-0">
          {payments.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={CreditCard}
                title="No payments recorded"
                description="Payments recorded from the dashboard or the AI assistant will appear here."
                action={
                  <Button size="sm" icon={CreditCard} onClick={() => openPayment()}>
                    Record payment
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3">Notes</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="text-xs transition-colors hover:bg-slate-50/70">
                      <td className="px-4 py-3 font-medium text-slate-500">
                        {formatDate(payment.paymentDate)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={payment.studentName} />
                          <span className="font-bold text-slate-900">{payment.studentName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone="indigo">{methodLabel(payment.paymentMethod)}</Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{payment.notes || '—'}</td>
                      <td className="px-4 py-3 text-right font-black text-emerald-600">
                        {formatCurrency(payment.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      <Modal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        title="Record a payment"
        subtitle={`${selectedBranch.name} · updates the fee ledger immediately`}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setPaymentOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRecordPayment} loading={paymentSaving}>
              Save payment
            </Button>
          </div>
        }
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          {paymentError && <ErrorBanner message={paymentError} onDismiss={() => setPaymentError('')} />}

          <Field label="Student" required>
            <Select value={paymentForm.studentId} onChange={updatePayment('studentId')}>
              <option value="">Select a student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.fullName}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Apply to fee record" hint="Optional — links the payment to a specific due">
            <Select value={paymentForm.recordId} onChange={updatePayment('recordId')} disabled={!paymentForm.studentId}>
              <option value="">General payment (not linked)</option>
              {paymentRecords.map((record) => (
                <option key={record.id} value={record.id}>
                  {record.title} · {formatCurrency(record.pendingAmount)} pending
                </option>
              ))}
            </Select>
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Amount (₹)" required>
              <Input
                type="number"
                min="1"
                step="0.01"
                required
                value={paymentForm.amount}
                onChange={updatePayment('amount')}
                placeholder="5000"
              />
            </Field>
            <Field label="Payment date" required>
              <Input
                type="date"
                required
                value={paymentForm.paymentDate}
                onChange={updatePayment('paymentDate')}
              />
            </Field>
          </div>

          <Field label="Payment method">
            <Select value={paymentForm.paymentMethod} onChange={updatePayment('paymentMethod')}>
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {methodLabel(method)}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Notes">
            <Textarea
              value={paymentForm.notes}
              onChange={updatePayment('notes')}
              placeholder="Optional reference number or remark"
            />
          </Field>

          <button type="submit" className="hidden" aria-hidden="true" />
        </form>
      </Modal>

      <Modal
        open={feeOpen}
        onClose={() => setFeeOpen(false)}
        title="Add a fee record"
        subtitle={`${selectedBranch.name} · creates a due against a student`}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setFeeOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFee} loading={feeSaving}>
              Create fee
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateFee} className="space-y-4">
          {feeError && <ErrorBanner message={feeError} onDismiss={() => setFeeError('')} />}

          <Field label="Student" required>
            <Select value={feeForm.studentId} onChange={updateFee('studentId')}>
              <option value="">Select a student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.fullName}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Fee title" required>
            <Input
              required
              value={feeForm.title}
              onChange={updateFee('title')}
              placeholder="Monthly tuition — November"
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Amount due (₹)" required>
              <Input
                type="number"
                min="1"
                step="0.01"
                required
                value={feeForm.amountDue}
                onChange={updateFee('amountDue')}
                placeholder="5000"
              />
            </Field>
            <Field label="Due date">
              <Input type="date" value={feeForm.dueDate} onChange={updateFee('dueDate')} />
            </Field>
          </div>

          <button type="submit" className="hidden" aria-hidden="true" />
        </form>
      </Modal>
    </div>
  );
}
