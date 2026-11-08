'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FolderGit2, Sparkles, ExternalLink, ArrowRight, 
  Code, Layers, Star, Plus
} from 'lucide-react';

export default function PortfolioPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        const user = data.data || data;
        if (user.projects && user.projects.length > 0) {
          setProjects(user.projects);
        } else {
          // Default initial deliverables showcase from Stitch
          setProjects([
            {
              title: 'UI Design for Python Backend',
              description: 'Translated complex backend requirements into a clean, performant React frontend with full design system asset exchange.',
              techStack: ['React', 'Python', 'Figma', 'TypeScript'],
              url: 'https://github.com',
              role: 'UI Designer',
            },
            {
              title: 'FinTech Analytics Dashboard',
              description: 'Built a high-performance React dashboard processing real-time financial data with WebSockets and D3 visual animations.',
              techStack: ['Next.js', 'D3.js', 'Tailwind', 'WebSocket'],
              url: 'https://github.com',
              role: 'Frontend Architect',
            },
            {
              title: 'E-Commerce Mobile API Gateway',
              description: 'Designed scalable microservices architecture using Node and GraphQL for high-throughput mobile retail transactions.',
              techStack: ['Node.js', 'GraphQL', 'PostgreSQL', 'Docker'],
              url: 'https://github.com',
              role: 'Backend Specialist',
            },
          ]);
        }
      }
    } catch (err) {
      console.error('Error fetching portfolio:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background py-8">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="w-3.5 h-3.5" />
                Verified Deliverables Gallery
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-on-surface tracking-tight">
              Portfolio &amp; Showcase
            </h1>
            <p className="text-secondary text-sm sm:text-base mt-1">
              Explore tangible deliverables and projects built during peer skill barter collaborations.
            </p>
          </div>

          <Link
            href="/profile"
            className="btn-primary text-xs px-4 py-2.5 flex items-center gap-1.5 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Manage My Deliverables</span>
          </Link>
        </div>

        {/* Portfolio Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <Link
              key={index}
              href={`/portfolio/${index}`}
              className="group bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 flex flex-col justify-between hover:-translate-y-[1px] hover:shadow-md transition-all duration-200"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                    <FolderGit2 className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold text-secondary px-2.5 py-1 rounded-full bg-surface-container">
                    Deliverable #{index + 1}
                  </span>
                </div>

                <h3 className="font-display font-bold text-lg text-on-surface group-hover:text-primary transition-colors">
                  {project.title}
                </h3>

                <p className="text-secondary text-xs sm:text-sm line-clamp-3 mt-2 mb-5 leading-relaxed">
                  {project.description}
                </p>

                {project.techStack && project.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {project.techStack.map((tech: string, i: number) => (
                      <span
                        key={i}
                        className="font-mono text-[11px] px-2.5 py-0.5 rounded-md bg-surface-container text-secondary font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs font-semibold text-primary">
                <span>View Full Case Study</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}

