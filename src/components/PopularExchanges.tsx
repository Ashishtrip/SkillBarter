'use client';

import React from 'react';
import Link from 'next/link';
import { Repeat, ArrowRight, ArrowUpRight, Code, BarChart, FileText, Palette } from 'lucide-react';

export function PopularExchanges() {
  return (
    <section className="py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h2 className="text-headline-lg font-headline-lg text-on-surface font-bold tracking-tight mb-2">
            Popular Exchanges
          </h2>
          <p className="text-body-md text-on-surface-variant">
            Explore high-synergy skills frequently traded by architects, founders, and specialists.
          </p>
        </div>
        <Link
          href="/search"
          className="text-sm font-semibold text-primary hover:text-primary-container flex items-center gap-1 group"
        >
          Browse all categories
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Span 2 cols */}
        <div className="bento-card rounded-2xl p-7 flex flex-col justify-between col-span-1 md:col-span-2 min-h-[260px] relative overflow-hidden group">
          <div className="z-10">
            <div className="flex justify-between items-start mb-4">
              <span className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                High Demand
              </span>
              <Repeat className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-on-surface mb-2 font-display">
              UI Design <span className="text-primary font-normal">⇄</span> React Dev
            </h3>
            <p className="text-body-md text-on-surface-variant max-w-lg">
              Trade complete Figma design systems & design tokens for production-ready React / Next.js implementation. Perfect for solo founders and technical creators.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between z-10 pt-4 border-t border-outline-variant/20">
            <div className="flex gap-2 flex-wrap">
              <span className="text-xs font-mono font-medium border border-outline-variant/40 bg-surface-container-low text-on-surface-variant px-2.5 py-1 rounded-lg">
                Figma
              </span>
              <span className="text-xs font-mono font-medium border border-outline-variant/40 bg-surface-container-low text-on-surface-variant px-2.5 py-1 rounded-lg">
                React
              </span>
              <span className="text-xs font-mono font-medium border border-outline-variant/40 bg-surface-container-low text-on-surface-variant px-2.5 py-1 rounded-lg">
                Next.js
              </span>
            </div>
            <Link
              href="/search?search=React"
              className="text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform flex items-center gap-1"
            >
              Explore Matches <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Decorative Background Icon */}
          <div className="absolute -bottom-8 -right-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none">
            <Code className="w-64 h-64 text-on-surface" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bento-card rounded-2xl p-7 flex flex-col justify-between min-h-[260px] group">
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="bg-tertiary/10 text-tertiary border border-tertiary/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                Trending
              </span>
              <Repeat className="w-5 h-5 text-tertiary" />
            </div>
            <h3 className="text-2xl font-bold text-on-surface mb-2 font-display">
              SEO <span className="text-tertiary font-normal">⇄</span> Content
            </h3>
            <p className="text-body-md text-on-surface-variant">
              Comprehensive technical SEO audits and keyword cluster mapping in exchange for authoritative long-form content.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between pt-4 border-t border-outline-variant/20">
            <div className="flex gap-2 flex-wrap">
              <span className="text-xs font-mono font-medium border border-outline-variant/40 bg-surface-container-low text-on-surface-variant px-2.5 py-1 rounded-lg">
                SEO Audit
              </span>
              <span className="text-xs font-mono font-medium border border-outline-variant/40 bg-surface-container-low text-on-surface-variant px-2.5 py-1 rounded-lg">
                Copywriting
              </span>
            </div>
            <Link
              href="/search?search=SEO"
              className="text-xs font-semibold text-tertiary group-hover:translate-x-0.5 transition-transform flex items-center gap-1"
            >
              Matches <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bento-card rounded-2xl p-7 flex flex-col justify-between min-h-[260px] group">
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="bg-surface-container-high text-on-surface-variant px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                Founder Special
              </span>
              <Repeat className="w-5 h-5 text-outline" />
            </div>
            <h3 className="text-2xl font-bold text-on-surface mb-2 font-display">
              Legal <span className="text-outline font-normal">⇄</span> Branding
            </h3>
            <p className="text-body-md text-on-surface-variant">
              Startup incorporation templates, NDAs, and contract reviews in exchange for distinctive visual identity & logo systems.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between pt-4 border-t border-outline-variant/20">
            <div className="flex gap-2 flex-wrap">
              <span className="text-xs font-mono font-medium border border-outline-variant/40 bg-surface-container-low text-on-surface-variant px-2.5 py-1 rounded-lg">
                Contracts
              </span>
              <span className="text-xs font-mono font-medium border border-outline-variant/40 bg-surface-container-low text-on-surface-variant px-2.5 py-1 rounded-lg">
                Brand Kit
              </span>
            </div>
            <Link
              href="/search?search=Branding"
              className="text-xs font-semibold text-on-surface-variant group-hover:text-primary transition-colors flex items-center gap-1"
            >
              Matches <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 4: Span 2 cols */}
        <div className="bento-card rounded-2xl p-7 flex flex-col justify-between col-span-1 md:col-span-2 min-h-[260px] group">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                  Growth Pair
                </span>
              </div>
              <h3 className="text-2xl font-bold text-on-surface mb-2 font-display">
                Data Science <span className="text-primary font-normal">⇄</span> Marketing Strategy
              </h3>
              <p className="text-body-md text-on-surface-variant mb-4 max-w-md">
                Deep customer analytics and predictive churn modeling exchanged for omnichannel go-to-market execution.
              </p>
              <Link
                href="/search?search=Marketing"
                className="text-sm font-semibold text-primary inline-flex items-center gap-1.5 hover:underline"
              >
                View open requests <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex items-center gap-3 bg-surface-container-low border border-outline-variant/30 p-4 rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <BarChart className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface">32 Active Listings</p>
                <p className="text-[11px] text-on-surface-variant">Average match in 18 hrs</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-2 flex-wrap pt-4 border-t border-outline-variant/20">
            <span className="text-xs font-mono font-medium border border-outline-variant/40 bg-surface-container-low text-on-surface-variant px-2.5 py-1 rounded-lg">
              Python
            </span>
            <span className="text-xs font-mono font-medium border border-outline-variant/40 bg-surface-container-low text-on-surface-variant px-2.5 py-1 rounded-lg">
              SQL
            </span>
            <span className="text-xs font-mono font-medium border border-outline-variant/40 bg-surface-container-low text-on-surface-variant px-2.5 py-1 rounded-lg">
              Growth Marketing
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
export default PopularExchanges;

