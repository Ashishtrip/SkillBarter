'use client';

import { useState, useEffect } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { ChevronRight, Zap } from 'lucide-react';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [urlError, setUrlError] = useState('');
  const [providerError, setProviderError] = useState('');
  const router = useRouter();

  // Show error from URL params (NextAuth may redirect back with ?error=...)
  // Move to useEffect to avoid hydration mismatch
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get('error') || '';
    setUrlError(errorParam);
  }, []);

  function mapAuthError(code: string | null | undefined) {
    if (!code) return '';
    const map: Record<string, string> = {
      CredentialsSignin: 'Invalid email or password.',
      OAuthSignin: 'Error signing in with the provider. Please try again.',
      OAuthCallback: 'Provider callback error. Please try again.',
      OAuthCreateAccount: 'Could not create account from provider data.',
      EmailCreateAccount: 'Could not create account with that email.',
      Callback: 'Authentication callback error. Please try again.',
      OAuthAccountNotLinked: 'An account with this email already exists. Try signing in with your original method.',
      RateLimited: 'Too many attempts. Please try again later.',
    };
    return map[code] || code;
  }
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
        setError('Invalid email or password');
      } else {
        router.push('/profile');
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-secondary-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-secondary-600">
            Or{' '}
            <Link href="/auth/signup" className="font-medium text-primary-600 hover:text-primary-500">
              create a new account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-secondary-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-secondary-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-secondary-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-secondary-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Forgot password?
            </Link>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="mt-4">
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-secondary-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-secondary-500">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={async () => {
                setIsLoading(true);
                setProviderError('');
                const res = await signIn('google', { redirect: false, callbackUrl: '/profile' });
                if (res?.error) {
                  setProviderError(mapAuthError(res.error));
                  setIsLoading(false);
                }
                // if no error and url present, NextAuth will handle redirect
              }}
              className="flex items-center justify-center space-x-2 border border-secondary-200 rounded-lg py-2 hover:bg-secondary-50 transition-colors"
            >
              {/* Official Google Logo */}
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_logo.svg/512px-Google_%22G%22_logo.svg.png" 
                alt="Google" 
                className="h-5 w-5" 
              />
              <span className="text-sm font-medium">Google</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                setIsLoading(true);
                setProviderError('');
                const res = await signIn('apple', { redirect: false, callbackUrl: '/profile' });
                if (res?.error) {
                  setProviderError(mapAuthError(res.error));
                  setIsLoading(false);
                }
              }}
              className="flex items-center justify-center space-x-2 border border-secondary-200 rounded-lg py-2 hover:bg-secondary-50 transition-colors"
            >
              {/* Official Apple Logo */}
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/512px-Apple_logo_black.svg.png" 
                alt="Apple" 
                className="h-5 w-5" 
              />
              <span className="text-sm font-medium">Apple</span>
            </button>
          </div>
          {providerError && (
            <div className="mt-3 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-lg">
              {providerError}
            </div>
          )}
          {urlError && (
            <div className="mt-3 bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg">
              {mapAuthError(urlError)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
