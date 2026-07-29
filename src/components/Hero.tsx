import Link from 'next/link';
import { ArrowRight, Zap, Users, BookOpen, TrendingUp } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 rounded-card" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
      
      <div className="relative px-6 sm:px-10 py-14 sm:py-20 md:py-24">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <div className="inline-flex items-center space-x-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
            <Zap className="w-4 h-4 text-warning-300" />
            <span className="text-sm font-medium text-white/90">Join 1,200+ active skill exchangers</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-heading font-extrabold text-white leading-[1.1] mb-5">
            Exchange Skills,{' '}
            <span className="text-primary-200">Grow Together</span>
          </h1>

          <p className="text-base sm:text-lg text-white/80 leading-relaxed mb-8 max-w-xl">
            Teach what you know, learn what you need. Join a community of passionate learners and skilled teachers exchanging knowledge.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-12">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center bg-white text-primary-700 font-heading font-bold py-3 px-7 rounded-full text-sm hover:bg-primary-50 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98]"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center justify-center border-2 border-white/30 text-white font-heading font-semibold py-3 px-7 rounded-full text-sm hover:bg-white/10 transition-all duration-200"
            >
              Explore Skills
            </Link>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-md">
            <div>
              <p className="text-2xl sm:text-3xl font-heading font-bold text-white">3.5K+</p>
              <p className="text-xs sm:text-sm text-white/60 mt-0.5">Skills Exchanged</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-heading font-bold text-white">95%</p>
              <p className="text-xs sm:text-sm text-white/60 mt-0.5">Success Rate</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-heading font-bold text-white">10+</p>
              <p className="text-xs sm:text-sm text-white/60 mt-0.5">Categories</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
