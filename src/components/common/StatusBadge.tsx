import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const normalized = status.toUpperCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';

  switch (normalized) {
    // Event Statuses
    case 'PUBLISHED':
      styles = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      dotColor = 'bg-emerald-500';
      break;
    case 'ONGOING':
      styles = 'bg-amber-50 text-amber-800 border-amber-200';
      dotColor = 'bg-amber-500 animate-pulse';
      break;
    case 'COMPLETED':
      styles = 'bg-blue-50 text-blue-800 border-blue-200';
      dotColor = 'bg-blue-500';
      break;
    case 'CANCELLED':
      styles = 'bg-rose-50 text-rose-800 border-rose-200';
      dotColor = 'bg-rose-500';
      break;
    case 'DRAFT':
      styles = 'bg-slate-100 text-slate-600 border-slate-200';
      dotColor = 'bg-slate-400';
      break;

    // Expense Statuses
    case 'SUBMITTED':
      styles = 'bg-amber-50 text-amber-800 border-amber-200';
      dotColor = 'bg-amber-500';
      break;
    case 'APPROVED':
      styles = 'bg-indigo-50 text-indigo-800 border-indigo-200';
      dotColor = 'bg-indigo-500';
      break;
    case 'PAID':
      styles = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      dotColor = 'bg-emerald-500';
      break;
    case 'REJECTED':
      styles = 'bg-rose-50 text-rose-800 border-rose-200';
      dotColor = 'bg-rose-500';
      break;

    // Attendance & Mahatma Statuses
    case 'PRESENT':
      styles = 'bg-teal-50 text-teal-800 border-teal-200';
      dotColor = 'bg-teal-500';
      break;
    case 'REGISTERED':
      styles = 'bg-sky-50 text-sky-800 border-sky-200';
      dotColor = 'bg-sky-500';
      break;
    case 'ABSENT':
      styles = 'bg-slate-100 text-slate-500 border-slate-200';
      dotColor = 'bg-slate-400';
      break;
    case 'ACTIVE':
      styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      dotColor = 'bg-emerald-500';
      break;
    case 'INACTIVE':
      styles = 'bg-slate-100 text-slate-500 border-slate-200';
      dotColor = 'bg-slate-400';
      break;

    default:
      styles = 'bg-slate-100 text-slate-700 border-slate-200';
      dotColor = 'bg-slate-400';
  }

  const sizeStyles =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs'
      : 'px-2.5 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border whitespace-nowrap ${sizeStyles} ${styles}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {normalized.replace('_', ' ')}
    </span>
  );
};
