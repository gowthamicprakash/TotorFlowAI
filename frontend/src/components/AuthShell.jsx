import React from 'react';
import { Sparkles, CalendarCheck2, Wallet, Building2 } from 'lucide-react';

const points = [
  { icon: Building2, title: 'Branch-aware operations', text: 'Every student, batch and fee stays scoped to the right campus.' },
  { icon: CalendarCheck2, title: 'Attendance in seconds', text: 'Mark a full batch and sync it to the dashboard instantly.' },
  { icon: Wallet, title: 'Fee ledger that adds up', text: 'Track dues, overdue accounts and payments without spreadsheets.' },
];

export default function AuthShell({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-700 p-10 text-white lg:flex">
        <div className="pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-purple-400/20 blur-3xl" />

        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-lg font-bold backdrop-blur">
            T
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight">TutorFlow</span>
            <span className="ml-1.5 rounded bg-white/20 px-1.5 py-0.5 text-xs font-semibold">AI</span>
          </div>
        </div>

        <div className="relative max-w-md">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold">
            <Sparkles className="h-3 w-3" />
            Teacher business hub
          </div>
          <h1 className="text-4xl font-black leading-tight tracking-tight">
            Run your teaching business by conversation.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-indigo-100">
            Manage students, batches, attendance, schedules and fees from one dashboard — or just ask
            the AI assistant to do it.
          </p>

          <div className="mt-9 space-y-4">
            {points.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold">{title}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-indigo-100/80">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-[11px] text-indigo-200/80">
          English-first MVP · Teacher dashboard + AI voice agent
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
