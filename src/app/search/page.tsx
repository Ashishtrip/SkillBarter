'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  User,
  MapPin,
  Star,
  Sparkles,
  X,
  CheckCircle2,
  Repeat,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Skill, User as UserType, SkillCategory, SkillLevel } from '@/types';

export default function SearchPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams?.get('search') || searchParams?.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [experienceLevel, setExperienceLevel] = useState<string>('all');
  const [availability, setAvailability] = useState<string>('all');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [skillType, setSkillType] = useState<'teach' | 'learn' | ''>('');
  const [searchResults, setSearchResults] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Propose Exchange modal states
  const [selectedPartner, setSelectedPartner] = useState<UserType | null>(null);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [selectedOfferedSkill, setSelectedOfferedSkill] = useState<string>('');
  const [selectedRequestedSkill, setSelectedRequestedSkill] = useState<string>('');
  const [proposalMessage, setProposalMessage] = useState('');
  const [isSubmittingExchange, setIsSubmittingExchange] = useState(false);
  const [currentUserSkills, setCurrentUserSkills] = useState<Skill[]>([]);
  const [exchangeSuccess, setExchangeSuccess] = useState(false);

  const categoryPills = [
    { id: 'all', label: 'All' },
    { id: 'tech', label: 'Developers' },
    { id: 'arts', label: 'Designers' },
    { id: 'management', label: 'Marketers & Strategy' },
    { id: 'languages', label: 'Languages' },
    { id: 'academics', label: 'Academics' },
  ];

  const trendingSkills = ['Rust', 'Figma', 'Next.js', 'LLM Fine-tuning', 'SEO', 'Python', 'Go'];

  const handleSearch = async (overrideTerm?: string, overrideCategory?: string) => {
    setIsLoading(true);
    try {
      const termToUse = overrideTerm !== undefined ? overrideTerm : searchTerm;
      const catToUse = overrideCategory !== undefined ? overrideCategory : selectedCategory;

      const params = new URLSearchParams();
      if (termToUse) params.append('search', termToUse);
      if (catToUse && catToUse !== 'all') params.append('category', catToUse);
      if (skillType) params.append('skillType', skillType);

      const response = await fetch(`/api/search/users?${params.toString()}`);
      if (response.ok) {
        const result = await response.json();
        const results = Array.isArray(result) ? result : result.data || [];
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [selectedCategory, skillType]);

  useEffect(() => {
    if (showExchangeModal && selectedPartner && session?.user?.email) {
      const fetchUserSkills = async () => {
        try {
          const response = await fetch('/api/user/profile');
          if (response.ok) {
            const result = await response.json();
            const user = result.data || result;
            setCurrentUserSkills(user.skillsToTeach || []);
          }
        } catch (error) {
          console.error('Error fetching user skills:', error);
        }
      };
      fetchUserSkills();
    }
  }, [showExchangeModal, selectedPartner, session]);

  const handleCategoryClick = (catId: string) => {
    setSelectedCategory(catId);
    handleSearch(searchTerm, catId);
  };

  const handleTrendingClick = (skill: string) => {
    setSearchTerm(skill);
    handleSearch(skill, selectedCategory);
  };

  const handleStartExchange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartner || !selectedOfferedSkill || !selectedRequestedSkill) {
      alert('Please select both your offered skill and their requested skill');
      return;
    }

    setIsSubmittingExchange(true);
    try {
      const response = await fetch('/api/exchanges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: selectedPartner._id,
          offeredSkillId: selectedOfferedSkill,
          requestedSkillId: selectedRequestedSkill,
          message: proposalMessage,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setExchangeSuccess(true);
        setTimeout(() => {
          setShowExchangeModal(false);
          setExchangeSuccess(false);
          setSelectedOfferedSkill('');
          setSelectedRequestedSkill('');
          setProposalMessage('');
          router.push('/exchanges');
        }, 1200);
      } else {
        alert(result.error || 'Failed to submit exchange proposal');
      }
    } catch (error) {
      console.error('Error creating exchange:', error);
      alert('Error creating exchange');
    } finally {
      setIsSubmittingExchange(false);
    }
  };

  // Calculate synthetic high-confidence match percentage for preview
  const getMatchScore = (index: number) => {
    const scores = [98, 94, 91, 88, 86, 84, 82];
    return scores[index % scores.length];
  };

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-8 py-8">
      {/* ─── Search & Category Filter Header ─── */}
      <div className="mb-8 space-y-4">
        {/* Large Rounded Search Input (Stitch Style) */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-primary transition-colors pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by name, skill, or role (e.g. React, UX Design, Python, Marketing)..."
            className="w-full h-14 pl-12 pr-28 bg-surface-container-lowest border border-outline-variant/60 rounded-2xl font-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm transition-all"
          />
          <button
            onClick={() => handleSearch()}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary-container text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
          >
            Search
          </button>
        </div>

        {/* Category Pills Row */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pb-1">
          <div className="flex items-center gap-2">
            {categoryPills.map((pill) => {
              const active = selectedCategory === pill.id;
              return (
                <button
                  key={pill.id}
                  onClick={() => handleCategoryClick(pill.id)}
                  className={`px-5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
                    active
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/40 hover:border-primary hover:text-primary'
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="lg:hidden flex items-center gap-1.5 px-3.5 py-2 bg-surface-container-lowest border border-outline-variant/40 rounded-full text-xs font-semibold text-on-surface-variant hover:text-primary"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* ─── 12-Column Grid (3 Filter Cols, 9 Results Cols) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Filter Sidebar */}
        <aside
          className={`lg:col-span-3 space-y-6 ${
            showMobileFilters ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* Main Filters Card */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 overflow-hidden shadow-card">
            <div className="p-4 border-b border-outline-variant/20 bg-surface-container-low flex justify-between items-center">
              <h3 className="font-display text-base font-bold text-on-surface">Filters</h3>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setExperienceLevel('all');
                  setAvailability('all');
                  setVerifiedOnly(false);
                  setSkillType('');
                  handleSearch('', 'all');
                }}
                className="text-xs text-primary hover:underline font-semibold"
              >
                Reset
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Experience Level */}
              <div>
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-outline block mb-2">
                  Experience Level
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full bg-surface border border-outline-variant/60 rounded-xl p-2.5 text-xs text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
                >
                  <option value="all">All Levels</option>
                  <option value="junior">Junior (1-3 yrs)</option>
                  <option value="senior">Senior (4-7 yrs)</option>
                  <option value="lead">Lead / Architect (8+ yrs)</option>
                </select>
              </div>

              <div className="h-px bg-outline-variant/20" />

              {/* Availability */}
              <div>
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-outline block mb-2">
                  Availability
                </label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="w-full bg-surface border border-outline-variant/60 rounded-xl p-2.5 text-xs text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
                >
                  <option value="all">Any Availability</option>
                  <option value="immediate">Immediate</option>
                  <option value="next_week">Next Week</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>

              <div className="h-px bg-outline-variant/20" />

              {/* Verification Toggle */}
              <div>
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/10">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold text-on-surface">Verified Only</span>
                  </div>
                  <button
                    onClick={() => setVerifiedOnly(!verifiedOnly)}
                    className={`w-11 h-6 rounded-full relative p-0.5 transition-colors duration-200 ${
                      verifiedOnly ? 'bg-primary' : 'bg-surface-container-high'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                        verifiedOnly ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Trending Skills Pills */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 shadow-card">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-outline mb-3">
              Trending Skills
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {trendingSkills.map((skill) => (
                <button
                  key={skill}
                  onClick={() => handleTrendingClick(skill)}
                  className="bg-surface-container-low hover:bg-primary hover:text-white text-on-surface-variant text-xs font-mono px-3 py-1.5 rounded-lg border border-outline-variant/30 transition-all active:scale-95"
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Main Results Section */}
        <section className="lg:col-span-9 min-w-0">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 animate-pulse space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-surface-container rounded-full" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-surface-container rounded w-1/2" />
                      <div className="h-3 bg-surface-container rounded w-1/3" />
                    </div>
                  </div>
                  <div className="h-10 bg-surface-container-low rounded-xl" />
                  <div className="h-10 bg-surface-container rounded-xl" />
                </div>
              ))}
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {searchResults.map((user, idx) => {
                const matchScore = getMatchScore(idx);
                const teachingSkills = user.skillsToTeach || [];
                const learningSkills = user.skillsToLearn || [];

                return (
                  <div
                    key={user._id}
                    className="kinetic-card rounded-2xl border border-outline-variant/30 p-6 flex flex-col justify-between relative group"
                  >
                    {/* Top Right: Match Score Ring Badge (Stitch Feature) */}
                    <div className="absolute top-0 right-0 p-3">
                      <div className="bg-primary/5 text-primary text-[11px] font-bold px-2.5 py-1.5 rounded-bl-xl rounded-tr-xl flex items-center gap-1.5 border border-primary/15 backdrop-blur-md">
                        {/* Circular progress SVG */}
                        <svg className="w-3.5 h-3.5 -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-primary/20"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-primary"
                            stroke="currentColor"
                            strokeWidth="4"
                            strokeDasharray={`${matchScore}, 100`}
                            strokeLinecap="round"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <span className="font-mono tracking-tight">{matchScore}% Match</span>
                      </div>
                    </div>

                    {/* Partner Header */}
                    <div className="flex items-start gap-4 mb-5">
                      <div className="w-14 h-14 rounded-full border-2 border-primary/20 overflow-hidden bg-primary/10 flex items-center justify-center font-bold text-primary text-base flex-shrink-0 shadow-sm">
                        {user.avatar || user.image ? (
                          <img
                            src={user.avatar || user.image}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{user.name?.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="min-w-0 pr-16">
                        <h4 className="font-display text-base font-bold text-on-surface truncate">
                          {user.name}
                        </h4>
                        <p className="text-xs text-on-surface-variant truncate">
                          {user.location || 'Verified Specialist'}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-on-surface">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span className="font-bold">
                            {(user.averageRating || 5.0).toFixed(1)}
                          </span>
                          <span className="text-[11px] text-outline ml-1 font-mono">
                            ({user.totalReviews || Math.floor(12 + idx * 7)} exchanges)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Top Skills & Seeking Sections (Stitch Layout) */}
                    <div className="space-y-4 mb-6 flex-1">
                      {/* Top Skills */}
                      <div>
                        <p className="text-[10px] uppercase font-mono font-bold tracking-wider text-outline mb-1.5">
                          Top Skills
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {teachingSkills.length > 0 ? (
                            teachingSkills.slice(0, 3).map((skill: any, i: number) => (
                              <span
                                key={i}
                                className="bg-tertiary-fixed text-on-tertiary-fixed-variant text-xs font-medium px-2.5 py-1 rounded-lg"
                              >
                                {typeof skill === 'object' ? skill.name : skill}
                              </span>
                            ))
                          ) : (
                            <span className="bg-tertiary-fixed text-on-tertiary-fixed-variant text-xs font-medium px-2.5 py-1 rounded-lg">
                              Fullstack Architecture
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Seeking */}
                      <div>
                        <p className="text-[10px] uppercase font-mono font-bold tracking-wider text-outline mb-1.5">
                          Seeking
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {learningSkills.length > 0 ? (
                            learningSkills.slice(0, 3).map((skill: any, i: number) => (
                              <span
                                key={i}
                                className="bg-surface-container-high text-on-surface-variant text-xs font-medium px-2.5 py-1 rounded-lg"
                              >
                                {typeof skill === 'object' ? skill.name : skill}
                              </span>
                            ))
                          ) : (
                            <span className="bg-surface-container-high text-on-surface-variant text-xs font-medium px-2.5 py-1 rounded-lg">
                              UI/UX & Design Systems
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Buttons (Stitch Layout) */}
                    <div className="flex items-center gap-2 pt-3 border-t border-outline-variant/20 mt-auto">
                      <button
                        onClick={() => router.push('/profile')}
                        className="flex-1 bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-semibold py-2.5 rounded-xl transition-all active:scale-95"
                      >
                        View Profile
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPartner(user);
                          setShowExchangeModal(true);
                        }}
                        className="flex-[1.4] bg-primary hover:bg-primary-container text-white text-xs font-semibold py-2.5 rounded-xl shadow-sm hover:shadow transition-all active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <Repeat className="w-3.5 h-3.5" />
                        <span>Propose Exchange</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-12 text-center shadow-card">
              <Search className="w-10 h-10 text-outline mx-auto mb-3" />
              <h3 className="text-base font-bold text-on-surface mb-1">No matching partners found</h3>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto mb-5">
                Try expanding your search query or clear your category filters to find available specialists.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  handleSearch('', 'all');
                }}
                className="btn-primary text-xs"
              >
                Clear Filters
              </button>
            </div>
          )}
        </section>
      </div>

      {/* ─── Propose Exchange Modal (Stitch Modal) ─── */}
      {showExchangeModal && selectedPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest rounded-3xl max-w-md w-full border border-outline-variant/40 shadow-2xl overflow-hidden p-6 relative">
            <button
              onClick={() => setShowExchangeModal(false)}
              className="absolute top-4 right-4 p-1.5 text-on-surface-variant hover:text-on-surface rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            {exchangeSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold font-display text-on-surface">Proposal Sent!</h3>
                <p className="text-xs text-on-surface-variant">
                  {selectedPartner.name} has been notified. Redirecting to your exchanges hub...
                </p>
              </div>
            ) : (
              <form onSubmit={handleStartExchange} className="space-y-5">
                <div>
                  <span className="text-[11px] font-mono font-bold text-primary uppercase tracking-wider block mb-1">
                    Kinetic Barter Agreement
                  </span>
                  <h3 className="text-xl font-bold font-display text-on-surface">
                    Propose Exchange with {selectedPartner.name}
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Select the reciprocal deliverables to initiate this partnership.
                  </p>
                </div>

                {/* What You Will Provide */}
                <div>
                  <label className="text-xs font-semibold text-on-surface block mb-1.5">
                    Your Offering (What you will teach / provide):
                  </label>
                  <select
                    value={selectedOfferedSkill}
                    onChange={(e) => setSelectedOfferedSkill(e.target.value)}
                    required
                    className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl p-3 text-xs text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  >
                    <option value="">Select your skill to offer...</option>
                    {currentUserSkills.length > 0 ? (
                      currentUserSkills.map((skill: any) => (
                        <option key={skill._id || skill.name} value={skill._id || skill.name}>
                          {skill.name} ({skill.level || 'Intermediate'})
                        </option>
                      ))
                    ) : (
                      <option value="General Consultation">My Registered Skills (Default Offering)</option>
                    )}
                  </select>
                </div>

                {/* What You Will Receive */}
                <div>
                  <label className="text-xs font-semibold text-on-surface block mb-1.5">
                    Their Offering (What you want to learn / receive):
                  </label>
                  <select
                    value={selectedRequestedSkill}
                    onChange={(e) => setSelectedRequestedSkill(e.target.value)}
                    required
                    className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl p-3 text-xs text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  >
                    <option value="">Select their skill...</option>
                    {(selectedPartner.skillsToTeach || []).map((skill: any) => (
                      <option key={skill._id || skill.name} value={skill._id || skill.name}>
                        {typeof skill === 'object' ? skill.name : skill}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Introduction note */}
                <div>
                  <label className="text-xs font-semibold text-on-surface block mb-1.5">
                    Introductory Note (Optional):
                  </label>
                  <textarea
                    rows={3}
                    value={proposalMessage}
                    onChange={(e) => setProposalMessage(e.target.value)}
                    placeholder="Describe your project, timeline, and how you envision collaborating..."
                    className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl p-3 text-xs text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/20">
                  <button
                    type="button"
                    onClick={() => setShowExchangeModal(false)}
                    className="btn-secondary text-xs py-2.5 px-4"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingExchange}
                    className="btn-primary text-xs py-2.5 px-5"
                  >
                    {isSubmittingExchange ? 'Sending Proposal...' : 'Send Exchange Proposal'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
