'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  TrendingUp,
  Users,
  BookOpen,
  Plus,
  ArrowRight,
  Zap,
  Target,
  Award,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { Exchange, User as UserType } from '@/types';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState({
    activeExchanges: 0,
    completedExchanges: 0,
    pendingRequests: 0,
    totalSkills: 0,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
    if (session) fetchDashboardData();
  }, [session, status, router, refreshKey]);

  const fetchDashboardData = async () => {
    try {
      const [exchangesRes, userRes] = await Promise.all([
        fetch('/api/exchanges'),
        fetch('/api/user/profile'),
      ]);

      if (exchangesRes.ok) {
        const exchangesData = await exchangesRes.json();
        const data = Array.isArray(exchangesData) ? exchangesData : (exchangesData.data || []);
        setExchanges(data);
        setStats((prev) => ({
          ...prev,
          activeExchanges: data.filter((e: Exchange) => e.status === 'active').length,
          completedExchanges: data.filter((e: Exchange) => e.status === 'completed').length,
          pendingRequests: data.filter((e: Exchange) => e.status === 'pending').length,
        }));
      }

      if (userRes.ok) {
        const result = await userRes.json();
        const userData = result.data || result;
        setUser(userData);
        setStats((prev) => ({
          ...prev,
          totalSkills: userData.skillsToTeach?.length || 0,
        }));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusConfig = (exchangeStatus: string) => {
    switch (exchangeStatus) {
      case 'pending':
        return { icon: Clock, color: 'text-warning-500', bg: 'bg-warning-50', label: 'Pending' };
      case 'active':
        return { icon: MessageSquare, color: 'text-primary-600', bg: 'bg-primary-50', label: 'Active' };
      case 'completed':
        return { icon: CheckCircle, color: 'text-success-500', bg: 'bg-success-50', label: 'Done' };
      case 'cancelled':
        return { icon: XCircle, color: 'text-error-500', bg: 'bg-error-50', label: 'Cancelled' };
      default:
        return { icon: Clock, color: 'text-secondary-400', bg: 'bg-secondary-50', label: exchangeStatus };
    }
  };

  const formatDate = (date: string | Date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleAcceptExchange = async (exchangeId: string) => {
    try {
      const response = await fetch(`/api/exchanges/${exchangeId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' }),
      });
      if (response.ok) setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error('Error accepting exchange:', error);
    }
  };

  const handleCompleteExchange = async (exchangeId: string) => {
    try {
      const response = await fetch(`/api/exchanges/${exchangeId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });
      if (response.ok) setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error('Error completing exchange:', error);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 bg-primary-600 rounded-full animate-pulse" />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Active Exchanges',
      value: stats.activeExchanges,
      icon: Zap,
      color: 'text-primary-600',
      bg: 'bg-primary-50',
      borderColor: 'border-l-primary-600',
      href: '/exchanges',
    },
    {
      label: 'Completed',
      value: stats.completedExchanges,
      icon: Target,
      color: 'text-success-500',
      bg: 'bg-success-50',
      borderColor: 'border-l-success-500',
      href: '/exchanges',
    },
    {
      label: 'Pending',
      value: stats.pendingRequests,
      icon: Clock,
      color: 'text-warning-500',
      bg: 'bg-warning-50',
      borderColor: 'border-l-warning-500',
      href: '/exchanges',
    },
    {
      label: 'My Skills',
      value: stats.totalSkills,
      icon: Award,
      color: 'text-accent-500',
      bg: 'bg-accent-50',
      borderColor: 'border-l-accent-500',
      href: '/profile',
    },
  ];

  return (
    <div className="space-y-5">
      {/* Welcome Banner */}
      <div className="section-card overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-heading font-bold text-white mb-1">
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-sm text-primary-200">Here's your learning overview for today.</p>
          </div>
          <button
            onClick={() => router.push('/search')}
            className="inline-flex items-center bg-white/15 hover:bg-white/25 text-white font-semibold py-2.5 px-5 rounded-full text-sm transition-all backdrop-blur-sm self-start"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Exchange
          </button>
        </div>
      </div>

      {/* Byjus-style Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              onClick={() => router.push(stat.href)}
              className={`stat-card border-l-4 ${stat.borderColor} cursor-pointer hover:shadow-card-hover transition-all`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 ${stat.bg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-heading font-bold text-secondary-900">{stat.value}</p>
              <p className="text-[11px] text-secondary-400 mt-1 font-semibold uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Exchanges */}
        <div className="lg:col-span-2 section-card">
          <div className="section-card-header">
            <h2 className="text-base font-heading font-semibold text-secondary-900">Recent Exchanges</h2>
            <button
              onClick={() => router.push('/exchanges')}
              className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center"
            >
              View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          <div className="divide-y divide-secondary-200/60">
            {exchanges.length > 0 ? (
              exchanges.slice(0, 5).map((exchange) => {
                const config = getStatusConfig(exchange.status);
                const StatusIcon = config.icon;
                return (
                  <div
                    key={exchange._id}
                    className="px-5 sm:px-6 py-4 hover:bg-secondary-50/50 transition-colors cursor-pointer flex items-center justify-between gap-3"
                    onClick={() => router.push(`/exchanges/${exchange._id}`)}
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className={`w-9 h-9 ${config.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <StatusIcon className={`w-4 h-4 ${config.color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-secondary-900 truncate">
                          {exchange.skills?.offered
                            ? typeof exchange.skills.offered === 'object'
                              ? (exchange.skills.offered as any).name
                              : exchange.skills.offered
                            : 'Unknown'}{' '}
                          ↔{' '}
                          {exchange.skills?.requested
                            ? typeof exchange.skills.requested === 'object'
                              ? (exchange.skills.requested as any).name
                              : exchange.skills.requested
                            : 'Unknown'}
                        </p>
                        <p className="text-xs text-secondary-400 mt-0.5">
                          {exchange.messages?.length || 0} messages • {formatDate(exchange.createdAt || new Date())}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      {exchange.status === 'active' && (
                        <button
                          onClick={() => handleCompleteExchange(exchange._id as string)}
                          className="text-xs font-semibold text-success-500 hover:text-success-600 bg-success-50 px-3 py-1.5 rounded-full transition-colors"
                        >
                          Complete
                        </button>
                      )}
                      {exchange.status === 'pending' && (
                        <button
                          onClick={() => handleAcceptExchange(exchange._id as string)}
                          className="text-xs font-semibold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full hover:bg-primary-100 transition-colors"
                        >
                          Accept
                        </button>
                      )}
                      <span className={`badge text-[10px] ${config.bg} ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="px-6 py-12 text-center">
                <div className="w-14 h-14 bg-secondary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-6 h-6 text-secondary-300" />
                </div>
                <h3 className="text-base font-heading font-semibold text-secondary-900 mb-1">No exchanges yet</h3>
                <p className="text-sm text-secondary-400 mb-4">
                  Start by finding someone to exchange skills with
                </p>
                <button onClick={() => router.push('/search')} className="btn-primary text-sm">
                  Find Exchange Partners
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Quick Actions */}
          <div className="section-card">
            <div className="section-card-header">
              <h3 className="text-base font-heading font-semibold text-secondary-900">Quick Actions</h3>
            </div>
            <div className="section-card-body space-y-2">
              <button
                onClick={() => router.push('/search')}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-primary-50 text-left transition-colors group"
              >
                <div className="w-8 h-8 bg-primary-50 group-hover:bg-primary-100 rounded-lg flex items-center justify-center transition-colors">
                  <Plus className="w-4 h-4 text-primary-600" />
                </div>
                <span className="text-sm font-medium text-secondary-700">New Exchange</span>
              </button>
              <button
                onClick={() => router.push('/profile')}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-accent-50 text-left transition-colors group"
              >
                <div className="w-8 h-8 bg-accent-50 group-hover:bg-accent-100 rounded-lg flex items-center justify-center transition-colors">
                  <BookOpen className="w-4 h-4 text-accent-500" />
                </div>
                <span className="text-sm font-medium text-secondary-700">Add Skills</span>
              </button>
              <button
                onClick={() => router.push('/groups')}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-success-50 text-left transition-colors group"
              >
                <div className="w-8 h-8 bg-success-50 group-hover:bg-success-100 rounded-lg flex items-center justify-center transition-colors">
                  <Users className="w-4 h-4 text-success-500" />
                </div>
                <span className="text-sm font-medium text-secondary-700">Join Community</span>
              </button>
            </div>
          </div>

          {/* Profile Card */}
          {user && (
            <div className="section-card">
              <div className="section-card-body">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="avatar-lg flex-shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-heading font-semibold text-secondary-900 truncate">{user.name}</h4>
                    <p className="text-xs text-secondary-400 truncate">{user.location || 'No location set'}</p>
                  </div>
                </div>

                {user.averageRating > 0 && (
                  <div className="flex items-center space-x-1.5 mb-4">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= user.averageRating
                              ? 'text-warning-400 fill-current'
                              : 'text-secondary-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-secondary-400">
                      {user.averageRating.toFixed(1)} ({user.totalReviews})
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-secondary-50 rounded-lg p-3 text-center">
                    <p className="text-lg font-heading font-bold text-secondary-900">
                      {user.skillsToTeach?.length || 0}
                    </p>
                    <p className="text-[10px] text-secondary-400 uppercase tracking-wider font-semibold">Teaching</p>
                  </div>
                  <div className="bg-secondary-50 rounded-lg p-3 text-center">
                    <p className="text-lg font-heading font-bold text-secondary-900">
                      {user.skillsToLearn?.length || 0}
                    </p>
                    <p className="text-[10px] text-secondary-400 uppercase tracking-wider font-semibold">Learning</p>
                  </div>
                </div>

                <button
                  onClick={() => router.push('/profile')}
                  className="w-full btn-outline text-sm py-2"
                >
                  View Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
