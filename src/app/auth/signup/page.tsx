'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';
import { signIn } from 'next-auth/react';

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: '',
    location: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Automatically sign in the user
        const loginRes = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (loginRes?.ok) {
          router.push('/dashboard');
        } else {
          router.push('/auth/signin');
        }
      } else {
        setError(data.error || 'Failed to create account. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface">
      {/* ─── Left Side: Brand Identity (Stitch Style) ─── */}
      <section className="hidden md:flex relative w-full md:w-1/2 min-h-screen bg-inverse-surface flex-col justify-between p-12 lg:p-16 text-white overflow-hidden">
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

        {/* Center Quote */}
        <div className="relative z-10 max-w-lg space-y-6">
          <p className="font-display text-3xl lg:text-4xl font-bold leading-tight text-surface-bright">
            Exchange mastery, expand runway,{' '}
            <span className="text-primary-fixed-dim">accelerate your career.</span>
          </p>
          <div className="w-20 h-1 bg-primary-fixed-dim rounded-full" />

          <div className="pt-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/40 shadow-lg bg-surface-container-high flex items-center justify-center font-bold text-inverse-surface text-base">
              MR
            </div>
            <div>
              <p className="text-xs text-surface-variant italic max-w-xs">
                "We built our entire MVP frontend and brand identity without external capital, strictly exchanging technical architecture."
              </p>
              <span className="text-[11px] font-mono font-semibold text-primary-fixed uppercase tracking-wider block mt-1">
                Marcus Rivera · Founder & Lead Architect
              </span>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="relative z-10 text-xs text-outline-variant">
          © {new Date().getFullYear()} SkillBarter. Professional Reciprocity.
        </div>
      </section>

      {/* ─── Right Side: Registration Form ─── */}
      <section className="flex-1 flex flex-col justify-center items-center px-6 md:px-12 py-12 bg-surface">
        <div className="w-full max-w-md space-y-5">
          {/* Mobile Header Logo */}
          <div className="md:hidden flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-primary text-white font-bold flex items-center justify-center text-xs">
              SB
            </div>
            <span className="font-display text-lg font-bold text-primary">SkillBarter</span>
          </div>

          {/* Tab Switcher */}
          <div className="bg-surface-container rounded-xl p-1 flex">
            <button
              onClick={() => router.push('/auth/signin')}
              className="flex-1 py-2 rounded-lg font-semibold text-xs text-on-surface-variant hover:text-on-surface transition-all"
            >
              Sign In
            </button>
            <button
              className="flex-1 py-2 rounded-lg font-semibold text-xs shadow-sm bg-surface-container-lowest text-primary transition-all"
            >
              Create Account
            </button>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-on-surface tracking-tight">
              Create your account
            </h2>
            <p className="text-xs text-on-surface-variant mt-1">
              Join the professional barter network in seconds
            </p>
          </div>

          {error && (
            <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-on-surface-variant block mb-1 ml-0.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Elena Vance"
                  required
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-on-surface-variant block mb-1 ml-0.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="elena@company.com"
                  required
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-on-surface-variant block mb-1 ml-0.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-on-surface-variant block mb-1 ml-0.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="input-field pl-10"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-on-surface-variant block mb-1 ml-0.5">
                Location (Optional)
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="San Francisco, CA (or Remote)"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary hover:bg-primary-container text-white font-semibold text-xs rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2"
            >
              <span>{isLoading ? 'Creating Account...' : 'Get Started with SkillBarter'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <p className="text-center text-[11px] text-outline px-4">
            By creating an account, you agree to our{' '}
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
