'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Star,
  Plus,
  ArrowRight,
  TrendingUp,
  Award,
  Zap,
  Repeat,
  Sparkles,
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
    skillsTeaching: 0,
    skillsLearning: 0,
    completedExchanges: 0,
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
        const data = Array.isArray(exchangesData) ? exchangesData : exchangesData.data || [];
        setExchanges(data);
        setStats((prev) => ({
          ...prev,
          activeExchanges: data.filter((e: Exchange) => e.status === 'active').length,
          completedExchanges: data.filter((e: Exchange) => e.status === 'completed').length,
        }));
      }

      if (userRes.ok) {
        const result = await userRes.json();
        const userData = result.data || result;
        setUser(userData);
        setStats((prev) => ({
          ...prev,
          skillsTeaching: userData.skillsToTeach?.length || 0,
          skillsLearning: userData.skillsToLearn?.length || 0,
        }));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
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
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-xs text-on-surface-variant font-mono">Loading your barter dashboard...</p>
      </div>
    );
  }

  const ongoingExchanges = exchanges.filter((e) => e.status === 'active' || e.status === 'pending');

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row gap-8">
      {/* ─── Left Sidebar: Quick Stats & Actions (Stitch Pattern) ─── */}
      <aside className="w-full md:w-64 flex-shrink-0 flex flex-col gap-6">
        {/* Quick Stats Card */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-card hover:shadow-card-hover transition-all">
          <h2 className="text-xs font-mono font-bold text-outline uppercase tracking-wider mb-5">
            Quick Stats
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-surface-container-high pb-3">
              <span className="text-sm font-medium text-on-surface">Active Exchanges</span>
              <span className="text-2xl font-bold font-display text-primary">
                {stats.activeExchanges}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-surface-container-high pb-3">
              <span className="text-sm font-medium text-on-surface">Skills Teaching</span>
              <span className="text-2xl font-bold font-display text-tertiary">
                {stats.skillsTeaching}
              </span>
            </div>
            <div className="flex justify-between items-center pb-1">
              <span className="text-sm font-medium text-on-surface">Skills Learning</span>
              <span className="text-2xl font-bold font-display text-on-surface-variant">
                {stats.skillsLearning}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button: Quick Start: List Skill */}
        <button
          onClick={() => router.push('/profile')}
          className="w-full bg-primary hover:bg-primary-container text-white text-sm font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Quick Start: List Skill</span>
        </button>

        {/* Find Exchange Partner shortcut */}
        <button
          onClick={() => router.push('/search')}
          className="w-full bg-surface-container-lowest hover:bg-surface-container text-on-surface border border-outline-variant/40 text-sm font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <span>Find Exchange Partner</span>
          <ArrowRight className="w-4 h-4 text-outline" />
        </button>

        {/* Mini Profile Card */}
        {user && (
          <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-on-surface truncate">{user.name}</p>
              <p className="text-xs text-on-surface-variant truncate">
                {user.location || 'Remote'} · ★ {(user.averageRating || 5.0).toFixed(1)}
              </p>
            </div>
          </div>
        )}
      </aside>

      {/* ─── Right Section: Ongoing Barters & Activity ─── */}
      <section className="flex-grow flex flex-col gap-8 min-w-0">
        {/* Ongoing Barters Section */}
        <div>
          <div className="flex justify-between items-center mb-5">
            <div>
              <h1 className="text-2xl font-bold font-display text-on-surface tracking-tight">
                Ongoing Barters
              </h1>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Your currently active and pending skill trade commitments.
              </p>
            </div>
            <Link
              href="/exchanges"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              All Exchanges <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {ongoingExchanges.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {ongoingExchanges.map((exchange) => {
                const offeredTitle = exchange.skills?.offered
                  ? typeof exchange.skills.offered === 'object'
                    ? (exchange.skills.offered as any).name
                    : exchange.skills.offered
                  : 'Skill Trade';

                const requestedTitle = exchange.skills?.requested
                  ? typeof exchange.skills.requested === 'object'
                    ? (exchange.skills.requested as any).name
                    : exchange.skills.requested
                  : 'Skill Learning';

                const otherUser =
                  typeof exchange.offeredBy === 'object' &&
                  (exchange.offeredBy as any)?._id !== session?.user?.id
                    ? (exchange.offeredBy as any)?.name
                    : typeof exchange.requestedBy === 'object'
                    ? (exchange.requestedBy as any)?.name
                    : 'Collaborator';

                // Progress simulation or based on completed milestones
                const progressPct = exchange.status === 'completed' ? 100 : exchange.status === 'active' ? 50 : 15;

                return (
                  <div
                    key={exchange._id}
                    className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full border border-outline-variant/40 bg-surface-container flex items-center justify-center font-bold text-primary text-sm flex-shrink-0">
                            {otherUser.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-on-surface">{offeredTitle}</h3>
                            <p className="text-xs text-on-surface-variant">with {otherUser}</p>
                          </div>
                        </div>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider ${
                            exchange.status === 'active'
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
                          }`}
                        >
                          {exchange.status}
                        </span>
                      </div>

                      <div className="mb-5">
                        <p className="text-xs text-on-surface-variant mb-2">
                          Exchange for: <span className="font-semibold text-on-surface">{requestedTitle}</span>
                        </p>
                        {/* Progress Bar */}
                        <div className="w-full bg-surface-container-high rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] text-outline mt-1 font-mono">
                          <span>Progress</span>
                          <span>{progressPct}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/20">
                      {exchange.status === 'pending' && (
                        <button
                          onClick={() => handleAcceptExchange(exchange._id as string)}
                          className="text-xs font-semibold bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-container transition-colors"
                        >
                          Accept Proposal
                        </button>
                      )}
                      {exchange.status === 'active' && (
                        <button
                          onClick={() => handleCompleteExchange(exchange._id as string)}
                          className="text-xs font-semibold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 px-3 py-1.5 rounded-lg hover:bg-emerald-500/20 transition-colors"
                        >
                          Mark Done
                        </button>
                      )}
                      <button
                        onClick={() => router.push(`/exchanges/${exchange._id}`)}
                        className="text-on-surface-variant hover:text-primary p-2 rounded-lg hover:bg-surface-container transition-colors"
                        title="Chat & Details"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => router.push(`/exchanges/${exchange._id}`)}
                        className="bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold py-1.5 px-3.5 rounded-lg transition-colors"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-10 text-center shadow-card">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                <Repeat className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-on-surface mb-1">No active exchanges yet</h3>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto mb-5">
                Explore partners with matching skill overlap and send your first exchange proposal.
              </p>
              <button
                onClick={() => router.push('/search')}
                className="btn-primary text-xs"
              >
                Explore Exchange Partners
              </button>
            </div>
          )}
        </div>

        {/* Recent Activity Section (Stitch Style) */}
        <div>
          <h2 className="text-xl font-bold font-display text-on-surface tracking-tight mb-4">
            Recent Activity
          </h2>
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-card overflow-hidden">
            <ul className="divide-y divide-outline-variant/20">
              <li className="p-4 hover:bg-surface-bright transition-colors flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-medium text-on-surface">
                    Profile updated with skills & expertise
                  </p>
                  <p className="text-xs text-outline font-mono mt-0.5">Recently active</p>
                </div>
              </li>
              <li className="p-4 hover:bg-surface-bright transition-colors flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary flex-shrink-0">
                  <Repeat className="w-5 h-5" />
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-medium text-on-surface">
                    Kinetic barter algorithm updated your match recommendations
                  </p>
                  <p className="text-xs text-outline font-mono mt-0.5">Automated update</p>
                </div>
              </li>
              <li className="p-4 hover:bg-surface-bright transition-colors flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 flex-shrink-0">
                  <Star className="w-5 h-5" />
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-medium text-on-surface">
                    Member reputation in good standing
                  </p>
                  <p className="text-xs text-outline font-mono mt-0.5">Verified peer</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
