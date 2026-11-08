'use client';

import React from 'react';
import { Search, ShieldCheck, Milestone, MessageSquare, Zap, Trophy } from 'lucide-react';

export function Features() {
  const features = [
    {
      icon: Search,
      title: 'Precision Skill Matching',
      description:
        'Smart algorithmic matchmaking aligns your exact offerings with complementary collaborator demands and overlapping availability.',
    },
    {
      icon: Milestone,
      title: 'Milestone-Driven Projects',
      description:
        'Structure agreements into verifiable milestones with explicit deliverables, ensuring balanced reciprocity for both parties.',
    },
    {
      icon: ShieldCheck,
      title: 'Verified Competence',
      description:
        'Peer-reviewed portfolios, GitHub and LinkedIn links, and authentic reviews from real exchanges guarantee quality and accountability.',
    },
    {
      icon: MessageSquare,
      title: 'Built-in Collaboration Hub',
      description:
        'Discuss specifications, share files, and initiate live video syncs directly in a focused discussion space.',
    },
    {
      icon: Zap,
      title: 'Zero Financial Friction',
      description:
        'Never let runway restrict growth. Build products, launch brands, and learn mastery entirely through mutual talent exchange.',
    },
    {
      icon: Trophy,
      title: 'Reputation & Growth Network',
      description:
        'Accumulate verifiable barter credentials and build a long-term network of elite founders, designers, and engineers.',
    },
  ];

  return (
    <section className="py-12 border-t border-outline-variant/30">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-headline-lg font-headline-lg text-on-surface font-bold tracking-tight mb-3">
          Built for High-Trust Collaboration
        </h2>
        <p className="text-body-md text-on-surface-variant">
          Every tool you need to trade skills with confidence, transparency, and structure.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-card hover:shadow-card-hover transition-all group"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-5 text-primary group-hover:scale-105 group-hover:bg-primary group-hover:text-white transition-all">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2 font-display">
                {feature.title}
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
export default Features;
