import React from 'react';

export type StatusVariant =
  | 'active'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'pending'
  | 'cancelled'
  | 'urgent'
  | 'verified';

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  pulse?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant,
  pulse = false,
  className = ''
}) => {
  const normalized = (variant || status.toLowerCase().replace(/[\s-]/g, '_')) as StatusVariant;

  const styles: Record<StatusVariant, { bg: string; text: string; border: string; dot: string }> = {
    active: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      dot: 'bg-emerald-500'
    },
    in_progress: {
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-200',
      dot: 'bg-blue-500'
    },
    scheduled: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-800',
      border: 'border-indigo-200',
      dot: 'bg-indigo-500'
    },
    completed: {
      bg: 'bg-slate-100',
      text: 'text-slate-800',
      border: 'border-slate-300',
      dot: 'bg-slate-500'
    },
    pending: {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      dot: 'bg-amber-500'
    },
    cancelled: {
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-200',
      dot: 'bg-rose-500'
    },
    urgent: {
      bg: 'bg-red-600',
      text: 'text-white',
      border: 'border-red-700',
      dot: 'bg-white'
    },
    verified: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-900',
      border: 'border-emerald-300',
      dot: 'bg-emerald-600'
    }
  };

  const current = styles[normalized] || styles.pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border tracking-wide uppercase ${current.bg} ${current.text} ${current.border} ${className}`}
    >
      {pulse ? (
        <span className={`w-1.5 h-1.5 rounded-full ${current.dot} animate-ping`} />
      ) : (
        <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      )}
      <span>{status}</span>
    </span>
  );
};
