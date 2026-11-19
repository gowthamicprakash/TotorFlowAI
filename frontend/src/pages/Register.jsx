import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import AuthShell from '../components/AuthShell';
import { Button, ErrorBanner, Field, Input, Select } from '../components/ui';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import { getErrorMessage } from '../utils/format';

const categories = ['Dance', 'Tuition', 'Music', 'Yoga', 'Fitness', 'Swimming', 'Other'];

export default function Register() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    businessName: '',
    teachingCategory: 'Dance',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
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
      <div className="mb-7">
        <div className="mb-5 flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
            T
          </div>
          <span className="text-lg font-extrabold text-slate-900">
            TutorFlow <span className="text-xs font-semibold text-indigo-600">AI</span>
          </span>
        </div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Get started</p>
        <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Create your academy account</h2>
        <p className="mt-1 text-xs text-slate-500">
          A Main Branch is created automatically. You can add more branches later.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

        <Field label="Full name" required>
          <Input
            required
            placeholder="Ananya Sharma"
            autoComplete="name"
            value={form.fullName}
            onChange={update('fullName')}
          />
        </Field>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <Field label="Email address" required>
            <Input
              type="email"
              required
              placeholder="you@academy.com"
              autoComplete="email"
              value={form.email}
              onChange={update('email')}
            />
          </Field>
          <Field label="Password" required hint="Minimum 6 characters">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="Create a password"
                autoComplete="new-password"
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
        </div>

        <Field label="Business or academy name" required>
          <Input
            required
            placeholder="Nrtya Vihara Academy"
            value={form.businessName}
            onChange={update('businessName')}
          />
        </Field>

        <Field label="Teaching category" required>
          <Select value={form.teachingCategory} onChange={update('teachingCategory')}>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </Field>

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Create account
        </Button>
      </form>

      <p className="mt-5 text-center text-xs text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-700">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
