import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: string;
  trendPositive?: boolean;
  icon?: string;
  onClick?: () => void;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  trend,
  trendPositive = true,
  icon,
  onClick,
  className = ''
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-2xs transition-all ${
        onClick ? 'cursor-pointer hover:border-slate-400 hover:shadow-xs' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between text-neutral-500 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
          {label}
        </span>
        {icon && <span className="material-symbols-outlined text-base">{icon}</span>}
      </div>

      <div className="text-2xl md:text-3xl font-black text-neutral-900 tracking-tight">
        {value}
      </div>

      {(subtext || trend) && (
        <div className="mt-1 flex items-center gap-1.5 text-xs">
          {trend && (
            <span
              className={`font-bold ${
                trendPositive ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {trend}
            </span>
          )}
          {subtext && <span className="text-neutral-500 text-[11px]">{subtext}</span>}
        </div>
      )}
    </div>
  );
};
