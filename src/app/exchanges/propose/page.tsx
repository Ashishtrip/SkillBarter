'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronRight, 
  Clock, Calendar, MessageSquare, ShieldCheck, Sparkles, 
  User, Video, X, AlertCircle, ArrowLeftRight
} from 'lucide-react';
import { Skill, User as UserType } from '@/types';

export default function ProposeExchangePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get('userId');

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [partner, setPartner] = useState<UserType | null>(null);
  const [availablePartners, setAvailablePartners] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Step 1: Skills selection
  const [selectedOfferedSkill, setSelectedOfferedSkill] = useState<string>('');
  const [selectedRequestedSkill, setSelectedRequestedSkill] = useState<string>('');

  // Step 2: Scope & Commitment
  const [durationWeeks, setDurationWeeks] = useState('4');
  const [weeklyHours, setWeeklyHours] = useState('3-5');
  const [communicationPref, setCommunicationPref] = useState<'video' | 'chat' | 'hybrid'>('hybrid');
  const [milestones, setMilestones] = useState<string[]>([
    'Initial alignment & discovery call',
    'Core deliverable review & skill sharing',
    'Final project handover & feedback'
  ]);
  const [newMilestoneText, setNewMilestoneText] = useState('');

  // Step 3: Pitch message
  const [personalMessage, setPersonalMessage] = useState(
    "Hi! I'm really impressed by your domain expertise and would love to exchange skills. Let's collaborate to reach both of our learning goals!"
  );

  // Created exchange reference for Step 4
  const [createdExchangeId, setCreatedExchangeId] = useState<string>('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session) {
      loadInitialData();
    }
  }, [session, status, targetUserId]);

  const loadInitialData = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      // 1. Load current user's profile to get skillsToTeach
      const userRes = await fetch('/api/user/profile');
      let userData: UserType | null = null;
      if (userRes.ok) {
        const u = await userRes.json();
        userData = u.data || u;
        setCurrentUser(userData);
        if (userData?.skillsToTeach?.length) {
          const firstTeach = userData.skillsToTeach[0];
          setSelectedOfferedSkill(typeof firstTeach === 'object' ? (firstTeach as any)._id : firstTeach);
        }
      }

      // 2. Fetch partners
      const partnersRes = await fetch('/api/search/users?limit=20');
      let partnersList: UserType[] = [];
      if (partnersRes.ok) {
        const pData = await partnersRes.json();
        partnersList = Array.isArray(pData.data) ? pData.data : Array.isArray(pData) ? pData : [];
        // Filter out current user
        partnersList = partnersList.filter(p => p._id !== session?.user?.id);
        setAvailablePartners(partnersList);
      }

      // 3. Resolve target partner
      if (targetUserId) {
        const found = partnersList.find(p => p._id === targetUserId);
        if (found) {
          setPartner(found);
          if (found.skillsToTeach?.length) {
            const firstReq = found.skillsToTeach[0];
            setSelectedRequestedSkill(typeof firstReq === 'object' ? (firstReq as any)._id : firstReq);
          }
        }
      } else if (partnersList.length > 0) {
        const first = partnersList[0];
        setPartner(first);
        if (first.skillsToTeach?.length) {
          const firstReq = first.skillsToTeach[0];
          setSelectedRequestedSkill(typeof firstReq === 'object' ? (firstReq as any)._id : firstReq);
        }
      }
    } catch (err) {
      console.error('Error loading proposal data:', err);
      setErrorMessage('Failed to load user and skills information.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPartner = (p: UserType) => {
    setPartner(p);
    if (p.skillsToTeach?.length) {
      const firstReq = p.skillsToTeach[0];
      setSelectedRequestedSkill(typeof firstReq === 'object' ? (firstReq as any)._id : firstReq);
    } else {
      setSelectedRequestedSkill('');
    }
  };

  const addMilestone = () => {
    if (!newMilestoneText.trim()) return;
    setMilestones([...milestones, newMilestoneText.trim()]);
    setNewMilestoneText('');
  };

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleSubmitProposal = async () => {
    if (!partner?._id || !selectedOfferedSkill || !selectedRequestedSkill) {
      setErrorMessage('Please ensure both an offered and requested skill are selected.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        participantId: partner._id,
        offeredSkillId: selectedOfferedSkill,
        requestedSkillId: selectedRequestedSkill,
        initialMessage: `${personalMessage}\n\nScope:\n- Duration: ${durationWeeks} weeks\n- Weekly Commitment: ${weeklyHours} hrs/week\n- Communication: ${communicationPref}\n- Planned Milestones: ${milestones.join(', ')}`,
      };

      const res = await fetch('/api/exchanges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();

      if (res.ok) {
        const newId = resData.data?._id || resData._id;
        setCreatedExchangeId(newId || '');
        setStep(4);
      } else {
        setErrorMessage(resData.error || resData.message || 'Failed to submit exchange proposal.');
      }
    } catch (err) {
      console.error('Error submitting proposal:', err);
      setErrorMessage('Network error while dispatching proposal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-secondary text-sm font-medium">Preparing proposal canvas...</p>
        </div>
      </div>
    );
  }

  const offeredSkillObj = currentUser?.skillsToTeach?.find((s: any) => 
    (typeof s === 'object' ? s._id : s) === selectedOfferedSkill
  );
  const requestedSkillObj = partner?.skillsToTeach?.find((s: any) => 
    (typeof s === 'object' ? s._id : s) === selectedRequestedSkill
  );

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col">
      {/* Header with Step Progress */}
      <header className="bg-surface-container-lowest/80 backdrop-blur-xl border-b border-outline-variant/30 sticky top-0 z-40">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 h-18 flex justify-between items-center py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/search"
              className="p-2 rounded-xl text-secondary hover:text-on-surface hover:bg-surface-container transition-colors"
              title="Return to explore"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <span className="font-display text-lg font-bold text-primary tracking-tight">Kinetic Exchange</span>
              <span className="text-secondary text-xs block">Reciprocal Agreement Builder</span>
            </div>
          </div>

          {/* Stepper (Desktop) */}
          {step < 4 && (
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step >= 1 ? 'bg-primary text-white' : 'border border-outline-variant text-secondary'
                }`}>
                  1
                </div>
                <span className={`text-xs font-semibold ${step >= 1 ? 'text-primary' : 'text-secondary'}`}>
                  Select Skills
                </span>
              </div>
              <div className="w-8 h-px bg-outline-variant/50" />
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step >= 2 ? 'bg-primary text-white' : 'border border-outline-variant text-secondary'
                }`}>
                  2
                </div>
                <span className={`text-xs font-semibold ${step >= 2 ? 'text-primary' : 'text-secondary'}`}>
                  Define Scope
                </span>
              </div>
              <div className="w-8 h-px bg-outline-variant/50" />
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step >= 3 ? 'bg-primary text-white' : 'border border-outline-variant text-secondary'
                }`}>
                  3
                </div>
                <span className={`text-xs font-semibold ${step >= 3 ? 'text-primary' : 'text-secondary'}`}>
                  Review &amp; Pitch
                </span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Canvas */}
      <main className="flex-grow max-w-[1100px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-error-container/40 border border-error/30 text-error flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: SELECT SKILLS */}
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="text-center max-w-xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Step 1 of 3
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
                Pair Reciprocal Skills
              </h1>
              <p className="text-secondary text-sm mt-1">
                Select what you will teach or deliver in exchange for your partner's expertise.
              </p>
            </div>

            {/* Select Partner Selector if not locked */}
            {availablePartners.length > 1 && (
              <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                    {partner?.avatar ? (
                      <img src={partner.avatar} alt={partner.name} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      partner?.name?.charAt(0) || 'P'
                    )}
                  </div>
                  <div>
                    <span className="text-xs text-secondary font-medium block">Exchange Partner</span>
                    <span className="font-bold text-sm text-on-surface">{partner?.name || 'Select Partner'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1">
                  {availablePartners.slice(0, 5).map(p => (
                    <button
                      key={p._id}
                      onClick={() => handleSelectPartner(p)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                        partner?._id === p._id
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-surface-container text-secondary hover:text-on-surface'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Two-Column Exchange Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative items-stretch">
              
              {/* Connector Center Circle */}
              <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-surface-container-lowest border border-outline-variant/40 rounded-full items-center justify-center shadow-md text-primary">
                <ArrowLeftRight className="w-5 h-5" />
              </div>

              {/* LEFT: You Offer */}
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 pb-4 mb-4 border-b border-outline-variant/20">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-display font-bold text-base text-on-surface">You Offer</h2>
                      <p className="text-xs text-secondary">Pick a skill from your teaching portfolio</p>
                    </div>
                  </div>

                  {currentUser?.skillsToTeach && currentUser.skillsToTeach.length > 0 ? (
                    <div className="space-y-3">
                      {currentUser.skillsToTeach.map((skill: any) => {
                        const skillId = typeof skill === 'object' ? skill._id : skill;
                        const skillName = typeof skill === 'object' ? skill.name : skill;
                        const skillLevel = typeof skill === 'object' ? skill.level : 'expert';
                        const isSelected = selectedOfferedSkill === skillId;

                        return (
                          <label
                            key={skillId}
                            onClick={() => setSelectedOfferedSkill(skillId)}
                            className={`block p-4 rounded-xl border transition-all cursor-pointer relative ${
                              isSelected
                                ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20'
                                : 'border-outline-variant/30 hover:border-outline-variant hover:bg-surface-container-low/50'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <span className="font-bold text-sm text-on-surface block">{skillName}</span>
                                <span className="text-xs text-secondary capitalize">{skillLevel} proficiency</span>
                              </div>
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                                isSelected ? 'bg-primary border-primary text-white' : 'border-outline-variant'
                              }`}>
                                {isSelected && <Check className="w-3.5 h-3.5" />}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-6 text-center border border-dashed border-outline-variant/50 rounded-xl">
                      <p className="text-sm font-medium text-on-surface mb-2">No skills listed to teach</p>
                      <Link href="/my-skills" className="btn-primary text-xs px-3 py-1.5 inline-block">
                        Add a Skill First
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT: You Request */}
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 pb-4 mb-4 border-b border-outline-variant/20">
                    <div className="w-10 h-10 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-display font-bold text-base text-on-surface">You Request</h2>
                      <p className="text-xs text-secondary">From {partner?.name || 'Partner'}</p>
                    </div>
                  </div>

                  {partner?.skillsToTeach && partner.skillsToTeach.length > 0 ? (
                    <div className="space-y-3">
                      {partner.skillsToTeach.map((skill: any) => {
                        const skillId = typeof skill === 'object' ? skill._id : skill;
                        const skillName = typeof skill === 'object' ? skill.name : skill;
                        const skillLevel = typeof skill === 'object' ? skill.level : 'advanced';
                        const isSelected = selectedRequestedSkill === skillId;

                        return (
                          <label
                            key={skillId}
                            onClick={() => setSelectedRequestedSkill(skillId)}
                            className={`block p-4 rounded-xl border transition-all cursor-pointer relative ${
                              isSelected
                                ? 'border-tertiary bg-tertiary/5 shadow-sm ring-1 ring-tertiary/20'
                                : 'border-outline-variant/30 hover:border-outline-variant hover:bg-surface-container-low/50'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <span className="font-bold text-sm text-on-surface block">{skillName}</span>
                                <span className="text-xs text-secondary capitalize">{skillLevel} expertise</span>
                              </div>
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                                isSelected ? 'bg-tertiary border-tertiary text-white' : 'border-outline-variant'
                              }`}>
                                {isSelected && <Check className="w-3.5 h-3.5" />}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-6 text-center border border-dashed border-outline-variant/50 rounded-xl">
                      <p className="text-sm font-medium text-secondary">This partner has not published specific skills yet.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Step 1 Actions */}
            <div className="flex justify-end pt-4">
              <button
                onClick={() => {
                  if (!selectedOfferedSkill || !selectedRequestedSkill) {
                    setErrorMessage('Please select one skill to offer and one to request.');
                    return;
                  }
                  setErrorMessage('');
                  setStep(2);
                }}
                disabled={!selectedOfferedSkill || !selectedRequestedSkill}
                className="btn-primary px-6 py-3 flex items-center gap-2 disabled:opacity-50"
              >
                <span>Continue to Scope</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: DEFINE SCOPE & COMMITMENT */}
        {step === 2 && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="text-center max-w-xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Step 2 of 3
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
                Define Scope &amp; Commitment
              </h1>
              <p className="text-secondary text-sm mt-1">
                Establish clear expectations so both parties experience a balanced, productive exchange.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Commitment parameters */}
              <div className="md:col-span-1 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-sm space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-primary" />
                    Target Duration
                  </label>
                  <select
                    value={durationWeeks}
                    onChange={(e) => setDurationWeeks(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-sm outline-none"
                  >
                    <option value="2">2 Weeks (Quick Sprint)</option>
                    <option value="4">4 Weeks (Standard Exchange)</option>
                    <option value="6">6 Weeks (In-depth Collaboration)</option>
                    <option value="8">8 Weeks (Comprehensive Mastery)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-primary" />
                    Weekly Commitment
                  </label>
                  <select
                    value={weeklyHours}
                    onChange={(e) => setWeeklyHours(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-sm outline-none"
                  >
                    <option value="1-2">1 - 2 Hours / week</option>
                    <option value="3-5">3 - 5 Hours / week</option>
                    <option value="6-10">6 - 10 Hours / week</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-primary" />
                    Preferred Channels
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setCommunicationPref('video')}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                        communicationPref === 'video'
                          ? 'border-primary bg-primary/10 text-primary font-bold'
                          : 'border-outline-variant/40 text-secondary hover:text-on-surface'
                      }`}
                    >
                      Video
                    </button>
                    <button
                      type="button"
                      onClick={() => setCommunicationPref('chat')}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                        communicationPref === 'chat'
                          ? 'border-primary bg-primary/10 text-primary font-bold'
                          : 'border-outline-variant/40 text-secondary hover:text-on-surface'
                      }`}
                    >
                      Async Chat
                    </button>
                    <button
                      type="button"
                      onClick={() => setCommunicationPref('hybrid')}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                        communicationPref === 'hybrid'
                          ? 'border-primary bg-primary/10 text-primary font-bold'
                          : 'border-outline-variant/40 text-secondary hover:text-on-surface'
                      }`}
                    >
                      Hybrid
                    </button>
                  </div>
                </div>
              </div>

              {/* Milestones List */}
              <div className="md:col-span-2 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-sm space-y-5">
                <div>
                  <h3 className="font-display font-bold text-base text-on-surface">Planned Exchange Milestones</h3>
                  <p className="text-secondary text-xs mt-0.5">
                    Deliverables that both parties agree to complete throughout the exchange.
                  </p>
                </div>

                <div className="space-y-3">
                  {milestones.map((m, index) => (
                    <div
                      key={index}
                      className="p-3.5 rounded-xl border border-outline-variant/30 bg-surface-container-low/50 flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium text-on-surface">{m}</span>
                      </div>
                      <button
                        onClick={() => removeMilestone(index)}
                        className="text-secondary hover:text-error opacity-60 group-hover:opacity-100 transition-opacity p-1"
                        title="Remove milestone"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Milestone Input */}
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={newMilestoneText}
                    onChange={(e) => setNewMilestoneText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addMilestone()}
                    placeholder="Add an outcome (e.g. Code review session, Prototype mockup)..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-sm outline-none"
                  />
                  <button
                    type="button"
                    onClick={addMilestone}
                    className="btn-primary text-xs px-4 py-2.5"
                  >
                    Add Milestone
                  </button>
                </div>
              </div>

            </div>

            {/* Step 2 Actions */}
            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(1)}
                className="btn-outline px-5 py-2.5 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setStep(3)}
                className="btn-primary px-6 py-2.5 flex items-center gap-2"
              >
                <span>Review &amp; Pitch</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: REVIEW & PITCH */}
        {step === 3 && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="text-center max-w-xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Step 3 of 3
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
                Review &amp; Dispatch Proposal
              </h1>
              <p className="text-secondary text-sm mt-1">
                Attach a personalized pitch note to introduce your exchange proposal to {partner?.name}.
              </p>
            </div>

            {/* Reciprocal Overview Bento Card */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-sm space-y-6">
              <h2 className="font-display font-bold text-lg text-on-surface">The Proposed Exchange</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary block mb-1">You Provide</span>
                  <p className="font-display font-bold text-base text-on-surface">
                    {typeof offeredSkillObj === 'object' ? offeredSkillObj.name : 'Selected Skill'}
                  </p>
                  <p className="text-xs text-secondary mt-1">
                    Delivered via {weeklyHours} hrs/week over {durationWeeks} weeks
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-tertiary/5 border border-tertiary/20">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-tertiary block mb-1">Partner Provides</span>
                  <p className="font-display font-bold text-base text-on-surface">
                    {typeof requestedSkillObj === 'object' ? requestedSkillObj.name : 'Requested Skill'}
                  </p>
                  <p className="text-xs text-secondary mt-1">
                    Guided by {partner?.name} through {communicationPref} channels
                  </p>
                </div>
              </div>

              {/* Personal Message Pitch Note */}
              <div>
                <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  Proposal Message / Pitch
                </label>
                <textarea
                  rows={4}
                  value={personalMessage}
                  onChange={(e) => setPersonalMessage(e.target.value)}
                  maxLength={600}
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant/40 bg-surface-container-lowest focus:border-primary text-sm outline-none leading-relaxed"
                />
                <p className="text-xs text-secondary mt-1">{personalMessage.length}/600 characters</p>
              </div>

              {/* Trust & Safety Assurance */}
              <div className="p-4 rounded-xl bg-surface-container-low/60 border border-outline-variant/20 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="text-xs text-secondary leading-relaxed">
                  <span className="font-bold text-on-surface">Kinetic Reciprocity Guarantee: </span>
                  Exchanges are milestone-driven. Both participants review and approve work before completing the barter, ensuring equal value is delivered.
                </div>
              </div>
            </div>

            {/* Step 3 Actions */}
            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(2)}
                className="btn-outline px-5 py-2.5 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={handleSubmitProposal}
                disabled={isSubmitting}
                className="btn-primary px-8 py-3 flex items-center gap-2 shadow-md disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Dispatching Proposal...</span>
                ) : (
                  <>
                    <span>Send Proposal</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: PROPOSAL SENT CONFIRMATION CARD */}
        {step === 4 && (
          <div className="max-w-lg mx-auto bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 shadow-lg text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-1">Proposal Dispatched</span>
              <h2 className="font-display text-2xl font-bold text-on-surface">Invitation Sent to {partner?.name}!</h2>
              <p className="text-secondary text-sm mt-2 leading-relaxed">
                Your barter proposal has been queued. When {partner?.name} accepts, a collaborative workspace will open automatically.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-low/50 border border-outline-variant/20 text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-secondary">Offered:</span>
                <span className="font-bold text-on-surface">{typeof offeredSkillObj === 'object' ? offeredSkillObj.name : 'Skill'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Requested:</span>
                <span className="font-bold text-on-surface">{typeof requestedSkillObj === 'object' ? requestedSkillObj.name : 'Skill'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Duration:</span>
                <span className="font-medium text-on-surface">{durationWeeks} weeks</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {createdExchangeId ? (
                <Link
                  href={`/exchanges/${createdExchangeId}`}
                  className="btn-primary flex-1 py-2.5 text-xs text-center"
                >
                  Open Workspace
                </Link>
              ) : null}
              <Link
                href="/exchanges"
                className="btn-outline flex-1 py-2.5 text-xs text-center"
              >
                View My Exchanges
              </Link>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

