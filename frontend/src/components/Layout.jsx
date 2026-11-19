import React from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  LayoutDashboard,
  Users,
  CalendarDays,
  CheckSquare,
  CreditCard,
  Settings,
  LogOut,
  ChevronDown,
  Building2,
  BarChart3,
  Mic,
} from 'lucide-react';
import { cn, initialsOf } from '../utils/format';

const navItems = [
  { name: 'AI Assistant', path: '/ai-assistant', icon: Sparkles, badge: 'Live', highlight: true },
  { name: 'Overview', path: '/overview', icon: LayoutDashboard },
  { name: 'Students', path: '/students', icon: Users },
  { name: 'Batches & Schedule', path: '/batches', icon: CalendarDays },
  { name: 'Attendance', path: '/attendance', icon: CheckSquare },
  { name: 'Fee Ledger', path: '/fees', icon: CreditCard },
  { name: 'Branches', path: '/branches', icon: Building2 },
  { name: 'Reports', path: '/reports', icon: BarChart3 },
];

const pageTitles = {
  '/ai-assistant': 'AI Assistant',
  '/overview': 'Overview',
  '/students': 'Students',
  '/batches': 'Batches & Schedule',
  '/attendance': 'Attendance',
  '/fees': 'Fee Ledger',
  '/branches': 'Branches',
  '/reports': 'Reports',
  '/settings': 'Settings',
};

export default function Layout() {
  const { user, branches, selectedBranch, changeBranch, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <aside className="z-20 flex w-64 shrink-0 flex-col justify-between border-r border-slate-200 bg-white">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <Link to="/overview" className="flex h-16 items-center gap-2.5 border-b border-slate-100 px-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-lg font-bold text-white shadow-sm shadow-indigo-200">
              T
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-slate-900">TutorFlow</span>
              <span className="ml-1 rounded bg-indigo-50 px-1.5 py-0.5 text-xs font-semibold text-indigo-600">
                AI
              </span>
            </div>
          </Link>

          <div className="p-4">
            <label className="mb-1.5 block px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Campus Branch
            </label>
            {branches.length > 0 ? (
              <div className="relative">
                <select
                  value={selectedBranch ? selectedBranch.id : ''}
                  onChange={(event) => {
                    const branch = branches.find(
                      (item) => item.id.toString() === event.target.value
                    );
                    if (branch) changeBranch(branch);
                  }}
                  className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 pr-8 text-xs font-semibold text-slate-800 transition-all hover:border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-3 h-3.5 w-3.5 text-slate-400" />
              </div>
            ) : (
              <Link
                to="/branches"
                className="flex items-center gap-2 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/60 px-3 py-2 text-[11px] font-bold text-indigo-600 hover:bg-indigo-50"
              >
                <Building2 className="h-3.5 w-3.5" />
                Add your first branch
              </Link>
            )}
          </div>

          <nav className="space-y-1 px-3">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all',
                    item.highlight
                      ? isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                        : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100/70'
                      : isActive
                        ? 'bg-slate-100 font-bold text-indigo-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-current">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="space-y-2 border-t border-slate-100 p-3">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all',
                isActive
                  ? 'bg-slate-100 font-bold text-indigo-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )
            }
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </NavLink>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="truncate text-[11px] font-bold text-slate-700">
                {user?.teachingCategory || 'Educator'}
              </span>
            </div>
            <p className="mt-0.5 text-[10px] text-slate-400">
              {branches.length} {branches.length === 1 ? 'branch' : 'branches'} · {user?.businessName || 'Academy'}
            </p>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="z-10 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <span className="text-sm font-bold text-slate-900">
              {pageTitles[location.pathname] || 'TutorFlow'}
            </span>
            {selectedBranch && (
              <span className="hidden items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-500 sm:flex">
                <Building2 className="h-3 w-3" />
                {selectedBranch.name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/ai-assistant"
              className="hidden items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50 px-3.5 py-1.5 text-[11px] font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 sm:flex"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              AI Assistant · Text & Voice
              <Mic className="h-3 w-3" />
            </Link>

            <div className="h-7 w-px bg-slate-200" />

            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-xs font-bold text-white">
                {initialsOf(user?.fullName)}
              </div>
              <div className="hidden text-left sm:block">
                <div className="text-xs font-bold leading-tight text-slate-900">
                  {user?.fullName || 'Educator'}
                </div>
                <div className="text-[11px] font-medium text-slate-400">
                  {user?.businessName || 'Academy'}
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="ml-1 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50/70 p-5 lg:p-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
