'use client';

import React from 'react';
import { UserCheck, Search, Repeat, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function HowItWorks() {
  const steps = [
    {
      number: '01',
      icon: UserCheck,
      title: 'List Your Offerings',
      description:
        'Specify your core domain strengths, past portfolio deliverables, and the target skills you need in return.',
    },
    {
      number: '02',
      icon: Search,
      title: 'Discover & Match',
      description:
        'Browse vetted creator and engineer profiles with matching skill overlap scores and confirmed availability.',
    },
    {
      number: '03',
      icon: Repeat,
      title: 'Execute & Elevate',
      description:
        'Establish milestones in an integrated workspace, exchange work with mutual feedback, and expand your network.',
    },
  ];

  return (
    <section className="py-12 border-t border-outline-variant/30">
      <div className="bg-surface-container-lowest rounded-3xl p-8 sm:p-12 border border-outline-variant/30 shadow-card">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-primary mb-2 block">
            The Reciprocity Model
          </span>
          <h2 className="text-headline-lg font-headline-lg text-on-surface font-bold tracking-tight mb-3">
            How Kinetic Barter Operates
          </h2>
          <p className="text-body-md text-on-surface-variant">
            From initial proposal to finished milestone in three structured phases.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="flex flex-col items-center text-center relative group">
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-surface-container-low border border-outline-variant/40 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-white text-[11px] font-mono font-bold flex items-center justify-center shadow">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-on-surface mb-2 font-display">
                  {step.title}
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed max-w-xs">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-12 pt-8 border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-base font-bold text-on-surface">Ready to trade expertise?</h4>
            <p className="text-xs text-on-surface-variant">Join hundreds of engineers, designers, and founders today.</p>
          </div>
          <Link
            href="/auth/signup"
            className="btn-primary"
          >
            Create Your Profile <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
export default HowItWorks;
