'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  User, Mail, MapPin, BookOpen, GraduationCap, Edit3, Plus, 
  ShieldCheck, X, Trash2, Code, Briefcase, Award, ExternalLink, 
  Star, CheckCircle2, Share2, Sparkles, FolderGit2
} from 'lucide-react';
import { User as UserType } from '@/types';

const CATEGORIES = ['tech', 'music', 'languages', 'academics', 'management', 'arts', 'sports', 'cooking', 'crafts', 'other'];
const LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'];

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'portfolio' | 'history'>('overview');
  
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [showAddCertificateModal, setShowAddCertificateModal] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddEducationModal, setShowAddEducationModal] = useState(false);
  const [showAddWorkModal, setShowAddWorkModal] = useState(false);
  
  const [skillType, setSkillType] = useState<'teach' | 'learn'>('teach');
  
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    location: '',
    githubProfile: '',
    linkedinProfile: '',
  });

  const [skillForm, setSkillForm] = useState({
    name: '',
    category: CATEGORIES[0],
    level: LEVELS[0],
    description: '',
  });

  const [certificateForm, setCertificateForm] = useState({
    title: '',
    url: '',
    issuer: '',
    dateObtained: '',
  });

  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    url: '',
    techStack: '',
  });

  const [educationForm, setEducationForm] = useState({
    school: '',
    degree: '',
    fieldOfStudy: '',
    startYear: new Date().getFullYear().toString(),
    endYear: new Date().getFullYear().toString(),
  });

  const [workForm, setWorkForm] = useState({
    jobTitle: '',
    company: '',
    description: '',
    startYear: new Date().getFullYear().toString(),
    endYear: new Date().getFullYear().toString(),
    currentlyWorking: false,
  });

  const [isSubmittingSkill, setIsSubmittingSkill] = useState(false);
  const [isSubmittingCertificate, setIsSubmittingCertificate] = useState(false);
  const [isSubmittingProject, setIsSubmittingProject] = useState(false);
  const [isSubmittingEducation, setIsSubmittingEducation] = useState(false);
  const [isSubmittingWork, setIsSubmittingWork] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session) {
      fetchUserProfile();
    }
  }, [session, status, router]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const result = await response.json();
        const userData = result.data || result;
        setUser(userData);
        setEditForm({
          name: userData.name || '',
          bio: userData.bio || '',
          location: userData.location || '',
          githubProfile: userData.githubProfile || '',
          linkedinProfile: userData.linkedinProfile || '',
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const result = await response.json();
        const updatedUser = result.data || result;
        setUser(updatedUser);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillForm.name.trim()) return;

    setIsSubmittingSkill(true);
    try {
      const response = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: skillForm.name,
          category: skillForm.category,
          level: skillForm.level,
          description: skillForm.description,
          tags: [],
          type: skillType,
        }),
      });

      if (response.ok) {
        await fetchUserProfile();
        setShowAddSkillModal(false);
        setSkillForm({
          name: '',
          category: CATEGORIES[0],
          level: LEVELS[0],
          description: '',
        });
      }
    } catch (error) {
      console.error('Error adding skill:', error);
    } finally {
      setIsSubmittingSkill(false);
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    if (!confirm('Are you sure you want to remove this skill?')) return;

    try {
      const response = await fetch(`/api/skills?id=${skillId}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchUserProfile();
      }
    } catch (error) {
      console.error('Error deleting skill:', error);
    }
  };

  const handleAddCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certificateForm.title.trim()) return;

    setIsSubmittingCertificate(true);
    try {
      const response = await fetch('/api/user/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(certificateForm),
      });

      if (response.ok) {
        await fetchUserProfile();
        setShowAddCertificateModal(false);
        setCertificateForm({
          title: '',
          url: '',
          issuer: '',
          dateObtained: '',
        });
      }
    } catch (error) {
      console.error('Error adding certificate:', error);
    } finally {
      setIsSubmittingCertificate(false);
    }
  };

  const handleDeleteCertificate = async (index: number) => {
    if (!confirm('Are you sure you want to remove this certificate?')) return;

    try {
      const response = await fetch(`/api/user/certificates?index=${index}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchUserProfile();
      }
    } catch (error) {
      console.error('Error deleting certificate:', error);
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.title.trim()) return;

    setIsSubmittingProject(true);
    try {
      const response = await fetch('/api/user/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: projectForm.title,
          description: projectForm.description,
          url: projectForm.url,
          techStack: projectForm.techStack.split(',').map(t => t.trim()).filter(Boolean),
        }),
      });

      if (response.ok) {
        await fetchUserProfile();
        setShowAddProjectModal(false);
        setProjectForm({
          title: '',
          description: '',
          url: '',
          techStack: '',
        });
      }
    } catch (error) {
      console.error('Error adding project:', error);
    } finally {
      setIsSubmittingProject(false);
    }
  };

  const handleDeleteProject = async (index: number) => {
    if (!confirm('Are you sure you want to remove this project?')) return;

    try {
      const response = await fetch(`/api/user/projects?index=${index}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchUserProfile();
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleAddEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!educationForm.school.trim() || !educationForm.degree.trim()) return;

    setIsSubmittingEducation(true);
    try {
      const response = await fetch('/api/user/education', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(educationForm),
      });

      if (response.ok) {
        await fetchUserProfile();
        setShowAddEducationModal(false);
        setEducationForm({
          school: '',
          degree: '',
          fieldOfStudy: '',
          startYear: new Date().getFullYear().toString(),
          endYear: new Date().getFullYear().toString(),
        });
      }
    } catch (error) {
      console.error('Error adding education:', error);
    } finally {
      setIsSubmittingEducation(false);
    }
  };

  const handleDeleteEducation = async (index: number) => {
    if (!confirm('Are you sure you want to remove this education entry?')) return;

    try {
      const response = await fetch(`/api/user/education?index=${index}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchUserProfile();
      }
    } catch (error) {
      console.error('Error deleting education:', error);
    }
  };

  const handleAddWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workForm.jobTitle.trim() || !workForm.company.trim()) return;

    setIsSubmittingWork(true);
    try {
      const response = await fetch('/api/user/work-experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workForm),
      });

      if (response.ok) {
        await fetchUserProfile();
        setShowAddWorkModal(false);
        setWorkForm({
          jobTitle: '',
          company: '',
          description: '',
          startYear: new Date().getFullYear().toString(),
          endYear: new Date().getFullYear().toString(),
          currentlyWorking: false,
        });
      }
    } catch (error) {
      console.error('Error adding work experience:', error);
    } finally {
      setIsSubmittingWork(false);
    }
  };

  const handleDeleteWork = async (index: number) => {
    if (!confirm('Are you sure you want to remove this work experience entry?')) return;

    try {
      const response = await fetch(`/api/user/work-experience?index=${index}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchUserProfile();
      }
    } catch (error) {
      console.error('Error deleting work experience:', error);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-secondary text-sm font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-error-container/40 text-error flex items-center justify-center mx-auto mb-4">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-on-surface mb-2">Profile not found</h2>
          <p className="text-secondary text-sm mb-6">There was an issue loading your profile details. Please sign in again.</p>
          <button onClick={() => router.push('/auth/signin')} className="btn-primary w-full">
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  const completedCount = user.totalReviews || (user.skillsToTeach?.length ? user.skillsToTeach.length + 1 : 4);
  const userRating = user.averageRating ? user.averageRating.toFixed(1) : '5.0';

  return (
    <div className="min-h-screen bg-background text-on-background antialiased py-8">
      <main className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Profile Hero Card */}
        <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm p-6 sm:p-8 relative overflow-hidden transition-all duration-200">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            
            {/* Avatar & Verified Badge */}
            <div className="relative shrink-0 mx-auto md:mx-0">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-surface-container overflow-hidden border-4 border-surface-container-lowest shadow-md flex items-center justify-center">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center text-3xl sm:text-4xl font-bold font-display">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <div className="absolute inset-0 rounded-full border border-primary/20 scale-105 pointer-events-none" />
              {user.identityVerified && (
                <div className="absolute bottom-1 right-1 bg-surface-container-lowest rounded-full p-1 border border-outline-variant/30 shadow-sm z-20" title="Identity Verified">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-50" />
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-grow w-full flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-on-surface tracking-tight">
                      {user.name}
                    </h1>
                    {user.identityVerified && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified Member
                      </span>
                    )}
                  </div>
                  <p className="text-secondary font-medium text-base sm:text-lg mt-1">
                    {user.skillsToTeach?.[0]?.name ? `${user.skillsToTeach[0].name} Specialist` : 'Peer Exchange Participant'}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-secondary text-sm">
                    {user.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span>{user.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-secondary/70" />
                      <span className="truncate max-w-[200px] sm:max-w-none">{user.email}</span>
                    </div>
                  </div>
                </div>

                {/* Top Action Buttons */}
                <div className="flex items-center gap-2.5 self-start">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="btn-primary text-sm px-4 py-2 flex items-center gap-2 shadow-sm"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>{isEditing ? 'Close Editor' : 'Edit Profile'}</span>
                  </button>
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: user.name, url: window.location.href });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Profile link copied to clipboard!');
                      }
                    }}
                    className="p-2 border border-outline-variant/40 rounded-xl hover:bg-surface-container transition-colors text-secondary"
                    title="Share Profile"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Bio */}
              <p className="text-on-surface-variant text-sm sm:text-base leading-relaxed mt-2 max-w-3xl">
                {user.bio || 'Welcome to my Skill Barter profile! I am active in exchanging specialized industry knowledge, creative design, and programming techniques.'}
              </p>

              {/* Social Profiles */}
              {(user.githubProfile || user.linkedinProfile) && (
                <div className="flex items-center gap-2.5 pt-2 flex-wrap">
                  {user.githubProfile && (
                    <a
                      href={user.githubProfile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/30 hover:border-outline text-xs font-semibold text-on-surface hover:bg-surface-container transition-all"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                      </svg>
                      GitHub Profile
                      <ExternalLink className="w-3 h-3 text-secondary" />
                    </a>
                  )}
                  {user.linkedinProfile && (
                    <a
                      href={user.linkedinProfile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/30 hover:border-outline text-xs font-semibold text-on-surface hover:bg-surface-container transition-all"
                    >
                      <svg className="w-3.5 h-3.5 fill-[#0A66C2]" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.728-2.004 1.431-.103.25-.129.599-.129.949v5.425h-3.554s.047-8.789 0-9.692h3.554v1.371c.425-.654 1.185-1.586 2.882-1.586 2.105 0 3.685 1.375 3.685 4.331v5.576zM5.337 8.855c-1.144 0-1.915-.758-1.915-1.706 0-.955.768-1.703 1.959-1.703 1.188 0 1.913.748 1.932 1.703 0 .948-.744 1.706-1.976 1.706zm1.581 11.597H3.715V9.505h3.203v10.947zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>
                      </svg>
                      LinkedIn Profile
                      <ExternalLink className="w-3 h-3 text-secondary" />
                    </a>
                  )}
                </div>
              )}

              {/* Stats Counters */}
              <div className="flex gap-8 sm:gap-12 mt-4 pt-4 border-t border-outline-variant/20 flex-wrap">
                <div className="flex flex-col">
                  <span className="font-display text-2xl font-bold text-on-surface">{completedCount}</span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Exchanges</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="font-display text-2xl font-bold text-on-surface">{userRating}</span>
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Rating</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-display text-2xl font-bold text-on-surface">100%</span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Response Rate</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-display text-2xl font-bold text-primary">Active</span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Availability</span>
                </div>
              </div>

            </div>
          </div>

          {/* Edit Profile Form Inline Accordion */}
          {isEditing && (
            <div className="mt-8 pt-6 border-t border-outline-variant/30 animate-in fade-in slide-in-from-top-2 duration-200">
              <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-primary" />
                Update Profile Information
              </h2>
              <form onSubmit={handleEditSubmit} className="space-y-5 max-w-3xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm outline-none transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                      Location
                    </label>
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      placeholder="e.g. San Francisco, CA (Remote)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                    Bio / Professional Summary
                  </label>
                  <textarea
                    rows={3}
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    maxLength={500}
                    placeholder="Tell exchange partners about your domain experience and what you hope to learn..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm outline-none transition-all"
                  />
                  <p className="text-xs text-secondary mt-1">{editForm.bio.length}/500 characters</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                      GitHub URL
                    </label>
                    <input
                      type="url"
                      value={editForm.githubProfile}
                      onChange={(e) => setEditForm({ ...editForm, githubProfile: e.target.value })}
                      placeholder="https://github.com/username"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      value={editForm.linkedinProfile}
                      onChange={(e) => setEditForm({ ...editForm, linkedinProfile: e.target.value })}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button type="submit" className="btn-primary text-sm px-5 py-2.5">
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn-outline text-sm px-4 py-2.5"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </section>

        {/* 12-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Left Column: Skills & Portfolio (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Skills Section (Bento Style) */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Skills Offered (Teach) */}
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <h2 className="font-display text-lg font-bold text-on-surface">Skills I Offer</h2>
                    </div>
                    <button
                      onClick={() => {
                        setSkillType('teach');
                        setShowAddSkillModal(true);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-container transition-colors py-1 px-2.5 rounded-lg border border-primary/20 hover:bg-primary/5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Skill
                    </button>
                  </div>

                  <p className="text-secondary text-xs mb-4">Domains you are experienced in and ready to teach or deliver in exchange.</p>

                  <div className="flex flex-wrap gap-2">
                    {user.skillsToTeach && user.skillsToTeach.length > 0 ? (
                      user.skillsToTeach.map((skill: any) => (
                        <div
                          key={skill._id}
                          className="group inline-flex items-center gap-1.5 bg-primary/10 text-primary hover:bg-primary/15 font-semibold text-xs px-3 py-1.5 rounded-full border border-primary/20 transition-all"
                        >
                          <span>{skill.name}</span>
                          <span className="text-[10px] text-primary/70 font-mono">({skill.level})</span>
                          <button
                            onClick={() => handleDeleteSkill(skill._id)}
                            className="opacity-0 group-hover:opacity-100 hover:text-error transition-opacity ml-0.5"
                            title="Remove skill"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-secondary/60 text-xs italic py-2">No teaching skills listed yet. Add what you are good at!</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Skills Wanted (Learn) */}
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <h2 className="font-display text-lg font-bold text-on-surface">Seeking to Learn</h2>
                    </div>
                    <button
                      onClick={() => {
                        setSkillType('learn');
                        setShowAddSkillModal(true);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-tertiary hover:text-tertiary-container transition-colors py-1 px-2.5 rounded-lg border border-tertiary/20 hover:bg-tertiary/5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Goal
                    </button>
                  </div>

                  <p className="text-secondary text-xs mb-4">Skills and techniques you want to acquire from community mentors.</p>

                  <div className="flex flex-wrap gap-2">
                    {user.skillsToLearn && user.skillsToLearn.length > 0 ? (
                      user.skillsToLearn.map((skill: any) => (
                        <div
                          key={skill._id}
                          className="group inline-flex items-center gap-1.5 bg-tertiary/10 text-tertiary hover:bg-tertiary/15 font-semibold text-xs px-3 py-1.5 rounded-full border border-tertiary/20 transition-all"
                        >
                          <span>{skill.name}</span>
                          <span className="text-[10px] text-tertiary/70 font-mono">({skill.level})</span>
                          <button
                            onClick={() => handleDeleteSkill(skill._id)}
                            className="opacity-0 group-hover:opacity-100 hover:text-error transition-opacity ml-0.5"
                            title="Remove goal"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-secondary/60 text-xs italic py-2">No learning goals listed yet. Add what you wish to master!</p>
                    )}
                  </div>
                </div>
              </div>

            </section>

            {/* Portfolio Highlights & Projects */}
            <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm p-6 sm:p-8">
              <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <FolderGit2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold text-on-surface">Portfolio & Deliverables</h2>
                    <p className="text-xs text-secondary">Verified work samples and outcomes from past projects & exchanges</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddProjectModal(true)}
                  className="btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Project</span>
                </button>
              </div>

              {user.projects && user.projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {user.projects.map((project: any, index: number) => (
                    <div 
                      key={index}
                      className="group rounded-xl border border-outline-variant/30 bg-surface-container-low/40 p-5 flex flex-col justify-between hover:border-primary/40 hover:shadow-md transition-all duration-200"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-display font-bold text-base text-on-surface group-hover:text-primary transition-colors">
                            {project.title}
                          </h3>
                          <button
                            onClick={() => handleDeleteProject(index)}
                            className="opacity-0 group-hover:opacity-100 text-secondary hover:text-error transition-all p-1"
                            title="Remove project"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {project.description && (
                          <p className="text-secondary text-xs sm:text-sm line-clamp-3 mb-4 leading-relaxed">
                            {project.description}
                          </p>
                        )}

                        {project.techStack && project.techStack.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {project.techStack.map((tech: string, idx: number) => (
                              <span 
                                key={idx} 
                                className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-surface-container text-secondary font-medium"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {project.url && (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline mt-2 pt-2 border-t border-outline-variant/20"
                        >
                          <span>Explore Project Artifact</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center rounded-xl border border-dashed border-outline-variant/50">
                  <FolderGit2 className="w-10 h-10 text-secondary/40 mx-auto mb-3" />
                  <p className="font-semibold text-sm text-on-surface">No portfolio items added yet</p>
                  <p className="text-secondary text-xs mt-1 mb-4">Showcase past work, GitHub repositories, or Figma design deliverables.</p>
                  <button 
                    onClick={() => setShowAddProjectModal(true)}
                    className="btn-outline text-xs px-4 py-2 inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Upload Deliverable
                  </button>
                </div>
              )}
            </section>

            {/* Certifications & Credentials */}
            <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm p-6 sm:p-8">
              <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold text-on-surface">Certifications & Credentials</h2>
                    <p className="text-xs text-secondary">Verified certifications and professional course completions</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddCertificateModal(true)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-secondary hover:text-on-surface py-1.5 px-3 rounded-lg border border-outline-variant/40 hover:bg-surface-container transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Certificate
                </button>
              </div>

              {user.certificates && user.certificates.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.certificates.map((cert: any, index: number) => (
                    <div 
                      key={index} 
                      className="group p-4 rounded-xl border border-outline-variant/30 bg-surface-container-lowest hover:border-outline-variant flex items-start justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <h4 className="font-display font-semibold text-sm text-on-surface truncate">{cert.title}</h4>
                        </div>
                        {cert.issuer && (
                          <p className="text-xs text-secondary mt-1">Issued by <span className="font-medium text-on-surface">{cert.issuer}</span></p>
                        )}
                        {cert.dateObtained && (
                          <p className="text-[11px] text-secondary/80 mt-0.5">
                            Acquired {new Date(cert.dateObtained).toLocaleDateString()}
                          </p>
                        )}
                        {cert.url && (
                          <a 
                            href={cert.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                          >
                            <span>Verify credential</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteCertificate(index)}
                        className="opacity-0 group-hover:opacity-100 text-secondary hover:text-error transition-opacity ml-2"
                        title="Remove credential"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-secondary text-xs italic py-2">No certificates registered yet.</p>
              )}
            </section>

          </div>

          {/* Right Column: Experience, Education & Reviews (4 cols) */}
          <aside className="lg:col-span-4 space-y-8">
            
            {/* Professional Background Timeline */}
            <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm p-6">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-5">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" />
                  <h3 className="font-display font-bold text-base text-on-surface">Experience & Career</h3>
                </div>
                <button
                  onClick={() => setShowAddWorkModal(true)}
                  className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>

              {user.workExperience && user.workExperience.length > 0 ? (
                <div className="relative pl-5 border-l-2 border-surface-variant space-y-6 my-2">
                  {user.workExperience.map((work: any, index: number) => (
                    <div key={index} className="relative group">
                      <div className="absolute -left-[27px] top-1 bg-surface-container-lowest border-2 border-primary rounded-full w-3.5 h-3.5" />
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-on-surface">{work.jobTitle}</h4>
                          <p className="text-xs text-primary font-medium">{work.company} • {work.startYear} - {work.currentlyWorking ? 'Present' : work.endYear}</p>
                          {work.description && (
                            <p className="text-xs text-secondary mt-1.5 leading-relaxed">{work.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteWork(index)}
                          className="opacity-0 group-hover:opacity-100 text-secondary hover:text-error transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-secondary text-xs italic mb-4">No work positions listed.</p>
              )}

              {/* Education section inside background */}
              <div className="mt-8 pt-5 border-t border-outline-variant/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-secondary" />
                    <h4 className="font-display font-bold text-sm text-on-surface">Education</h4>
                  </div>
                  <button
                    onClick={() => setShowAddEducationModal(true)}
                    className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>

                {user.education && user.education.length > 0 ? (
                  <div className="space-y-4">
                    {user.education.map((edu: any, index: number) => (
                      <div key={index} className="group p-3 rounded-xl bg-surface-container-low/50 border border-outline-variant/20 flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-xs text-on-surface">{edu.degree}</p>
                          <p className="text-xs text-secondary">{edu.school} {edu.fieldOfStudy ? `• ${edu.fieldOfStudy}` : ''}</p>
                          <p className="text-[11px] text-secondary/70 mt-0.5">{edu.startYear} - {edu.endYear}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteEducation(index)}
                          className="opacity-0 group-hover:opacity-100 text-secondary hover:text-error transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-secondary text-xs italic">No education history recorded.</p>
                )}
              </div>
            </section>

            {/* Testimonials & Community Feedback */}
            <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm p-6">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-4">
                <h3 className="font-display font-bold text-base text-on-surface flex items-center gap-2">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  Recent Reviews
                </h3>
                <span className="text-xs text-secondary font-medium">5.0 (All positive)</span>
              </div>

              <div className="space-y-3.5">
                <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-[11px] text-primary font-medium">Recent</span>
                  </div>
                  <p className="text-xs text-on-surface-variant italic leading-relaxed">
                    "Exceptional exchange partner! Clear milestones, responsive communication, and delivered stellar insights into system design."
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center">
                      S
                    </div>
                    <span className="text-[11px] font-semibold text-on-surface">Sarah Chen • UI/UX Design System</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-container-low/60 border border-outline-variant/20">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-[11px] text-secondary">2 weeks ago</span>
                  </div>
                  <p className="text-xs text-on-surface-variant italic leading-relaxed">
                    "Super patient mentor and quick learner. We traded React performance tips for advanced Figma auto-layout tutorials."
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-secondary/20 text-secondary text-[10px] font-bold flex items-center justify-center">
                      M
                    </div>
                    <span className="text-[11px] font-semibold text-on-surface">Marcus Vance • Frontend Architect</span>
                  </div>
                </div>
              </div>
            </section>

          </aside>
        </div>

      </main>

      {/* Add Skill Modal */}
      {showAddSkillModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-outline-variant/20">
              <h2 className="font-display font-bold text-lg text-on-surface">
                Add {skillType === 'teach' ? 'Skill to Offer' : 'Skill to Learn'}
              </h2>
              <button
                onClick={() => setShowAddSkillModal(false)}
                className="p-1.5 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddSkill} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                  Skill Name *
                </label>
                <input
                  type="text"
                  value={skillForm.name}
                  onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                  placeholder="e.g. Next.js, Product Design, Blender"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={skillForm.category}
                    onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-sm outline-none capitalize"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                    Proficiency
                  </label>
                  <select
                    value={skillForm.level}
                    onChange={(e) => setSkillForm({ ...skillForm, level: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-sm outline-none capitalize"
                  >
                    {LEVELS.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                  Description (optional)
                </label>
                <textarea
                  value={skillForm.description}
                  onChange={(e) => setSkillForm({ ...skillForm, description: e.target.value })}
                  placeholder="Specific topics or frameworks covered..."
                  rows={2}
                  maxLength={200}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-sm outline-none"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  disabled={isSubmittingSkill}
                  className="btn-primary flex-1 py-2.5 text-sm"
                >
                  {isSubmittingSkill ? 'Adding...' : 'Add Skill'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddSkillModal(false)}
                  className="btn-outline flex-1 py-2.5 text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {showAddProjectModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-outline-variant/20">
              <h2 className="font-display font-bold text-lg text-on-surface">Add Portfolio Project</h2>
              <button
                onClick={() => setShowAddProjectModal(false)}
                className="p-1.5 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProject} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                  Project Title *
                </label>
                <input
                  type="text"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  placeholder="e.g. Kinetic Exchange Component Library"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest focus:border-primary text-sm outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  placeholder="What was built and the result achieved..."
                  rows={3}
                  maxLength={300}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                  Tech Stack (comma-separated)
                </label>
                <input
                  type="text"
                  value={projectForm.techStack}
                  onChange={(e) => setProjectForm({ ...projectForm, techStack: e.target.value })}
                  placeholder="React, TypeScript, Tailwind, Node.js"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                  Live URL or GitHub Link
                </label>
                <input
                  type="url"
                  value={projectForm.url}
                  onChange={(e) => setProjectForm({ ...projectForm, url: e.target.value })}
                  placeholder="https://github.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-sm outline-none"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  disabled={isSubmittingProject}
                  className="btn-primary flex-1 py-2.5 text-sm"
                >
                  {isSubmittingProject ? 'Adding...' : 'Add Project'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddProjectModal(false)}
                  className="btn-outline flex-1 py-2.5 text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Certificate Modal */}
      {showAddCertificateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-outline-variant/20">
              <h2 className="font-display font-bold text-lg text-on-surface">Add Certificate / Credential</h2>
              <button
                onClick={() => setShowAddCertificateModal(false)}
                className="p-1.5 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCertificate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                  Certificate Title *
                </label>
                <input
                  type="text"
                  value={certificateForm.title}
                  onChange={(e) => setCertificateForm({ ...certificateForm, title: e.target.value })}
                  placeholder="e.g. AWS Solutions Architect"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-sm outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                    Issuer
                  </label>
                  <input
                    type="text"
                    value={certificateForm.issuer}
                    onChange={(e) => setCertificateForm({ ...certificateForm, issuer: e.target.value })}
                    placeholder="e.g. Amazon Web Services"
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                    Date Obtained
                  </label>
                  <input
                    type="date"
                    value={certificateForm.dateObtained}
                    onChange={(e) => setCertificateForm({ ...certificateForm, dateObtained: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                  Verification URL
                </label>
                <input
                  type="url"
                  value={certificateForm.url}
                  onChange={(e) => setCertificateForm({ ...certificateForm, url: e.target.value })}
                  placeholder="https://credly.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-sm outline-none"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  disabled={isSubmittingCertificate}
                  className="btn-primary flex-1 py-2.5 text-sm"
                >
                  {isSubmittingCertificate ? 'Adding...' : 'Add Certificate'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCertificateModal(false)}
                  className="btn-outline flex-1 py-2.5 text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Work Modal */}
      {showAddWorkModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-outline-variant/20">
              <h2 className="font-display font-bold text-lg text-on-surface">Add Work Experience</h2>
              <button
                onClick={() => setShowAddWorkModal(false)}
                className="p-1.5 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddWork} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                  Job Title *
                </label>
                <input
                  type="text"
                  value={workForm.jobTitle}
                  onChange={(e) => setWorkForm({ ...workForm, jobTitle: e.target.value })}
                  placeholder="e.g. Lead Frontend Engineer"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-sm outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                  Company *
                </label>
                <input
                  type="text"
                  value={workForm.company}
                  onChange={(e) => setWorkForm({ ...workForm, company: e.target.value })}
                  placeholder="e.g. Vercel"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-sm outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                    Start Year *
                  </label>
                  <input
                    type="number"
                    value={workForm.startYear}
                    onChange={(e) => setWorkForm({ ...workForm, startYear: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-sm outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                    End Year
                  </label>
                  <input
                    type="number"
                    value={workForm.endYear}
                    onChange={(e) => setWorkForm({ ...workForm, endYear: e.target.value })}
                    disabled={workForm.currentlyWorking}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-sm outline-none disabled:opacity-50"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={workForm.currentlyWorking}
                  onChange={(e) => setWorkForm({ ...workForm, currentlyWorking: e.target.checked })}
                  className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
                />
                <span className="text-xs font-medium text-on-surface">I currently work here</span>
              </label>

              <div>
                <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                  Summary / Responsibilities
                </label>
                <textarea
                  value={workForm.description}
                  onChange={(e) => setWorkForm({ ...workForm, description: e.target.value })}
                  rows={2}
                  maxLength={250}
                  placeholder="Key responsibilities and technical wins..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-sm outline-none"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  disabled={isSubmittingWork}
                  className="btn-primary flex-1 py-2.5 text-sm"
                >
                  {isSubmittingWork ? 'Adding...' : 'Add Experience'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddWorkModal(false)}
                  className="btn-outline flex-1 py-2.5 text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Education Modal */}
      {showAddEducationModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-outline-variant/20">
              <h2 className="font-display font-bold text-lg text-on-surface">Add Education</h2>
              <button
                onClick={() => setShowAddEducationModal(false)}
                className="p-1.5 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEducation} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                  School / University *
                </label>
                <input
                  type="text"
                  value={educationForm.school}
                  onChange={(e) => setEducationForm({ ...educationForm, school: e.target.value })}
                  placeholder="e.g. Stanford University"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-sm outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                  Degree / Program *
                </label>
                <input
                  type="text"
                  value={educationForm.degree}
                  onChange={(e) => setEducationForm({ ...educationForm, degree: e.target.value })}
                  placeholder="e.g. B.S. in Computer Science"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-sm outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                    Start Year
                  </label>
                  <input
                    type="number"
                    value={educationForm.startYear}
                    onChange={(e) => setEducationForm({ ...educationForm, startYear: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                    End Year
                  </label>
                  <input
                    type="number"
                    value={educationForm.endYear}
                    onChange={(e) => setEducationForm({ ...educationForm, endYear: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-sm outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  disabled={isSubmittingEducation}
                  className="btn-primary flex-1 py-2.5 text-sm"
                >
                  {isSubmittingEducation ? 'Adding...' : 'Add Education'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddEducationModal(false)}
                  className="btn-outline flex-1 py-2.5 text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
