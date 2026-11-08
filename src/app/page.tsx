'use client';

import { Hero } from '@/components/Hero';
import { PopularExchanges } from '@/components/PopularExchanges';
import { Stats } from '@/components/Stats';
import { Features } from '@/components/Features';
import { HowItWorks } from '@/components/HowItWorks';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-container-max mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Hero Section */}
      <Hero />

      {/* Popular Exchanges Bento Grid */}
      <PopularExchanges />

      {/* Network Stats */}
      <Stats />

      {/* High-Trust Features */}
      <Features />

      {/* Step by Step Reciprocity Engine */}
      <HowItWorks />

      {/* Stitch Design System Footer */}
      <footer className="w-full py-12 border-t border-outline-variant/30 mt-16 text-xs text-on-surface-variant">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-base text-primary">SkillBarter</span>
            <span className="text-outline">·</span>
            <span>Professional Reciprocity for Modern Builders</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/search" className="hover:text-primary transition-colors">
              Explore Skills
            </Link>
            <Link href="/exchanges" className="hover:text-primary transition-colors">
              Exchanges
            </Link>
            <Link href="/groups" className="hover:text-primary transition-colors">
              Community
            </Link>
            <Link href="/doc" className="hover:text-primary transition-colors">
              API Docs
            </Link>
          </div>

          <div className="text-outline text-[11px]">
            © {new Date().getFullYear()} SkillBarter. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
