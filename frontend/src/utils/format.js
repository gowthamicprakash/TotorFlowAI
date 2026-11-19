export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function formatCurrency(value) {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}

export function formatCompactCurrency(value) {
  const amount = Number(value ?? 0);
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}k`;
  return formatCurrency(amount);
}

function toLocalIso(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayIso() {
  return toLocalIso(new Date());
}

export function shiftIso(isoDate, days) {
  const date = new Date(`${isoDate}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toLocalIso(date);
}

export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDay(value) {
  if (!value) return '—';
  return value.charAt(0) + value.slice(1).toLowerCase();
}

export function formatTime(value) {
  if (!value) return '—';
  const [hours, minutes] = value.split(':');
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);
  return date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function formatTimeRange(start, end) {
  return `${formatTime(start)} – ${formatTime(end)}`;
}

export function initialsOf(name) {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function getErrorMessage(error) {
  const data = error?.response?.data;
  if (data?.errors && typeof data.errors === 'object') {
    return Object.values(data.errors).join(' ');
  }
  if (data?.message) return data.message;
  if (error?.code === 'ERR_NETWORK') {
    return 'Cannot reach the TutorFlow server. Make sure the backend is running.';
  }
  return error?.message || 'Something went wrong. Please try again.';
}

export function sortByStartTime(schedules = []) {
  return [...schedules].sort((a, b) => String(a.startTime).localeCompare(String(b.startTime)));
}

export function minutesOf(time) {
  if (!time) return 0;
  const [hours, minutes] = time.split(':');
  return Number(hours) * 60 + Number(minutes);
}

export function isOverdue(dueDate) {
  if (!dueDate) return false;
  return dueDate < todayIso();
}
