'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Star,
  Repeat,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Exchange, ExchangeStatus } from '@/types';
import Link from 'next/link';

export default function ExchangesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'active' | 'completed'>('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session) {
      fetchExchanges();
    }
  }, [session, status, router]);

  const fetchExchanges = async () => {
    try {
      const response = await fetch('/api/exchanges');
      if (response.ok) {
        const result = await response.json();
        const data = Array.isArray(result) ? result : result.data || [];
        setExchanges(data);
      }
    } catch (error) {
      console.error('Error fetching exchanges:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredExchanges = exchanges.filter((e) => {
    if (activeTab === 'all') return true;
    return e.status === activeTab;
  });

  const getStatusBadge = (exchangeStatus: ExchangeStatus) => {
    switch (exchangeStatus) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            Active
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 border border-amber-500/20">
            Pending Response
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-error/10 text-error border border-error/20">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-container text-on-surface-variant">
            {exchangeStatus}
          </span>
        );
    }
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-xs text-on-surface-variant font-mono">Loading your exchanges...</p>
      </div>
    );
  }

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-8 py-8 space-y-8">
      {/* ─── Header & Status Filter Bar (Stitch Style) ─── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-outline-variant/20 pb-6">
        <div>
          <h1 className="text-headline-lg font-headline-lg font-bold text-on-surface tracking-tight mb-1">
            My Exchanges
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Manage your active learning and teaching partnerships.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Segmented Tab Pill */}
          <div className="flex gap-1 bg-surface-container-low p-1 rounded-xl">
            {(['all', 'pending', 'active', 'completed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <Link href="/search" className="btn-primary text-xs py-2 px-4 whitespace-nowrap">
            <Plus className="w-3.5 h-3.5" />
            <span>Create Barter</span>
          </Link>
        </div>
      </div>

      {/* ─── Exchanges Grid (Stitch Style) ─── */}
      {filteredExchanges.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredExchanges.map((exchange) => {
            const isOfferer =
              typeof exchange.offeredBy === 'object' &&
              (exchange.offeredBy as any)?._id === session?.user?.id;

            const partnerName =
              typeof exchange.offeredBy === 'object' &&
              (exchange.offeredBy as any)?._id !== session?.user?.id
                ? (exchange.offeredBy as any)?.name
                : typeof exchange.requestedBy === 'object'
                ? (exchange.requestedBy as any)?.name
                : 'Partner';

            const offeredSkillName =
              typeof exchange.skills?.offered === 'object' && exchange.skills?.offered !== null
                ? (exchange.skills.offered as any).name
                : exchange.skills?.offered || 'Offer';

            const requestedSkillName =
              typeof exchange.skills?.requested === 'object' && exchange.skills?.requested !== null
                ? (exchange.skills.requested as any).name
                : exchange.skills?.requested || 'Need';

            const progressPct =
              exchange.status === 'completed'
                ? 100
                : exchange.status === 'active'
                ? 50
                : 15;

            return (
              <div
                key={exchange._id}
                className="bento-card rounded-2xl p-6 flex flex-col justify-between gap-5 group"
              >
                {/* Partner Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full border border-outline-variant/40 bg-surface-container-low flex items-center justify-center font-bold text-primary text-sm flex-shrink-0">
                      {partnerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-sm text-on-surface truncate">
                        {partnerName}
                      </h3>
                      <p className="text-[11px] text-on-surface-variant flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span>4.9 · {exchange.messages?.length || 0} messages</span>
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(exchange.status)}
                </div>

                {/* 2-Column Split: Teaching vs Learning */}
                <div className="grid grid-cols-2 gap-3 py-4 border-y border-outline-variant/25">
                  <div className="pr-2 border-r border-outline-variant/15">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-outline block mb-1">
                      Teaching
                    </span>
                    <span className="text-sm font-semibold text-on-surface line-clamp-1">
                      {isOfferer ? offeredSkillName : requestedSkillName}
                    </span>
                  </div>
                  <div className="pl-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-outline block mb-1">
                      Learning
                    </span>
                    <span className="text-sm font-semibold text-on-surface line-clamp-1">
                      {isOfferer ? requestedSkillName : offeredSkillName}
                    </span>
                  </div>
                </div>

                {/* Milestone Progress Bar */}
                <div>
                  <div className="flex justify-between items-end mb-1.5 text-xs">
                    <span className="text-on-surface-variant font-medium">Milestone Progress</span>
                    <span className="text-primary font-mono font-bold">{progressPct}%</span>
                  </div>
                  <div className="w-full bg-surface-container-low rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex gap-2 pt-2 border-t border-outline-variant/15 mt-auto">
                  <Link
                    href={`/exchanges/${exchange._id}`}
                    className="flex-1 bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-outline" />
                    <span>Chat Hub</span>
                  </Link>

                  <Link
                    href={`/exchanges/${exchange._id}`}
                    className="flex-1 bg-primary hover:bg-primary-container text-white text-xs font-semibold py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <span>Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-12 text-center shadow-card max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <Repeat className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-on-surface mb-2">No {activeTab} exchanges</h3>
          <p className="text-xs text-on-surface-variant mb-6">
            Explore active listings from other founders and professionals to propose your first skill trade.
          </p>
          <Link href="/search" className="btn-primary text-xs">
            Find Exchange Partners
          </Link>
        </div>
      )}
    </div>
  );
}
