import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Building2,
  Mic,
  LogOut,
  ShieldCheck,
  Volume2,
  CheckCircle2,
  Info,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import {
  Badge,
  Button,
  Card,
  Field,
  Input,
  PageHeader,
  Select,
} from '../components/ui';
import { cn, formatDate } from '../utils/format';
import { getVoicePrefs, saveVoicePrefs } from '../utils/voicePrefs';

export default function Settings() {
  const { user, branches, selectedBranch, changeBranch, logout } = useApp();
  const toast = useToast();
  const navigate = useNavigate();
  const [voicePrefs, setVoicePrefs] = useState(() => getVoicePrefs());

  const updateVoice = (patch) => {
    const next = { ...voicePrefs, ...patch };
    setVoicePrefs(next);
    saveVoicePrefs(next);
    toast.success('Voice preference saved.');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow={
          <span className="rounded-md border border-indigo-200/50 bg-indigo-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-indigo-600">
            Account & preferences
          </span>
        }
        title="Settings"
        subtitle="Your teacher account, business profile, branches and voice preferences."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="rounded-lg bg-indigo-50 p-1.5 text-indigo-600">
              <User className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Teacher profile</h2>
          </div>

          <div className="mt-4 space-y-3">
            <Field label="Full name">
              <Input value={user?.fullName || ''} disabled />
            </Field>
            <Field label="Email address">
              <Input value={user?.email || ''} disabled />
            </Field>
            <div className="flex items-start gap-2 rounded-xl border border-indigo-100 bg-indigo-50/60 px-3 py-2.5 text-[11px] text-indigo-700">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                Profile editing is not enabled in this MVP. Contact your administrator if your account
                details need to change.
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="rounded-lg bg-purple-50 p-1.5 text-purple-600">
              <Building2 className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Business profile</h2>
          </div>

          <div className="mt-4 space-y-3">
            <Field label="Business or academy name">
              <Input value={user?.businessName || ''} disabled />
            </Field>
            <Field label="Teaching category">
              <Input value={user?.teachingCategory || ''} disabled />
            </Field>
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
              <div>
                <p className="text-[11px] font-bold text-slate-700">
                  {branches.length} {branches.length === 1 ? 'branch' : 'branches'} configured
                </p>
                <p className="text-[10px] text-slate-400">Active: {selectedBranch?.name || 'None'}</p>
              </div>
              <Link
                to="/branches"
                className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:underline"
              >
                Manage <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            {branches.length > 1 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch active branch
                </span>
                {branches.map((branch) => (
                  <button
                    key={branch.id}
                    type="button"
                    onClick={() => changeBranch(branch)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left transition-all',
                      selectedBranch?.id === branch.id
                        ? 'border-indigo-200 bg-indigo-50/60'
                        : 'border-slate-100 bg-white hover:bg-slate-50'
                    )}
                  >
                    <span className="text-xs font-semibold text-slate-700">{branch.name}</span>
                    {selectedBranch?.id === branch.id ? (
                      <Badge tone="indigo">Active</Badge>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400">Switch</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600">
              <Mic className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Voice preferences</h2>
          </div>

          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Speak AI responses</p>
                  <p className="text-[10px] text-slate-400">Play assistant replies as audio</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => updateVoice({ enabled: !voicePrefs.enabled })}
                className={cn(
                  'relative h-6 w-11 rounded-full transition-colors',
                  voicePrefs.enabled ? 'bg-indigo-600' : 'bg-slate-300'
                )}
                aria-pressed={voicePrefs.enabled}
              >
                <span
                  className={cn(
                    'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all',
                    voicePrefs.enabled ? 'left-[22px]' : 'left-0.5'
                  )}
                />
              </button>
            </div>

            <Field label="Speech pace">
              <Select
                value={String(voicePrefs.rate)}
                onChange={(event) => updateVoice({ rate: Number(event.target.value) })}
              >
                <option value="0.8">Slower (0.8×)</option>
                <option value="1">Standard (1×)</option>
                <option value="1.2">Faster (1.2×)</option>
              </Select>
            </Field>

            <p className="text-[10px] leading-relaxed text-slate-400">
              Voice input and playback use your browser's speech engine. Chrome or Edge on desktop gives
              the most reliable results.
            </p>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="rounded-lg bg-slate-100 p-1.5 text-slate-600">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Account & security</h2>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-2.5 text-[11px] font-medium text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              Signed in with a secure JWT session. Your branch data is isolated to this account.
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
              <div>
                <p className="text-[11px] font-bold text-slate-700">Email</p>
                <p className="text-[10px] text-slate-400">{user?.email}</p>
              </div>
              <Badge tone="emerald">Verified via login</Badge>
            </div>

            <div className="rounded-xl border border-slate-100 px-3 py-2.5">
              <p className="text-[11px] font-bold text-slate-700">MVP note</p>
              <p className="mt-0.5 text-[10px] leading-relaxed text-slate-400">
                Password recovery, email verification and profile editing are planned for a later release.
              </p>
            </div>

            <Button variant="danger" icon={LogOut} onClick={handleLogout} className="w-full">
              Sign out
            </Button>
          </div>
        </Card>
      </div>

      <p className="text-center text-[10px] text-slate-400">
        TutorFlow AI MVP · Teacher dashboard + AI voice assistant
      </p>
    </div>
  );
}
