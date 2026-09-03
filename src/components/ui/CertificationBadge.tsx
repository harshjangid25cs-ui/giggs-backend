import React from 'react';

interface CertificationBadgeProps {
  title: string;
  issuer?: string;
  verified?: boolean;
  className?: string;
}

export const CertificationBadge: React.FC<CertificationBadgeProps> = ({
  title,
  issuer,
  verified = true,
  className = ''
}) => {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white shadow-2xs text-xs ${className}`}
    >
      <div className="w-5 h-5 rounded-md bg-neutral-900 text-white flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-xs">workspace_premium</span>
      </div>
      <div>
        <div className="font-bold text-neutral-900 leading-tight flex items-center gap-1">
          <span>{title}</span>
          {verified && (
            <span className="material-symbols-outlined text-emerald-600 text-xs">
              check_circle
            </span>
          )}
        </div>
        {issuer && <div className="text-[10px] text-neutral-500">{issuer}</div>}
      </div>
    </div>
  );
};
