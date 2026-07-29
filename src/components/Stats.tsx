import { Users, ArrowUpRight, BookOpen, Award } from 'lucide-react';

export function Stats() {
  const stats = [
    {
      label: 'Active Learners',
      value: '1,200+',
      trend: '+12%',
      icon: Users,
      color: 'text-primary-600',
      bg: 'bg-primary-50',
      borderColor: 'border-l-primary-600',
    },
    {
      label: 'Skills Exchanged',
      value: '3,500+',
      trend: '+24%',
      icon: BookOpen,
      color: 'text-success-500',
      bg: 'bg-success-50',
      borderColor: 'border-l-success-500',
    },
    {
      label: 'Categories',
      value: '10+',
      trend: 'Growing',
      icon: Award,
      color: 'text-accent-500',
      bg: 'bg-accent-50',
      borderColor: 'border-l-accent-500',
    },
    {
      label: 'Success Rate',
      value: '95%',
      trend: 'Consistent',
      icon: ArrowUpRight,
      color: 'text-warning-500',
      bg: 'bg-warning-50',
      borderColor: 'border-l-warning-500',
    },
  ];

  return (
    <section>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`stat-card border-l-4 ${stat.borderColor}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 ${stat.bg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <span className="text-[11px] font-semibold text-success-500 bg-success-50 px-2 py-0.5 rounded-full">
                  {stat.trend}
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-heading font-bold text-secondary-900">
                {stat.value}
              </p>
              <p className="text-xs text-secondary-400 mt-1 font-medium uppercase tracking-wide">
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
