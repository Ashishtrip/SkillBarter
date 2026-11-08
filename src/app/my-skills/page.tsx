'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  GraduationCap,
  Plus,
  Trash2,
  Search,
  X,
  CheckCircle2,
  Sparkles,
  Award,
} from 'lucide-react';

interface Skill {
  _id: string;
  name: string;
  category: string;
  level: string;
  description?: string;
  tags?: string[];
}

const LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'];
const CATEGORIES = [
  'tech',
  'music',
  'languages',
  'academics',
  'management',
  'arts',
  'sports',
  'cooking',
  'crafts',
  'other',
];

export default function MySkillsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [teachSkills, setTeachSkills] = useState<Skill[]>([]);
  const [learnSkills, setLearnSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'teach' | 'learn'>('teach');

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('tech');
  const [formLevel, setFormLevel] = useState('intermediate');
  const [formDescription, setFormDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMySkills = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        const user = data.data ?? data;
        setTeachSkills(Array.isArray(user.skillsToTeach) ? user.skillsToTeach : []);
        setLearnSkills(Array.isArray(user.skillsToLearn) ? user.skillsToLearn : []);
      }
    } catch {
      // silently ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
    if (session) fetchMySkills();
  }, [session, status, router, fetchMySkills]);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setError('Skill name is required');
      return;
    }
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName.trim(),
          category: formCategory,
          level: formLevel,
          description: formDescription.trim(),
          type: activeTab,
        }),
      });

      if (res.ok) {
        setSuccess('Skill registered to your portfolio!');
        setFormName('');
        setFormDescription('');
        setShowForm(false);
        fetchMySkills();
      } else {
        const data = await res.json();
        setError(data.error ?? 'Failed to add skill');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveSkill = async (skillId: string) => {
    try {
      const res = await fetch(`/api/skills?id=${skillId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchMySkills();
      }
    } catch {
      // ignore
    }
  };

  const filtered = (skills: Skill[]) =>
    searchTerm.trim()
      ? skills.filter(
          (s) =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.category.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : skills;

  const displaySkills = filtered(activeTab === 'teach' ? teachSkills : learnSkills);

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-xs text-outline font-mono">Loading skills portfolio...</p>
      </div>
    );
  }

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-8 py-8 space-y-8">
      {/* ─── Page Header (Stitch Kinetic Style) ─── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-outline-variant/20 pb-6">
        <div>
          <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider block mb-1">
            Expertise Inventory
          </span>
          <h1 className="text-headline-lg font-headline-lg font-bold text-on-surface tracking-tight">
            My Skills & Offerings
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Manage your verified teaching specialties and target skills you want to learn.
          </p>
        </div>

        <button
          onClick={() => {
            setShowForm(!showForm);
            setError('');
            setSuccess('');
          }}
          className="btn-primary text-xs py-2.5 px-4"
        >
          <Plus className="w-4 h-4" />
          <span>Add Skill</span>
        </button>
      </div>

      {/* Success Banner */}
      {success && (
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs px-4 py-3 rounded-xl animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="ml-auto text-emerald-700 hover:text-emerald-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ─── Modal / Form for Adding Skill ─── */}
      {showForm && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 p-6 shadow-xl space-y-5 animate-in fade-in duration-200">
          <div className="flex justify-between items-center border-b border-outline-variant/20 pb-3">
            <div>
              <h3 className="font-display font-bold text-base text-on-surface">
                Add Skill to {activeTab === 'teach' ? 'Teach' : 'Learn'}
              </h3>
              <p className="text-xs text-on-surface-variant">
                Detail your proficiency or target learning goals.
              </p>
            </div>
            <button
              onClick={() => setShowForm(false)}
              className="p-1.5 text-on-surface-variant hover:text-on-surface rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleAddSkill} className="space-y-4">
            {error && (
              <p className="text-xs text-error bg-error/10 p-3 rounded-xl border border-error/20">
                {error}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-on-surface block mb-1.5">
                  Skill Title
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Next.js 14 App Router, Figma Design Systems..."
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-on-surface block mb-1.5">
                  Category
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="input-field"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-on-surface block mb-1.5">
                Proficiency Level
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {LEVELS.map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setFormLevel(lvl)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize border transition-all ${
                      formLevel === lvl
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-surface-container-low text-on-surface border-outline-variant/30 hover:border-primary'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-on-surface block mb-1.5">
                Description & Deliverables (Optional)
              </label>
              <textarea
                rows={3}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Briefly describe what you will build, teach, or what topics you want to master..."
                className="input-field"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="btn-primary text-xs">
                {isSubmitting ? 'Saving...' : 'Add to Inventory'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── Tabs & Search Filter ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Tab Pills */}
        <div className="flex gap-1 bg-surface-container-low p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('teach')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'teach'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span>Skills I Teach</span>
            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center font-mono">
              {teachSkills.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('learn')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'learn'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span>Skills I Want to Learn</span>
            <span className="w-5 h-5 rounded-full bg-tertiary/10 text-tertiary text-[10px] flex items-center justify-center font-mono">
              {learnSkills.length}
            </span>
          </button>
        </div>

        {/* Filter Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter skills..."
            className="input-field pl-8 py-2 text-xs"
          />
        </div>
      </div>

      {/* ─── Skills Grid ─── */}
      {displaySkills.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displaySkills.map((skill) => (
            <div
              key={skill._id || skill.name}
              className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-outline bg-surface-container-low px-2 py-0.5 rounded">
                    {skill.category}
                  </span>
                  <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 capitalize">
                    {skill.level}
                  </span>
                </div>

                <h3 className="font-display font-bold text-base text-on-surface mb-2">
                  {skill.name}
                </h3>
                {skill.description && (
                  <p className="text-xs text-on-surface-variant line-clamp-3 leading-relaxed mb-4">
                    {skill.description}
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-outline-variant/20 mt-4">
                <span className="text-[11px] text-outline font-mono">
                  {activeTab === 'teach' ? 'Offered for Barter' : 'Target Goal'}
                </span>
                <button
                  onClick={() => handleRemoveSkill(skill._id)}
                  className="p-1.5 text-outline hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                  title="Remove Skill"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-12 text-center shadow-card max-w-md mx-auto">
          <BookOpen className="w-10 h-10 text-outline mx-auto mb-3" />
          <h3 className="text-base font-bold text-on-surface mb-1">
            No {activeTab === 'teach' ? 'teaching' : 'learning'} skills found
          </h3>
          <p className="text-xs text-on-surface-variant mb-5">
            Add skills to your profile to match with suitable collaborators.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary text-xs"
          >
            Add Your First Skill
          </button>
        </div>
      )}
    </div>
  );
}
