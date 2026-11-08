'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, Sparkles, Repeat, ArrowUpRight } from 'lucide-react';

export function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?search=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/search');
    }
  };

  const trendingTags = [
    'UI/UX Design',
    'React & Next.js',
    'Technical SEO',
    'Python & AI',
    'Brand Identity',
    'Product Strategy',
  ];

  return (
    <section className="relative text-center py-12 md:py-20 overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Eyebrow Badge */}
      <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Professional Reciprocity for Modern Builders</span>
      </div>

      {/* Main Display Headline */}
      <h1 className="text-display font-display text-on-surface max-w-4xl mx-auto mb-6 tracking-tight">
        Unlock Potential Through <span className="text-primary">Reciprocity</span>
      </h1>

      {/* Subtitle */}
      <p className="text-body-lg font-body-lg text-on-surface-variant max-w-2xl mx-auto mb-10">
        Exchange high-value professional skills directly. Build your portfolio, collaborate with verified experts, and grow your startup—without spending a dime.
      </p>

      {/* Instant Search Bar */}
      <div className="max-w-2xl mx-auto relative glass-panel rounded-2xl p-2.5 shadow-sm mb-6 border border-outline-variant/40">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <Search className="w-5 h-5 text-outline ml-3 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find your next skill match (e.g. React Developer, UI Designer)..."
            className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm md:text-base text-on-surface placeholder:text-outline/70 px-2"
          />
          <button
            type="submit"
            className="bg-primary hover:bg-primary-container text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 whitespace-nowrap"
          >
            Search
          </button>
        </form>
      </div>

      {/* Trending Tags */}
      <div className="flex items-center justify-center gap-2 flex-wrap max-w-2xl mx-auto text-xs text-on-surface-variant">
        <span className="font-semibold text-outline uppercase tracking-wider text-[11px]">Trending:</span>
        {trendingTags.map((tag) => (
          <button
            key={tag}
            onClick={() => router.push(`/search?search=${encodeURIComponent(tag)}`)}
            className="bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-primary px-3 py-1 rounded-full border border-outline-variant/30 transition-colors"
          >
            {tag}
          </button>
        ))}
      </div>
    </section>
  );
}
