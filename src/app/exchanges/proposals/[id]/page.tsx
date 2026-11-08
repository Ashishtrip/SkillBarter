'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Check, CheckCircle2, MessageSquare, 
  Calendar, Clock, Video, ShieldCheck, User, X, AlertCircle, 
  Sparkles, ArrowLeftRight
} from 'lucide-react';

export default function ProposalReceivedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const exchangeId = params.id as string;

  const [exchange, setExchange] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session && exchangeId) {
      fetchExchange();
    }
  }, [session, status, exchangeId]);

  const fetchExchange = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch(`/api/exchanges/${exchangeId}`);
      if (res.ok) {
        const data = await res.json();
        setExchange(data.data || data);
      } else {
        setErrorMessage('Could not load proposal details.');
      }
    } catch (err) {
      console.error('Error fetching proposal:', err);
      setErrorMessage('Network error while retrieving proposal.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: 'active' | 'cancelled') => {
    setIsProcessing(true);
    setErrorMessage('');
    try {
      const res = await fetch(`/api/exchanges/${exchangeId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        if (newStatus === 'active') {
          router.push(`/exchanges/${exchangeId}`);
        } else {
          router.push('/exchanges');
        }
      } else {
        const data = await res.json();
        setErrorMessage(data.error || 'Failed to update proposal status.');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setErrorMessage('Network error while updating proposal.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-secondary text-sm font-medium">Loading proposal details...</p>
        </div>
      </div>
    );
  }

  if (!exchange) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/30 text-center max-w-md w-full shadow-sm">
          <AlertCircle className="w-10 h-10 text-error mx-auto mb-3" />
          <h2 className="font-display font-bold text-lg text-on-surface">Proposal Not Found</h2>
          <p className="text-secondary text-xs mt-1 mb-6">{errorMessage || 'This proposal may have expired or been moved.'}</p>
          <Link href="/exchanges" className="btn-primary text-xs px-4 py-2 inline-block">
            Back to Exchanges
          </Link>
        </div>
      </div>
    );
  }

  const isCurrentUserOfferer = exchange.offeredBy?._id === session?.user?.id;
  const partner = isCurrentUserOfferer ? exchange.requestedBy : exchange.offeredBy;
  const partnerOffer = isCurrentUserOfferer ? exchange.skills?.requested : exchange.skills?.offered;
  const yourPart = isCurrentUserOfferer ? exchange.skills?.offered : exchange.skills?.requested;

  const firstMessage = exchange.messages?.find((m: any) => m.type === 'exchange_request')?.content || 
    exchange.messages?.[0]?.content ||
    "Hi! I would love to propose an exchange based on our complementary skills. Let's collaborate to reach both of our learning goals!";

  return (
    <div className="min-h-screen bg-background text-on-background py-8">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-3">
          <Link
            href="/exchanges"
            className="p-2 rounded-xl text-secondary hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-secondary text-xs">Exchanges / Proposals / Review</span>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-error-container/40 border border-error/30 text-error flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Header Section */}
        <header className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-surface-container overflow-hidden border-2 border-surface-container-lowest shadow-md flex items-center justify-center shrink-0">
              {partner?.avatar ? (
                <img src={partner.avatar} alt={partner.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold font-display">
                  {partner?.name?.charAt(0) || 'P'}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-on-surface">
                  {partner?.name}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                  <Sparkles className="w-3 h-3" />
                  Barter Proposal
                </span>
              </div>
              <p className="text-secondary text-sm mt-1">{partner?.location || 'Verified Skill Partner'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto w-full sm:w-auto">
            <button
              onClick={() => handleUpdateStatus('cancelled')}
              disabled={isProcessing}
              className="btn-outline flex-1 sm:flex-none text-xs px-4 py-2.5 hover:border-error hover:text-error"
            >
              Decline
            </button>
            <Link
              href={`/exchanges/${exchangeId}`}
              className="btn-secondary flex-1 sm:flex-none text-xs px-4 py-2.5 text-center"
            >
              Message to Discuss
            </Link>
            {exchange.status === 'pending' && !isCurrentUserOfferer && (
              <button
                onClick={() => handleUpdateStatus('active')}
                disabled={isProcessing}
                className="btn-primary flex-1 sm:flex-none text-xs px-5 py-2.5 flex items-center justify-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Accept Proposal</span>
              </button>
            )}
          </div>
        </header>

        {/* 12-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Scope & Message (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* The Exchange Comparison Card */}
            <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 sm:p-7 shadow-sm">
              <h2 className="font-display font-bold text-lg text-on-surface mb-5">The Reciprocal Exchange</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                
                {/* Center Badge */}
                <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-surface-container-lowest border border-outline-variant/40 rounded-full items-center justify-center shadow-md text-primary">
                  <ArrowLeftRight className="w-4 h-4" />
                </div>

                {/* Partner Provides */}
                <div className="p-5 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary block">
                    {partner?.name} Offers
                  </span>
                  <h3 className="font-display font-bold text-base text-on-surface">
                    {partnerOffer?.name || 'Partner Specialization'}
                  </h3>
                  <p className="text-xs text-secondary capitalize">
                    {partnerOffer?.category || 'Expertise'} • {partnerOffer?.level || 'Advanced'}
                  </p>
                </div>

                {/* You Provide */}
                <div className="p-5 rounded-xl bg-tertiary/5 border border-tertiary/20 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-tertiary block">
                    You Provide in Return
                  </span>
                  <h3 className="font-display font-bold text-base text-on-surface">
                    {yourPart?.name || 'Your Specialization'}
                  </h3>
                  <p className="text-xs text-secondary capitalize">
                    {yourPart?.category || 'Expertise'} • {yourPart?.level || 'Proficient'}
                  </p>
                </div>

              </div>
            </section>

            {/* Pitch Note Blockquote */}
            <section className="bg-primary-container/5 border-l-4 border-primary rounded-r-2xl p-6 sm:p-7 relative overflow-hidden">
              <span className="text-xs font-bold text-primary uppercase tracking-widest block mb-3">
                Partner Pitch Message
              </span>
              <p className="text-on-surface-variant text-sm sm:text-base italic leading-relaxed whitespace-pre-line">
                "{firstMessage}"
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs font-bold text-on-surface">— {partner?.name}</span>
              </div>
            </section>

          </div>

          {/* Right Column: Project Scope Specs (1 col) */}
          <aside className="lg:col-span-1 space-y-6">
            
            <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-sm space-y-5">
              <h3 className="font-display font-bold text-base text-on-surface flex items-center gap-2 pb-3 border-b border-outline-variant/20">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Exchange Parameters
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-secondary block mb-1">Target Duration</span>
                  <div className="font-semibold text-on-surface flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-secondary/70" />
                    <span>4 Weeks Duration</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-outline-variant/20">
                  <span className="text-secondary block mb-1">Weekly Commitment</span>
                  <div className="font-semibold text-on-surface flex items-center gap-2">
                    <Clock className="w-4 h-4 text-secondary/70" />
                    <span>3 - 5 Hours / week</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-outline-variant/20">
                  <span className="text-secondary block mb-1">Channel Preference</span>
                  <div className="font-semibold text-on-surface flex items-center gap-2">
                    <Video className="w-4 h-4 text-secondary/70" />
                    <span>Hybrid (Workspace &amp; Video Sync)</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Safety & Reciprocity Pledge */}
            <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-sm text-center">
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center mx-auto mb-3 text-secondary">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xs text-on-surface mb-1">Kinetic Exchange Protections</h4>
              <p className="text-[11px] text-secondary leading-relaxed">
                Work is held in collaborative milestones. Neither party completes the exchange until both approve all deliverables.
              </p>
            </section>

          </aside>

        </div>

      </div>
    </div>
  );
}
