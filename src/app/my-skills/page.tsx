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
  Star,
  Zap,
  ChevronDown,
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
const CATEGORIES = ['tech', 'music', 'languages', 'academics', 'management', 'arts', 'sports', 'cooking', 'crafts', 'other'];

const levelColor: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-blue-100 text-blue-700',
  advanced: 'bg-orange-100 text-orange-700',
  expert: 'bg-purple-100 text-purple-700',
};

export default function MySkillsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [teachSkills, setTeachSkills] = useState<Skill[]>([]);
  const [learnSkills, setLearnSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'teach' | 'learn'>('teach');

  // Add-skill form state
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('tech');
  const [formLevel, setFormLevel] = useState('beginner');
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
    if (!formName.trim()) { setError('Skill name is required'); return; }
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
        setSuccess('Skill added successfully!');
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
      // silently ignore
    }
  };

  const filtered = (skills: Skill[]) =>
    searchTerm.trim()
      ? skills.filter(s =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.category.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : skills;

  const displaySkills = filtered(activeTab === 'teach' ? teachSkills : learnSkills);

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 bg-primary-600 rounded-full animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="section-card overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-heading font-bold text-white mb-1">
              My Skills
            </h1>
            <p className="text-sm text-primary-200">
              Manage the skills you teach and want to learn
            </p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setError(''); setSuccess(''); }}
            className="inline-flex items-center bg-white/15 hover:bg-white/25 text-white font-semibold py-2.5 px-5 rounded-full text-sm transition-all backdrop-blur-sm self-start"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Skill
          </button>
        </div>
      </div>

      {/* Success / Error banners */}
      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded-lg">
          <Star className="w-4 h-4 flex-shrink-0" />
          {success}
          <button onClick={() => setSuccess('')} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Add Skill Form */}
      {showForm && (
        <div className="section-card">
          <div className="section-card-header">
            <h2 className="text-base font-heading font-semibold text-secondary-900">
              Add a New Skill to {activeTab === 'teach' ? 'Teach' : 'Learn'}
            </h2>
            <button onClick={() => setShowForm(false)} className="text-secondary-400 hover:text-secondary-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleAddSkill} className="section-card-body space-y-4">
            {error && (
              <p className="text-sm text-error-500 bg-error-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            {/* Tab toggle inside form */}
            <div className="flex bg-secondary-100 rounded-lg p-1 gap-1 w-fit">
              {(['teach', 'learn'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    activeTab === tab
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-secondary-500 hover:text-secondary-700'
                  }`}
                >
                  {tab === 'teach' ? '🎓 I can teach' : '📚 I want to learn'}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Skill Name <span className="text-error-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g., Python, Guitar, Spanish..."
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Category</label>
                <div className="relative">
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="input-field w-full appearance-none pr-8"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Level</label>
                <div className="flex gap-2 flex-wrap">
                  {LEVELS.map(l => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setFormLevel(l)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                        formLevel === l
                          ? `${levelColor[l]} border-transparent`
                          : 'border-secondary-200 text-secondary-500 hover:border-secondary-300'
                      }`}
                    >
                      {l.charAt(0).toUpperCase() + l.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Description <span className="text-secondary-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="Brief description..."
                  className="input-field w-full"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary flex items-center gap-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {isSubmitting ? 'Adding...' : 'Add Skill'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="stat-card border-l-4 border-l-primary-600">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-primary-600" />
            </div>
          </div>
          <p className="text-2xl font-heading font-bold text-secondary-900">{teachSkills.length}</p>
          <p className="text-[11px] text-secondary-400 mt-1 font-semibold uppercase tracking-wide">Skills to Teach</p>
        </div>
        <div className="stat-card border-l-4 border-l-accent-500">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-accent-50 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-accent-500" />
            </div>
          </div>
          <p className="text-2xl font-heading font-bold text-secondary-900">{learnSkills.length}</p>
          <p className="text-[11px] text-secondary-400 mt-1 font-semibold uppercase tracking-wide">Skills to Learn</p>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="section-card">
        <div className="section-card-header flex-col sm:flex-row gap-3">
          <div className="flex bg-secondary-100 rounded-lg p-1 gap-1">
            <button
              onClick={() => setActiveTab('teach')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'teach'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-secondary-500 hover:text-secondary-700'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Teaching
              <span className="text-xs bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded-full font-bold">
                {teachSkills.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('learn')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'learn'
                  ? 'bg-white text-accent-600 shadow-sm'
                  : 'text-secondary-500 hover:text-secondary-700'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Learning
              <span className="text-xs bg-accent-100 text-accent-700 px-1.5 py-0.5 rounded-full font-bold">
                {learnSkills.length}
              </span>
            </button>
          </div>

          <div className="relative sm:ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input
              type="text"
              placeholder="Search skills..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="input-field pl-9 text-sm w-full sm:w-56"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5 text-secondary-400" />
              </button>
            )}
          </div>
        </div>

        {/* Skills List */}
        <div className="divide-y divide-secondary-200/60">
          {displaySkills.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="w-14 h-14 bg-secondary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                {activeTab === 'teach'
                  ? <GraduationCap className="w-6 h-6 text-secondary-300" />
                  : <BookOpen className="w-6 h-6 text-secondary-300" />
                }
              </div>
              <h3 className="text-base font-heading font-semibold text-secondary-900 mb-1">
                {searchTerm ? 'No matching skills' : `No ${activeTab === 'teach' ? 'teaching' : 'learning'} skills yet`}
              </h3>
              <p className="text-sm text-secondary-400 mb-4">
                {searchTerm
                  ? 'Try a different search term'
                  : `Add skills you ${activeTab === 'teach' ? 'can teach others' : 'want to learn'}`
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => { setActiveTab(activeTab); setShowForm(true); }}
                  className="btn-primary text-sm"
                >
                  <Plus className="w-4 h-4 mr-1.5 inline" />
                  Add Your First Skill
                </button>
              )}
            </div>
          ) : (
            displaySkills.map(skill => (
              <div
                key={skill._id}
                className="flex items-center justify-between px-5 sm:px-6 py-4 hover:bg-secondary-50/50 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    activeTab === 'teach' ? 'bg-primary-50' : 'bg-accent-50'
                  }`}>
                    <Zap className={`w-4 h-4 ${activeTab === 'teach' ? 'text-primary-600' : 'text-accent-500'}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-secondary-900 truncate">{skill.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-secondary-400 capitalize">{skill.category}</span>
                      {skill.level && (
                        <>
                          <span className="text-secondary-300">·</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${levelColor[skill.level] ?? 'bg-secondary-100 text-secondary-600'}`}>
                            {skill.level}
                          </span>
                        </>
                      )}
                    </div>
                    {skill.description && (
                      <p className="text-xs text-secondary-400 mt-0.5 truncate max-w-xs">{skill.description}</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveSkill(skill._id)}
                  className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-error-400 hover:bg-error-50 hover:text-error-500 transition-all flex-shrink-0"
                  title="Remove skill"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
