import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import AuthShell from '../components/AuthShell';
import { Button, ErrorBanner, Field, Input } from '../components/ui';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import { getErrorMessage } from '../utils/format';

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data);
      navigate('/ai-assistant', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="mb-8">
        <div className="mb-5 flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
            T
          </div>
          <span className="text-lg font-extrabold text-slate-900">
            TutorFlow <span className="text-xs font-semibold text-indigo-600">AI</span>
          </span>
        </div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Welcome back</p>
        <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Sign in to your academy</h2>
        <p className="mt-1 text-xs text-slate-500">
          Access your dashboard and AI assistant with your teacher account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

        <Field label="Email address" required>
          <Input
            type="email"
            autoComplete="email"
            required
            placeholder="you@academy.com"
            value={form.email}
            onChange={update('email')}
          />
        </Field>

        <Field label="Password" required>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              placeholder="Your password"
              value={form.password}
              onChange={update('password')}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-2 top-2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-500">
        New to TutorFlow?{' '}
        <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-700">
          Create your account
        </Link>
      </p>
    </AuthShell>
  );
}
