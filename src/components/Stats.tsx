'use client';

import React from 'react';
import { Users, Repeat, CheckCircle2, ShieldCheck } from 'lucide-react';

export function Stats() {
  const stats = [
    {
      label: 'Exchanges Completed',
      value: '3,840+',
      sub: 'Verified deliverables',
      icon: Repeat,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Active Specialists',
      value: '1,420+',
      sub: 'Engineers, designers & PMs',
      icon: Users,
      color: 'text-tertiary',
      bg: 'bg-tertiary/10',
    },
    {
      label: 'Satisfaction Rate',
      value: '98.4%',
      sub: '5-star reviews',
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Capital Saved',
      value: '$0 Spend',
      sub: 'Pure professional trade',
      icon: ShieldCheck,
      color: 'text-amber-600',
      bg: 'bg-amber-500/10',
    },
  ];

  return (
    <section className="py-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 shadow-card hover:shadow-card-hover transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-medium text-on-surface-variant uppercase tracking-wider">
                  {stat.label}
                </span>
                <div className={`w-8 h-8 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-bold font-display text-on-surface tracking-tight">
                {stat.value}
              </p>
              <p className="text-xs text-outline mt-1 font-medium">
                {stat.sub}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
export default Stats;
