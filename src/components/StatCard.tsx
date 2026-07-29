'use client';

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: {
    percentage: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'accent' | 'success' | 'warning' | 'error';
  onClick?: () => void;
  tooltip?: string;
}

const colorClasses = {
  primary: 'before:bg-primary-600',
  accent: 'before:bg-accent-500',
  success: 'before:bg-success-600',
  warning: 'before:bg-warning-600',
  error: 'before:bg-error-500',
};

const iconColorClasses = {
  primary: 'text-primary-600',
  accent: 'text-accent-500',
  success: 'text-success-600',
  warning: 'text-warning-600',
  error: 'text-error-500',
};

const bgColorClasses = {
  primary: 'bg-primary-50',
  accent: 'bg-accent-50',
  success: 'bg-success-50',
  warning: 'bg-warning-50',
  error: 'bg-error-50',
};

export function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  color = 'primary',
  onClick,
  tooltip,
}: StatCardProps) {
  return (
    <div
      className={`stat-card cursor-pointer ${colorClasses[color]}`}
      onClick={onClick}
      title={tooltip}
    >
      {/* Icon Container */}
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${bgColorClasses[color]}`}>
        <Icon size={24} className={iconColorClasses[color]} />
      </div>

      {/* Content */}
      <div>
        <p className="text-xs font-semibold text-secondary-500 uppercase tracking-wide mb-2">
          {label}
        </p>
        <p className="text-3xl font-bold text-secondary-900 mb-2">{value}</p>

        {/* Trend Indicator */}
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs font-medium ${
              trend.isPositive ? 'text-success-600' : 'text-error-600'
            }`}
          >
            {trend.isPositive ? (
              <TrendingUp size={14} />
            ) : (
              <TrendingDown size={14} />
            )}
            <span>{Math.abs(trend.percentage)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
