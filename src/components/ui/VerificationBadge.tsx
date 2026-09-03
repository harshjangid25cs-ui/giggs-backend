import React from 'react';

interface VerificationBadgeProps {
  type?: 'id' | 'police' | 'cooperative' | 'insurance' | 'master';
  label?: string;
  className?: string;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  type = 'id',
  label,
  className = ''
}) => {
  const configs = {
    id: {
      icon: 'verified_user',
      defaultLabel: 'Govt ID Verified',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200'
    },
    police: {
      icon: 'local_police',
      defaultLabel: 'Police Record Clear',
      color: 'text-blue-700 bg-blue-50 border-blue-200'
    },
    cooperative: {
      icon: 'handshake',
      defaultLabel: 'Cooperative Member',
      color: 'text-amber-800 bg-amber-50 border-amber-200'
    },
    insurance: {
      icon: 'health_and_safety',
      defaultLabel: '₹5L Insurance Covered',
      color: 'text-emerald-800 bg-emerald-50 border-emerald-300'
    },
    master: {
      icon: 'military_tech',
      defaultLabel: 'Master Certified Pro',
      color: 'text-neutral-900 bg-neutral-100 border-neutral-300'
    }
  };

  const current = configs[type] || configs.id;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border ${current.color} ${className}`}
    >
      <span className="material-symbols-outlined text-sm shrink-0">
        {current.icon}
      </span>
      <span>{label || current.defaultLabel}</span>
    </div>
  );
};
