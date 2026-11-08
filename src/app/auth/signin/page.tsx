'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get('error');
    if (errorParam) {
      setError('Authentication error. Please check your credentials or try again.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password. Please try again.');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = (provider: 'google' | 'github') => {
    signIn(provider, { callbackUrl: '/dashboard' });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface">
      {/* ─── Left Side: Brand Identity & Cinematic Atmosphere (Stitch Style) ─── */}
      <section className="hidden md:flex relative w-full md:w-1/2 min-h-screen bg-inverse-surface flex-col justify-between p-12 lg:p-16 text-white overflow-hidden">
        {/* Subtle radial glow & grid background */}
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-fixed-dim text-inverse-surface font-bold flex items-center justify-center text-sm shadow">
              SB
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-white">
              SkillBarter
            </span>
          </Link>
        </div>

        {/* Center Editorial Quote */}
        <div className="relative z-10 max-w-lg space-y-6">
          <p className="font-display text-3xl lg:text-4xl font-bold leading-tight text-surface-bright">
            Join a global network of professionals{' '}
            <span className="text-primary-fixed-dim">trading mastery for mastery.</span>
          </p>
          <div className="w-20 h-1 bg-primary-fixed-dim rounded-full" />

          <div className="pt-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/40 shadow-lg bg-surface-container-high flex items-center justify-center font-bold text-inverse-surface text-base">
              SC
            </div>
            <div>
              <p className="text-xs text-surface-variant italic max-w-xs">
                "The most valuable currency I've found isn't capital, it's specific expertise shared through mutual reciprocity."
              </p>
              <span className="text-[11px] font-mono font-semibold text-primary-fixed uppercase tracking-wider block mt-1">
                Sarah Chen · Senior Product Architect
              </span>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="relative z-10 text-xs text-outline-variant">
          © {new Date().getFullYear()} SkillBarter. Professional Reciprocity.
        </div>
      </section>

      {/* ─── Right Side: Authentication Form (Stitch Style) ─── */}
      <section className="flex-1 flex flex-col justify-center items-center px-6 md:px-12 py-12 bg-surface">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Header Logo */}
          <div className="md:hidden flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-primary text-white font-bold flex items-center justify-center text-xs">
              SB
            </div>
            <span className="font-display text-lg font-bold text-primary">SkillBarter</span>
          </div>

          {/* Tab Switcher (Login / Create Account) */}
          <div className="bg-surface-container rounded-xl p-1 flex">
            <button
              className="flex-1 py-2 rounded-lg font-semibold text-xs shadow-sm bg-surface-container-lowest text-primary transition-all"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push('/auth/signup')}
              className="flex-1 py-2 rounded-lg font-semibold text-xs text-on-surface-variant hover:text-on-surface transition-all"
            >
              Create Account
            </button>
          </div>

          {/* Header text */}
          <div>
            <h2 className="font-display text-2xl font-bold text-on-surface tracking-tight">
              Welcome back
            </h2>
            <p className="text-xs text-on-surface-variant mt-1">
              Access your skill exchange workspace & discussions
            </p>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleOAuthSignIn('google')}
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-surface-container-lowest border border-outline-variant/60 rounded-xl text-xs font-semibold text-on-surface hover:bg-surface-container-low transition-all active:scale-95 shadow-sm"
            >
              <span>Google</span>
            </button>
            <button
              type="button"
              onClick={() => handleOAuthSignIn('github')}
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-surface-container-lowest border border-outline-variant/60 rounded-xl text-xs font-semibold text-on-surface hover:bg-surface-container-low transition-all active:scale-95 shadow-sm"
            >
              <span>GitHub</span>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-outline-variant/30" />
            <span className="text-[11px] font-mono text-outline uppercase tracking-wider">
              or email
            </span>
            <div className="flex-1 h-px bg-outline-variant/30" />
          </div>

          {error && (
            <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-on-surface-variant block mb-1.5 ml-0.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5 ml-0.5">
                <label className="text-xs font-semibold text-on-surface-variant">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-[11px] font-semibold text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-field pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary hover:bg-primary-container text-white font-semibold text-xs rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] mt-2 flex items-center justify-center gap-2"
            >
              <span>{isLoading ? 'Signing In...' : 'Log in to SkillBarter'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <p className="text-center text-[11px] text-outline px-4">
            By continuing, you agree to our{' '}
            <Link href="/" className="underline text-on-surface hover:text-primary">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/" className="underline text-on-surface hover:text-primary">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
