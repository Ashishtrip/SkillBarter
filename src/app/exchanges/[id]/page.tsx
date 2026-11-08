'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  ArrowLeft,
  Users,
  Repeat,
  CheckCircle2,
  CalendarDays,
  ShieldCheck,
  Video,
} from 'lucide-react';
import { Exchange } from '@/types';
import { Chat } from '@/components/Chat';
import { Modal } from '@/components/Modal';
import Link from 'next/link';

export default function ExchangeDetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = useParams();
  const [exchange, setExchange] = useState<Exchange | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session) {
      fetchExchange();
    }
  }, [session, status, router, id]);

  const fetchExchange = async () => {
    try {
      const response = await fetch(`/api/exchanges/${id}`);
      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        setExchange(data);
      } else {
        router.push('/exchanges');
      }
    } catch (error) {
      console.error('Error fetching exchange:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleDate) return;

    try {
      const response = await fetch(`/api/exchanges/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scheduledFor: scheduleDate }),
      });

      if (response.ok) {
        const result = await response.json();
        const updatedExchange = result.data || result;
        setExchange(updatedExchange);
        setIsScheduling(false);
      }
    } catch (error) {
      console.error('Error scheduling exchange:', error);
    }
  };

  const handleAddToCalendar = (provider: 'google' | 'outlook') => {
    alert(`Added to ${provider} calendar.`);
    setIsCalendarModalOpen(false);
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-xs text-outline font-mono">Loading workspace...</p>
      </div>
    );
  }

  if (!exchange) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <p className="text-sm font-semibold text-on-surface">Exchange not found.</p>
        <Link href="/exchanges" className="btn-secondary text-xs">
          Return to Exchanges
        </Link>
      </div>
    );
  }

  const isOfferer =
    typeof exchange.offeredBy === 'object' &&
    (exchange.offeredBy as any)?._id === session?.user?.id;

  const otherUser =
    typeof exchange.offeredBy === 'object' &&
    (exchange.offeredBy as any)?._id !== session?.user?.id
      ? exchange.offeredBy
      : exchange.requestedBy;

  const partnerName =
    typeof otherUser === 'object' && otherUser !== null ? (otherUser as any).name : 'Collaborator';

  const partnerLocation =
    typeof otherUser === 'object' && otherUser !== null ? (otherUser as any).location : 'Remote';

  const offeredSkillName =
    typeof exchange.skills?.offered === 'object' && exchange.skills?.offered !== null
      ? (exchange.skills.offered as any).name
      : exchange.skills?.offered || 'Offer';

  const requestedSkillName =
    typeof exchange.skills?.requested === 'object' && exchange.skills?.requested !== null
      ? (exchange.skills.requested as any).name
      : exchange.skills?.requested || 'Need';

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-8 py-6 space-y-6">
      {/* ─── Back Button ─── */}
      <Link
        href="/exchanges"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to My Exchanges</span>
      </Link>

      {/* ─── Two-Pane Collaboration Grid (Stitch Style) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Pane (4 cols): Context, The Exchange & Timeline */}
        <div className="lg:col-span-4 space-y-6">
          {/* Partner Info Card */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-card space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full border-2 border-primary/20 bg-primary/10 flex items-center justify-center font-bold text-primary text-base flex-shrink-0">
                {partnerName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold font-display text-on-surface truncate">
                  {partnerName}
                </h2>
                <p className="text-xs text-on-surface-variant truncate">
                  {partnerLocation || 'Remote / Global'}
                </p>
                <div className="inline-flex items-center gap-1 mt-1 text-[11px] text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified Partner</span>
                </div>
              </div>
            </div>

            <div className="h-px bg-outline-variant/20" />

            {/* The Exchange Section */}
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-outline mb-3">
                The Exchange
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-[11px] text-outline block mb-1">
                    {partnerName} is providing:
                  </span>
                  <span className="inline-block bg-surface-container-low text-on-surface px-3 py-1.5 rounded-xl text-xs font-mono font-medium border border-outline-variant/30">
                    {isOfferer ? requestedSkillName : offeredSkillName}
                  </span>
                </div>

                <div className="flex justify-center py-0.5">
                  <Repeat className="w-4 h-4 text-primary" />
                </div>

                <div>
                  <span className="text-[11px] text-outline block mb-1">
                    You are providing:
                  </span>
                  <span className="inline-block bg-primary/10 text-primary px-3 py-1.5 rounded-xl text-xs font-mono font-medium border border-primary/20">
                    {isOfferer ? offeredSkillName : requestedSkillName}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline & Schedule Card */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-card space-y-5">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-outline">
              Exchange Status & Timeline
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-outline-variant/30">
              <div className="relative">
                <div className="absolute -left-6 w-3 h-3 bg-primary rounded-full ring-4 ring-white mt-1" />
                <p className="text-xs font-bold text-on-surface">Proposal Accepted</p>
                <p className="text-[11px] text-outline">
                  {exchange.createdAt ? new Date(exchange.createdAt).toLocaleDateString() : 'Active'}
                </p>
              </div>

              <div className="relative">
                <div
                  className={`absolute -left-6 w-3 h-3 rounded-full ring-4 ring-white mt-1 ${
                    exchange.status === 'completed' ? 'bg-primary' : 'bg-outline-variant'
                  }`}
                />
                <p className="text-xs font-bold text-on-surface">
                  {exchange.status === 'completed' ? 'Exchange Completed' : 'In Progress'}
                </p>
                <p className="text-[11px] text-outline">
                  {exchange.status === 'completed' ? 'Milestones Verified' : 'Collaboration active'}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-outline-variant/20">
              {exchange.scheduledFor ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-on-surface">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>
                      Scheduled: {new Date(exchange.scheduledFor).toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsCalendarModalOpen(true)}
                    className="btn-outline w-full text-xs py-2"
                  >
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span>Add to Calendar</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsScheduling(true)}
                  className="btn-secondary w-full text-xs py-2"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Schedule Exchange Session</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Pane (8 cols): Collaboration Hub & Discussion */}
        <div className="lg:col-span-8">
          <Chat exchangeId={exchange._id || ''} currentUserId={session?.user?.id || ''} />
        </div>
      </div>

      {/* Schedule Modal */}
      <Modal
        isOpen={isScheduling}
        onClose={() => setIsScheduling(false)}
        title="Schedule Live Exchange"
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-on-surface block mb-1">
              Select Date & Time:
            </label>
            <input
              type="datetime-local"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsScheduling(false)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary text-xs">
              Confirm Schedule
            </button>
          </div>
        </form>
      </Modal>

      {/* Add To Calendar Modal */}
      <Modal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        title="Add Session to Calendar"
      >
        <div className="space-y-3 py-2">
          <button
            onClick={() => handleAddToCalendar('google')}
            className="w-full btn-primary text-xs"
          >
            Add to Google Calendar
          </button>
          <button
            onClick={() => handleAddToCalendar('outlook')}
            className="w-full btn-secondary text-xs"
          >
            Add to Outlook Calendar
          </button>
        </div>
      </Modal>
    </div>
  );
}
