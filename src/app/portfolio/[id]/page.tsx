'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, ExternalLink, Code, Layers, Calendar, 
  Clock, User, CheckCircle2, ChevronRight, Share2, 
  FolderGit2, Sparkles, AlertCircle
} from 'lucide-react';
import { User as UserType } from '@/types';

export default function ProjectDetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const fetchProjectData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const uData = await res.json();
        const userData: UserType = uData.data || uData;
        setUser(userData);

        // Find project by index or title slug
        if (userData.projects && userData.projects.length > 0) {
          const index = parseInt(projectId, 10);
          if (!isNaN(index) && userData.projects[index]) {
            setProject(userData.projects[index]);
          } else {
            const found = userData.projects.find((p: any) => 
              p.title?.toLowerCase().replace(/\s+/g, '-') === projectId.toLowerCase()
            );
            setProject(found || userData.projects[0]);
          }
        } else {
          // Default showcase project if user hasn't added one yet
          setProject({
            title: 'E-commerce Platform Redesign',
            description: 'The challenge was to modernize a legacy platform that was suffering from high bounce rates and a convoluted checkout process. Our solution involved a complete teardown of the existing architecture, implementing a headless commerce approach with Next.js and Tailwind CSS for instant load times and seamless transitions.',
            techStack: ['Next.js', 'React', 'Tailwind CSS', 'Figma', 'TypeScript'],
            url: 'https://github.com',
            role: 'Lead Designer & Frontend Dev',
            duration: '3 Months',
            partner: 'TechFlow Collaborative',
            industry: 'E-commerce & SaaS',
          });
        }
      }
    } catch (err) {
      console.error('Error loading project details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-secondary text-sm font-medium">Loading project showcase...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/30 text-center max-w-md w-full shadow-sm">
          <FolderGit2 className="w-10 h-10 text-secondary/40 mx-auto mb-3" />
          <h2 className="font-display font-bold text-lg text-on-surface">Project Not Found</h2>
          <p className="text-secondary text-xs mt-1 mb-6">Could not locate the requested portfolio deliverable.</p>
          <Link href="/profile" className="btn-primary text-xs px-4 py-2 inline-block">
            Back to Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-background py-8">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-secondary font-medium">
          <Link href="/profile" className="hover:text-primary transition-colors">
            Portfolio
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-secondary/60" />
          <span className="text-on-surface font-semibold truncate max-w-md">{project.title}</span>
        </nav>

        {/* Header & Actions */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-on-surface tracking-tight">
              {project.title}
            </h1>
            <p className="text-secondary text-sm sm:text-base mt-1">
              Verified artifact exchange delivered through Skill Barter.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-xs px-5 py-2.5 flex items-center gap-2 shadow-sm"
              >
                <span>View Live Site</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: project.title, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Project link copied to clipboard!');
                }
              }}
              className="p-2.5 rounded-xl border border-outline-variant/40 hover:bg-surface-container text-secondary transition-colors"
              title="Share deliverable"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hero Showcase Banner */}
        <div className="w-full rounded-2xl overflow-hidden border border-outline-variant/30 shadow-sm bg-surface-container-high/40 aspect-video md:aspect-[21/9] relative flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10" />
          <div className="p-8 text-center z-20 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-primary mb-3 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Featured Deliverable
            </span>
            <h2 className="text-white font-display text-2xl sm:text-3xl font-bold drop-shadow-sm">
              {project.title}
            </h2>
          </div>
        </div>

        {/* 12-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Description (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 sm:p-8 shadow-sm space-y-5">
              <h2 className="font-display font-bold text-xl text-on-surface">Project Overview</h2>
              <div className="text-secondary text-sm sm:text-base leading-relaxed space-y-4">
                <p>
                  {project.description || 'This deliverable was completed as part of a reciprocal peer skill barter. It highlights specialized engineering and design outcomes with high attention to performance, maintainability, and clean UI standards.'}
                </p>
                <p>
                  The component architecture utilizes modern TypeScript and scalable state patterns, ensuring rapid iteration and high test coverage.
                </p>
              </div>
            </section>
          </div>

          {/* Right Column: Metadata & Tech Stack (4 cols) */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* Metadata Card */}
            <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-sm space-y-4">
              <h3 className="font-display font-bold text-sm text-secondary uppercase tracking-widest pb-3 border-b border-outline-variant/20">
                Project Details
              </h3>

              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between items-start pb-2 border-b border-outline-variant/20">
                  <span className="text-secondary">Role</span>
                  <span className="font-semibold text-on-surface text-right">{project.role || 'Lead Engineer'}</span>
                </div>
                <div className="flex justify-between items-start pb-2 border-b border-outline-variant/20">
                  <span className="text-secondary">Duration</span>
                  <span className="font-semibold text-on-surface text-right">{project.duration || '4 Weeks'}</span>
                </div>
                <div className="flex justify-between items-start pb-2 border-b border-outline-variant/20">
                  <span className="text-secondary">Industry</span>
                  <span className="font-semibold text-on-surface text-right">{project.industry || 'Technology & Design'}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-secondary">Exchange Verification</span>
                  <span className="font-semibold text-emerald-600 text-right flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified
                  </span>
                </div>
              </div>
            </section>

            {/* Technologies & Skills Card */}
            <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-sm space-y-4">
              <h3 className="font-display font-bold text-sm text-secondary uppercase tracking-widest pb-3 border-b border-outline-variant/20">
                Technologies &amp; Skills
              </h3>

              <div className="flex flex-wrap gap-2">
                {project.techStack && project.techStack.length > 0 ? (
                  project.techStack.map((tech: string, i: number) => (
                    <span
                      key={i}
                      className="font-mono text-xs px-2.5 py-1 rounded-md bg-surface-container text-on-surface border border-outline-variant/30 font-medium"
                    >
                      {tech}
                    </span>
                  ))
                ) : (
                  <>
                    <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-surface-container text-on-surface">React</span>
                    <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-surface-container text-on-surface">TypeScript</span>
                    <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-surface-container text-on-surface">Tailwind CSS</span>
                  </>
                )}
              </div>
            </section>

            {/* Collaborators Card */}
            <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-sm space-y-4">
              <h3 className="font-display font-bold text-sm text-secondary uppercase tracking-widest pb-3 border-b border-outline-variant/20">
                Exchange Author
              </h3>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    user?.name?.charAt(0) || 'U'
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-on-surface">{user?.name || 'Skill Barter Specialist'}</h4>
                  <p className="text-xs text-secondary">{user?.location || 'Verified Member'}</p>
                </div>
              </div>
            </section>

          </aside>

        </div>

      </div>
    </div>
  );
}

