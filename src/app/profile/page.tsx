'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { User, Mail, MapPin, BookOpen, GraduationCap, Edit3, Plus, ShieldCheck, X, Download, Trash2, Code, Briefcase, Award } from 'lucide-react';
import { User as UserType, Skill } from '@/types';

const CATEGORIES = ['tech', 'music', 'languages', 'academics', 'management', 'arts', 'sports', 'cooking', 'crafts', 'other'];
const LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'];

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [showAddCertificateModal, setShowAddCertificateModal] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
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
  const [isSubmittingSkill, setIsSubmittingSkill] = useState(false);
  const [isSubmittingCertificate, setIsSubmittingCertificate] = useState(false);
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    url: '',
    techStack: '',
  });
  const [isSubmittingProject, setIsSubmittingProject] = useState(false);
  const [showAddEducationModal, setShowAddEducationModal] = useState(false);
  const [showAddWorkModal, setShowAddWorkModal] = useState(false);
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
          name: userData.name,
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
        headers: {
          'Content-Type': 'application/json',
        },
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: skillForm.name,
          category: skillForm.category,
          level: skillForm.level,
          description: skillForm.description,
          tags: [],
          type: skillType, // 'teach' or 'learn'
        }),
      });

      if (response.ok) {
        // Refresh user profile to get updated skills
        await fetchUserProfile();
        setShowAddSkillModal(false);
        setSkillForm({
          name: '',
          category: CATEGORIES[0],
          level: LEVELS[0],
          description: '',
        });
      } else {
        console.error('Failed to add skill');
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
      const response = await fetch(`/api/skills?id=${skillId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh user profile to get updated skills
        await fetchUserProfile();
      } else {
        console.error('Failed to delete skill');
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
        headers: {
          'Content-Type': 'application/json',
        },
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
      } else {
        console.error('Failed to add certificate');
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
      const response = await fetch(`/api/user/certificates?index=${index}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchUserProfile();
      } else {
        console.error('Failed to delete certificate');
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
        headers: {
          'Content-Type': 'application/json',
        },
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
      } else {
        console.error('Failed to add project');
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
      const response = await fetch(`/api/user/projects?index=${index}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchUserProfile();
      } else {
        console.error('Failed to delete project');
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
        headers: {
          'Content-Type': 'application/json',
        },
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
      const response = await fetch(`/api/user/education?index=${index}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchUserProfile();
      } else {
        console.error('Failed to delete education');
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
        headers: {
          'Content-Type': 'application/json',
        },
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
      const response = await fetch(`/api/user/work-experience?index=${index}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchUserProfile();
      } else {
        console.error('Failed to delete work experience');
      }
    } catch (error) {
      console.error('Error deleting work experience:', error);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 bg-primary-600 rounded-full animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-secondary-900 mb-4">Profile not found</h2>
          <p className="text-secondary-600">There was an error loading your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-secondary-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-8 h-8 sm:w-10 sm:h-10 text-primary-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center flex-wrap gap-2">
                  {user.name}
                  {user.identityVerified && (
                    <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  )}
                </h1>
                <p className="text-xs sm:text-sm text-primary-100 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center justify-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base whitespace-nowrap"
            >
              <Edit3 className="w-4 h-4" />
              <span className="hidden sm:inline">{isEditing ? 'Cancel' : 'Edit Profile'}</span>
              <span className="sm:hidden">{isEditing ? 'Cancel' : 'Edit'}</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {isEditing ? (
            <form onSubmit={handleEditSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-secondary-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="input-field text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-xs sm:text-sm font-medium text-secondary-700 mb-2">
                  Bio
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="input-field text-sm"
                  placeholder="Tell us about yourself..."
                  maxLength={500}
                />
                <p className="mt-1 text-xs sm:text-sm text-secondary-500">
                  {editForm.bio.length}/500 characters
                </p>
              </div>

              <div>
                <label htmlFor="location" className="block text-xs sm:text-sm font-medium text-secondary-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="input-field text-sm"
                  placeholder="City, Country"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="github" className="block text-xs sm:text-sm font-medium text-secondary-700 mb-2">
                    GitHub Profile (optional)
                  </label>
                  <input
                    type="url"
                    id="github"
                    value={editForm.githubProfile}
                    onChange={(e) => setEditForm({ ...editForm, githubProfile: e.target.value })}
                    className="input-field text-sm"
                    placeholder="https://github.com/username"
                  />
                </div>

                <div>
                  <label htmlFor="linkedin" className="block text-xs sm:text-sm font-medium text-secondary-700 mb-2">
                    LinkedIn Profile (optional)
                  </label>
                  <input
                    type="url"
                    id="linkedin"
                    value={editForm.linkedinProfile}
                    onChange={(e) => setEditForm({ ...editForm, linkedinProfile: e.target.value })}
                    className="input-field text-sm"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:space-x-4">
                <button type="submit" className="btn-primary text-sm py-2.5 px-4 sm:py-2 sm:px-4 flex-1 sm:flex-none">
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn-outline text-sm py-2.5 px-4 sm:py-2 sm:px-4 flex-1 sm:flex-none"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="flex items-start sm:items-center space-x-3">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-secondary-600">Email</p>
                    <p className="font-medium text-secondary-900 text-sm sm:text-base truncate">{user.email}</p>
                  </div>
                </div>
                {user.location && (
                  <div className="flex items-start sm:items-center space-x-3">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-secondary-600">Location</p>
                      <p className="font-medium text-secondary-900 text-sm sm:text-base truncate">{user.location}</p>
                    </div>
                  </div>
                )}
                {user.identityVerified && (
                  <div className="flex items-start sm:items-center space-x-3">
                    <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-secondary-600">Identity</p>
                      <p className="font-medium text-secondary-900 text-sm sm:text-base">Verified</p>
                    </div>
                  </div>
                )}
              </div>

              {user.bio && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-secondary-900 mb-2">About</h3>
                  <p className="text-xs sm:text-sm text-secondary-600 leading-relaxed">{user.bio}</p>
                </div>
              )}

              {/* Social Links */}
              {(user.githubProfile || user.linkedinProfile) && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-secondary-900 mb-3 sm:mb-4">Social Profiles</h3>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {user.githubProfile && (
                      <a
                        href={user.githubProfile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 border border-secondary-200 rounded-lg px-4 py-2 hover:bg-secondary-50 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        <span className="text-sm font-medium">GitHub</span>
                      </a>
                    )}
                    {user.linkedinProfile && (
                      <a
                        href={user.linkedinProfile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 border border-secondary-200 rounded-lg px-4 py-2 hover:bg-secondary-50 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="#0A66C2">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.728-2.004 1.431-.103.25-.129.599-.129.949v5.425h-3.554s.047-8.789 0-9.692h3.554v1.371c.425-.654 1.185-1.586 2.882-1.586 2.105 0 3.685 1.375 3.685 4.331v5.576zM5.337 8.855c-1.144 0-1.915-.758-1.915-1.706 0-.955.768-1.703 1.959-1.703 1.188 0 1.913.748 1.932 1.703 0 .948-.744 1.706-1.976 1.706zm1.581 11.597H3.715V9.505h3.203v10.947zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>
                        </svg>
                        <span className="text-sm font-medium">LinkedIn</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Certificates */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-secondary-900 flex items-center">
                    <Download className="w-5 h-5 mr-2 text-primary-600" />
                    Certificates
                  </h3>
                  <button 
                    onClick={() => setShowAddCertificateModal(true)}
                    className="btn-outline text-sm py-1 px-3"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Certificate
                  </button>
                </div>
                <div className="space-y-2">
                  {user.certificates && user.certificates.length > 0 ? (
                    user.certificates.map((cert: any, index: number) => (
                      <div key={index} className="card p-4 flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-secondary-900">{cert.title}</h4>
                          {cert.issuer && (
                            <p className="text-sm text-secondary-600">Issued by: {cert.issuer}</p>
                          )}
                          {cert.dateObtained && (
                            <p className="text-sm text-secondary-600">
                              Date: {new Date(cert.dateObtained).toLocaleDateString()}
                            </p>
                          )}
                          {cert.url && (
                            <a
                              href={cert.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary-600 hover:text-primary-700 mt-2 inline-block"
                            >
                              View Certificate →
                            </a>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteCertificate(index)}
                          className="text-secondary-400 hover:text-red-600 transition-colors ml-4"
                          title="Remove certificate"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-secondary-500 text-sm">No certificates added yet</p>
                  )}
                </div>
              </div>

              {/* Projects */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-secondary-900 flex items-center">
                    <Code className="w-5 h-5 mr-2 text-primary-600" />
                    Projects
                  </h3>
                  <button 
                    onClick={() => setShowAddProjectModal(true)}
                    className="btn-outline text-sm py-1 px-3"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Project
                  </button>
                </div>
                <div className="space-y-2">
                  {user.projects && user.projects.length > 0 ? (
                    user.projects.map((project: any, index: number) => (
                      <div key={index} className="card p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-secondary-900">{project.title}</h4>
                            {project.description && (
                              <p className="text-sm text-secondary-600 mt-1">{project.description}</p>
                            )}
                            {project.techStack && project.techStack.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {project.techStack.map((tech: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="inline-block bg-primary-100 text-primary-700 text-xs font-medium px-2 py-1 rounded"
                                  >
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            )}
                            {project.url && (
                              <a
                                href={project.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary-600 hover:text-primary-700 mt-2 inline-block"
                              >
                                View Project →
                              </a>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteProject(index)}
                            className="text-secondary-400 hover:text-red-600 transition-colors ml-4"
                            title="Remove project"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-secondary-500 text-sm">No projects added yet</p>
                  )}
                </div>
              </div>

              {/* Education Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-secondary-900 flex items-center">
                    <GraduationCap className="w-5 h-5 mr-2 text-primary-600" />
                    Education
                  </h3>
                  <button 
                    onClick={() => setShowAddEducationModal(true)}
                    className="btn-outline text-sm py-1 px-3"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Education
                  </button>
                </div>
                <div className="space-y-3">
                  {user.education && user.education.length > 0 ? (
                    user.education.map((edu: any, index: number) => (
                      <div key={index} className="bg-secondary-50 rounded-lg p-4 border border-secondary-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-secondary-900">{edu.degree}</h4>
                            <p className="text-secondary-700">{edu.school}</p>
                            {edu.fieldOfStudy && (
                              <p className="text-secondary-600 text-sm mt-1">{edu.fieldOfStudy}</p>
                            )}
                            <p className="text-secondary-500 text-sm mt-2">
                              {edu.startYear} - {edu.endYear}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteEducation(index)}
                            className="text-secondary-400 hover:text-red-600 transition-colors ml-4"
                            title="Remove education"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-secondary-500 text-sm">No education added yet</p>
                  )}
                </div>
              </div>

              {/* Work Experience Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-secondary-900 flex items-center">
                    <Briefcase className="w-5 h-5 mr-2 text-primary-600" />
                    Work Experience
                  </h3>
                  <button 
                    onClick={() => setShowAddWorkModal(true)}
                    className="btn-outline text-sm py-1 px-3"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Job
                  </button>
                </div>
                <div className="space-y-3">
                  {user.workExperience && user.workExperience.length > 0 ? (
                    user.workExperience.map((work: any, index: number) => (
                      <div key={index} className="bg-secondary-50 rounded-lg p-4 border border-secondary-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-secondary-900">{work.jobTitle}</h4>
                            <p className="text-secondary-700">{work.company}</p>
                            {work.description && (
                              <p className="text-secondary-600 text-sm mt-2">{work.description}</p>
                            )}
                            <p className="text-secondary-500 text-sm mt-2">
                              {work.startYear} - {work.currentlyWorking ? 'Present' : work.endYear}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteWork(index)}
                            className="text-secondary-400 hover:text-red-600 transition-colors ml-4"
                            title="Remove work experience"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-secondary-500 text-sm">No work experience added yet</p>
                  )}
                </div>
              </div>

              {/* Skills Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-secondary-900 flex items-center">
                      <BookOpen className="w-5 h-5 mr-2 text-primary-600" />
                      Skills I Can Teach
                    </h3>
                    <button 
                      onClick={() => {
                        setSkillType('teach');
                        setShowAddSkillModal(true);
                      }}
                      className="btn-outline text-sm py-1 px-3"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Skill
                    </button>
                  </div>
                  <div className="space-y-2">
                    {user.skillsToTeach && user.skillsToTeach.length > 0 ? (
                      user.skillsToTeach.map((skill: any) => (
                        <div key={skill._id} className="card p-3 flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-secondary-900">{skill.name}</h4>
                            <p className="text-sm text-secondary-600">{skill.category} • {skill.level}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteSkill(skill._id)}
                            className="text-secondary-400 hover:text-red-600 transition-colors"
                            title="Remove skill"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-secondary-500 text-sm">No skills added yet</p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-secondary-900 flex items-center">
                      <GraduationCap className="w-5 h-5 mr-2 text-primary-600" />
                      Skills I Want to Learn
                    </h3>
                    <button 
                      onClick={() => {
                        setSkillType('learn');
                        setShowAddSkillModal(true);
                      }}
                      className="btn-outline text-sm py-1 px-3"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Skill
                    </button>
                  </div>
                  <div className="space-y-2">
                    {user.skillsToLearn && user.skillsToLearn.length > 0 ? (
                      user.skillsToLearn.map((skill: any) => (
                        <div key={skill._id} className="card p-3 flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-secondary-900">{skill.name}</h4>
                            <p className="text-sm text-secondary-600">{skill.category} • {skill.level}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteSkill(skill._id)}
                            className="text-secondary-400 hover:text-red-600 transition-colors"
                            title="Remove skill"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-secondary-500 text-sm">No skills added yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Skill Modal */}
      {showAddSkillModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-secondary-200">
              <h2 className="text-xl font-bold text-secondary-900">
                Add {skillType === 'teach' ? 'Skill to Teach' : 'Skill to Learn'}
              </h2>
              <button
                onClick={() => setShowAddSkillModal(false)}
                className="text-secondary-500 hover:text-secondary-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSkill} className="p-6 space-y-4">
              <div>
                <label htmlFor="skill-name" className="block text-sm font-medium text-secondary-700 mb-1">
                  Skill Name *
                </label>
                <input
                  id="skill-name"
                  type="text"
                  value={skillForm.name}
                  onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                  className="input-field w-full"
                  placeholder="e.g., JavaScript"
                  required
                />
              </div>

              <div>
                <label htmlFor="skill-category" className="block text-sm font-medium text-secondary-700 mb-1">
                  Category
                </label>
                <select
                  id="skill-category"
                  value={skillForm.category}
                  onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
                  className="input-field w-full"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="skill-level" className="block text-sm font-medium text-secondary-700 mb-1">
                  Level
                </label>
                <select
                  id="skill-level"
                  value={skillForm.level}
                  onChange={(e) => setSkillForm({ ...skillForm, level: e.target.value })}
                  className="input-field w-full"
                >
                  {LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="skill-description" className="block text-sm font-medium text-secondary-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  id="skill-description"
                  value={skillForm.description}
                  onChange={(e) => setSkillForm({ ...skillForm, description: e.target.value })}
                  className="input-field w-full"
                  placeholder="Brief description of your skill..."
                  rows={3}
                  maxLength={200}
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmittingSkill}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingSkill ? 'Adding...' : 'Add Skill'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddSkillModal(false)}
                  className="btn-outline flex-1"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-secondary-200">
              <h2 className="text-xl font-bold text-secondary-900">
                Add Certificate
              </h2>
              <button
                onClick={() => setShowAddCertificateModal(false)}
                className="text-secondary-500 hover:text-secondary-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddCertificate} className="p-6 space-y-4">
              <div>
                <label htmlFor="cert-title" className="block text-sm font-medium text-secondary-700 mb-1">
                  Certificate Title *
                </label>
                <input
                  id="cert-title"
                  type="text"
                  value={certificateForm.title}
                  onChange={(e) => setCertificateForm({ ...certificateForm, title: e.target.value })}
                  className="input-field w-full"
                  placeholder="e.g., AWS Certified Developer"
                  required
                />
              </div>

              <div>
                <label htmlFor="cert-issuer" className="block text-sm font-medium text-secondary-700 mb-1">
                  Issuer (optional)
                </label>
                <input
                  id="cert-issuer"
                  type="text"
                  value={certificateForm.issuer}
                  onChange={(e) => setCertificateForm({ ...certificateForm, issuer: e.target.value })}
                  className="input-field w-full"
                  placeholder="e.g., Amazon Web Services"
                />
              </div>

              <div>
                <label htmlFor="cert-date" className="block text-sm font-medium text-secondary-700 mb-1">
                  Date Obtained (optional)
                </label>
                <input
                  id="cert-date"
                  type="date"
                  value={certificateForm.dateObtained}
                  onChange={(e) => setCertificateForm({ ...certificateForm, dateObtained: e.target.value })}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label htmlFor="cert-url" className="block text-sm font-medium text-secondary-700 mb-1">
                  Certificate URL (optional)
                </label>
                <input
                  id="cert-url"
                  type="url"
                  value={certificateForm.url}
                  onChange={(e) => setCertificateForm({ ...certificateForm, url: e.target.value })}
                  className="input-field w-full"
                  placeholder="https://example.com/certificate"
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmittingCertificate}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingCertificate ? 'Adding...' : 'Add Certificate'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCertificateModal(false)}
                  className="btn-outline flex-1"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-secondary-200">
              <h2 className="text-xl font-bold text-secondary-900">
                Add Project
              </h2>
              <button
                onClick={() => setShowAddProjectModal(false)}
                className="text-secondary-500 hover:text-secondary-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddProject} className="p-6 space-y-4">
              <div>
                <label htmlFor="project-title" className="block text-sm font-medium text-secondary-700 mb-1">
                  Project Title *
                </label>
                <input
                  id="project-title"
                  type="text"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  className="input-field w-full"
                  placeholder="e.g., E-commerce Website"
                  required
                />
              </div>

              <div>
                <label htmlFor="project-description" className="block text-sm font-medium text-secondary-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  id="project-description"
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  className="input-field w-full"
                  placeholder="Brief description of your project..."
                  rows={3}
                  maxLength={300}
                />
              </div>

              <div>
                <label htmlFor="project-techstack" className="block text-sm font-medium text-secondary-700 mb-1">
                  Tech Stack (comma-separated)
                </label>
                <input
                  id="project-techstack"
                  type="text"
                  value={projectForm.techStack}
                  onChange={(e) => setProjectForm({ ...projectForm, techStack: e.target.value })}
                  className="input-field w-full"
                  placeholder="e.g., React, Node.js, MongoDB"
                />
              </div>

              <div>
                <label htmlFor="project-url" className="block text-sm font-medium text-secondary-700 mb-1">
                  Project URL (optional)
                </label>
                <input
                  id="project-url"
                  type="url"
                  value={projectForm.url}
                  onChange={(e) => setProjectForm({ ...projectForm, url: e.target.value })}
                  className="input-field w-full"
                  placeholder="https://example.com/project"
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmittingProject}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingProject ? 'Adding...' : 'Add Project'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddProjectModal(false)}
                  className="btn-outline flex-1"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-secondary-200">
              <h2 className="text-xl font-bold text-secondary-900">
                Add Education
              </h2>
              <button
                onClick={() => setShowAddEducationModal(false)}
                className="text-secondary-500 hover:text-secondary-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddEducation} className="p-6 space-y-4">
              <div>
                <label htmlFor="school" className="block text-sm font-medium text-secondary-700 mb-1">
                  School/University *
                </label>
                <input
                  id="school"
                  type="text"
                  value={educationForm.school}
                  onChange={(e) => setEducationForm({ ...educationForm, school: e.target.value })}
                  className="input-field w-full"
                  placeholder="e.g., Stanford University"
                  required
                />
              </div>

              <div>
                <label htmlFor="degree" className="block text-sm font-medium text-secondary-700 mb-1">
                  Degree *
                </label>
                <input
                  id="degree"
                  type="text"
                  value={educationForm.degree}
                  onChange={(e) => setEducationForm({ ...educationForm, degree: e.target.value })}
                  className="input-field w-full"
                  placeholder="e.g., Bachelor of Science"
                  required
                />
              </div>

              <div>
                <label htmlFor="field-of-study" className="block text-sm font-medium text-secondary-700 mb-1">
                  Field of Study (optional)
                </label>
                <input
                  id="field-of-study"
                  type="text"
                  value={educationForm.fieldOfStudy}
                  onChange={(e) => setEducationForm({ ...educationForm, fieldOfStudy: e.target.value })}
                  className="input-field w-full"
                  placeholder="e.g., Computer Science"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="start-year" className="block text-sm font-medium text-secondary-700 mb-1">
                    Start Year *
                  </label>
                  <input
                    id="start-year"
                    type="number"
                    value={educationForm.startYear}
                    onChange={(e) => setEducationForm({ ...educationForm, startYear: e.target.value })}
                    className="input-field w-full"
                    min="1950"
                    max={new Date().getFullYear()}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="end-year" className="block text-sm font-medium text-secondary-700 mb-1">
                    End Year *
                  </label>
                  <input
                    id="end-year"
                    type="number"
                    value={educationForm.endYear}
                    onChange={(e) => setEducationForm({ ...educationForm, endYear: e.target.value })}
                    className="input-field w-full"
                    min="1950"
                    max={new Date().getFullYear() + 10}
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmittingEducation}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingEducation ? 'Adding...' : 'Add Education'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddEducationModal(false)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Work Experience Modal */}
      {showAddWorkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-secondary-200">
              <h2 className="text-xl font-bold text-secondary-900">
                Add Work Experience
              </h2>
              <button
                onClick={() => setShowAddWorkModal(false)}
                className="text-secondary-500 hover:text-secondary-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddWork} className="p-6 space-y-4">
              <div>
                <label htmlFor="job-title" className="block text-sm font-medium text-secondary-700 mb-1">
                  Job Title *
                </label>
                <input
                  id="job-title"
                  type="text"
                  value={workForm.jobTitle}
                  onChange={(e) => setWorkForm({ ...workForm, jobTitle: e.target.value })}
                  className="input-field w-full"
                  placeholder="e.g., Senior Software Engineer"
                  required
                />
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-secondary-700 mb-1">
                  Company *
                </label>
                <input
                  id="company"
                  type="text"
                  value={workForm.company}
                  onChange={(e) => setWorkForm({ ...workForm, company: e.target.value })}
                  className="input-field w-full"
                  placeholder="e.g., Google"
                  required
                />
              </div>

              <div>
                <label htmlFor="work-description" className="block text-sm font-medium text-secondary-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  id="work-description"
                  value={workForm.description}
                  onChange={(e) => setWorkForm({ ...workForm, description: e.target.value })}
                  className="input-field w-full"
                  placeholder="Brief description of your role..."
                  rows={3}
                  maxLength={300}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="work-start-year" className="block text-sm font-medium text-secondary-700 mb-1">
                    Start Year *
                  </label>
                  <input
                    id="work-start-year"
                    type="number"
                    value={workForm.startYear}
                    onChange={(e) => setWorkForm({ ...workForm, startYear: e.target.value })}
                    className="input-field w-full"
                    min="1950"
                    max={new Date().getFullYear()}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="work-end-year" className="block text-sm font-medium text-secondary-700 mb-1">
                    End Year *
                  </label>
                  <input
                    id="work-end-year"
                    type="number"
                    value={workForm.endYear}
                    onChange={(e) => setWorkForm({ ...workForm, endYear: e.target.value })}
                    className="input-field w-full"
                    min="1950"
                    max={new Date().getFullYear() + 10}
                    disabled={workForm.currentlyWorking}
                    required={!workForm.currentlyWorking}
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="currently-working"
                  type="checkbox"
                  checked={workForm.currentlyWorking}
                  onChange={(e) => setWorkForm({ ...workForm, currentlyWorking: e.target.checked })}
                  className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="currently-working" className="ml-2 text-sm text-secondary-700">
                  I currently work here
                </label>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmittingWork}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingWork ? 'Adding...' : 'Add Job'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddWorkModal(false)}
                  className="btn-outline flex-1"
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
