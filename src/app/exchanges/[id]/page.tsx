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
  Plus,
  Check,
  ExternalLink,
  ChevronRight,
  FolderGit2,
  Sparkles,
} from 'lucide-react';
import { Exchange } from '@/types';
import { Chat } from '@/components/Chat';
import { Modal } from '@/components/Modal';
import Link from 'next/link';

interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  assignee: 'me' | 'partner' | 'both';
  completed: boolean;
}

export default function ExchangeDetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = useParams();
  const [exchange, setExchange] = useState<Exchange | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');

  // Milestone management state (Stitch screen 162563daf86a46dbb243e17a94c862f2)
  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDesc, setMilestoneDesc] = useState('');
  const [milestoneDueDate, setMilestoneDueDate] = useState('');
  const [milestonePriority, setMilestonePriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [milestoneAssignee, setMilestoneAssignee] = useState<'me' | 'partner' | 'both'>('me');
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session) {
      fetchExchange();
    }
  }, [session, status, router, id]);

  // Load and persist milestones from localStorage by exchange id
  useEffect(() => {
    if (id) {
      const stored = localStorage.getItem(`milestones_${id}`);
      if (stored) {
        try {
          setMilestones(JSON.parse(stored));
          return;
        } catch (e) {
          console.error(e);
        }
      }
      // Defaults if not stored yet
      setMilestones([
        {
          id: 'm1',
          title: 'Exchange Kickoff & Scope Alignment',
          description: 'Initial consultation and deliverables confirmation',
          dueDate: 'Week 1',
          priority: 'high',
          assignee: 'both',
          completed: true,
        },
        {
          id: 'm2',
          title: 'Core Deliverables Draft & Session 1',
          description: 'Live interactive session and asset drafting',
          dueDate: 'Week 2',
          priority: 'medium',
          assignee: 'me',
          completed: false,
        },
        {
          id: 'm3',
          title: 'Project Handover & Review Signoff',
          description: 'Reciprocal project handover, asset downloads and reviews',
          dueDate: 'Week 3',
          priority: 'high',
          assignee: 'partner',
          completed: false,
        },
      ]);
    }
  }, [id]);

  const saveMilestones = (updated: Milestone[]) => {
    setMilestones(updated);
    if (id) {
      localStorage.setItem(`milestones_${id}`, JSON.stringify(updated));
    }
  };

  const toggleMilestone = (mId: string) => {
    const updated = milestones.map((m) =>
      m.id === mId ? { ...m, completed: !m.completed } : m
    );
    saveMilestones(updated);
  };

  const handleCreateMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneTitle.trim()) return;

    const newM: Milestone = {
      id: 'm_' + Date.now(),
      title: milestoneTitle.trim(),
      description: milestoneDesc.trim(),
      dueDate: milestoneDueDate || 'Flexible',
      priority: milestonePriority,
      assignee: milestoneAssignee,
      completed: false,
    };

    saveMilestones([...milestones, newM]);
    setMilestoneTitle('');
    setMilestoneDesc('');
    setMilestoneDueDate('');
    setMilestonePriority('medium');
    setMilestoneAssignee('me');
    setIsAddMilestoneOpen(false);
  };

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

  const handleStartVideoCall = async () => {
    try {
      await fetch(`/api/exchanges/${id}/start-call`, { method: 'POST' });
    } catch (e) {
      console.error('Start call error:', e);
    }
    router.push(`/video/${id}`);
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

  const completedCount = milestones.filter((m) => m.completed).length;
  const milestoneProgressPct =
    milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-8 py-6 space-y-6">
      {/* ─── Top Navigation & Action Banner ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Link
          href="/exchanges"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Exchanges</span>
        </Link>

        {/* Global Action Pills */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleStartVideoCall}
            className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <Video className="w-3.5 h-3.5 text-primary" />
            <span>Launch Video Call</span>
          </button>
          <Link
            href={`/exchanges/${exchange._id}/handover`}
            className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Handover & Deliverables</span>
          </Link>
        </div>
      </div>

      {/* ─── Two-Pane Collaboration Grid (Stitch Style) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Pane (4 cols): Context, The Exchange, Milestones & Timeline */}
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

          {/* Active Milestones Tracker (Stitch Screens a8ebcd23f6624a8e9bad5af62d8826c7 & 162563daf86a46dbb243e17a94c862f2) */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-outline">
                  Milestones
                </h3>
                <p className="text-[11px] text-on-surface-variant">
                  {completedCount} of {milestones.length} completed ({milestoneProgressPct}%)
                </p>
              </div>
              <button
                onClick={() => setIsAddMilestoneOpen(true)}
                className="text-xs font-semibold text-primary hover:text-primary-container inline-flex items-center gap-1 bg-primary/5 hover:bg-primary/10 px-2.5 py-1 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-surface-container-low rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${milestoneProgressPct}%` }}
              />
            </div>

            {/* Checklist */}
            <div className="space-y-2.5 pt-1">
              {milestones.map((m) => (
                <div
                  key={m.id}
                  onClick={() => toggleMilestone(m.id)}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    m.completed
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-on-surface-variant'
                      : 'bg-surface-container-low/60 hover:bg-surface-container-low border-outline-variant/30 text-on-surface'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center mt-0.5 flex-shrink-0 transition-colors ${
                      m.completed
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-outline-variant bg-surface'
                    }`}
                  >
                    {m.completed && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs font-semibold leading-snug ${
                        m.completed ? 'line-through text-outline' : 'text-on-surface'
                      }`}
                    >
                      {m.title}
                    </p>
                    {m.description && (
                      <p className="text-[11px] text-outline truncate mt-0.5">
                        {m.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface border border-outline-variant/30 text-on-surface-variant uppercase">
                        {m.assignee === 'me' ? 'You' : m.assignee === 'partner' ? partnerName : 'Both'}
                      </span>
                      <span
                        className={`text-[10px] font-mono uppercase ${
                          m.priority === 'high'
                            ? 'text-rose-600 font-bold'
                            : m.priority === 'medium'
                            ? 'text-amber-600'
                            : 'text-outline'
                        }`}
                      >
                        {m.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Link
                href={`/exchanges/${exchange._id}/handover`}
                className="w-full btn-outline text-xs py-2 flex items-center justify-center gap-1.5"
              >
                <FolderGit2 className="w-3.5 h-3.5 text-primary" />
                <span>Go to Deliverables Gallery</span>
              </Link>
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

      {/* Add Milestone Modal (Stitch screen 162563daf86a46dbb243e17a94c862f2) */}
      <Modal
        isOpen={isAddMilestoneOpen}
        onClose={() => setIsAddMilestoneOpen(false)}
        title="Add New Milestone"
      >
        <form onSubmit={handleCreateMilestone} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-on-surface block mb-1">
              Milestone Title
            </label>
            <input
              type="text"
              value={milestoneTitle}
              onChange={(e) => setMilestoneTitle(e.target.value)}
              placeholder="e.g., Phase 2: UI Design System"
              className="input-field text-xs"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-on-surface block mb-1">
              Description & Deliverables
            </label>
            <textarea
              value={milestoneDesc}
              onChange={(e) => setMilestoneDesc(e.target.value)}
              placeholder="Detail what needs to be accomplished in this milestone..."
              rows={3}
              className="input-field text-xs resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-on-surface block mb-1">
                Target Completion Date
              </label>
              <input
                type="date"
                value={milestoneDueDate}
                onChange={(e) => setMilestoneDueDate(e.target.value)}
                className="input-field text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-on-surface block mb-1">
                Priority
              </label>
              <div className="flex bg-surface-container-low p-1 rounded-xl">
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setMilestonePriority(p)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                      milestonePriority === p
                        ? 'bg-surface-container-lowest text-primary shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-on-surface block mb-1">
              Assign Responsibility
            </label>
            <div className="grid grid-cols-3 gap-2">
              <label
                onClick={() => setMilestoneAssignee('me')}
                className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                  milestoneAssignee === 'me'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-outline-variant/30 text-on-surface'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">
                  Me
                </div>
                <span className="text-xs font-medium">You</span>
              </label>

              <label
                onClick={() => setMilestoneAssignee('partner')}
                className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                  milestoneAssignee === 'partner'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-outline-variant/30 text-on-surface'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-tertiary/10 text-tertiary text-[10px] font-bold flex items-center justify-center">
                  {partnerName.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-xs font-medium truncate">{partnerName}</span>
              </label>

              <label
                onClick={() => setMilestoneAssignee('both')}
                className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                  milestoneAssignee === 'both'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-outline-variant/30 text-on-surface'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-surface-container-high text-on-surface text-[10px] font-bold flex items-center justify-center">
                  All
                </div>
                <span className="text-xs font-medium">Both</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={() => setIsAddMilestoneOpen(false)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary text-xs">
              Create Milestone
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
