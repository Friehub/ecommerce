'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const LoginForm = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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
        router.refresh();
        if (callbackUrl) {
          router.push(callbackUrl);
        } else {
          const response = await fetch('/api/auth/session');
          const session = await response.json();
          const role = session?.user?.role;

          if (role === 'SELLER') {
            router.push('/seller/dashboard');
          } else if (role === 'ADMIN') {
            router.push('/dashboard');
          } else {
            router.push('/');
          }
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-sm shadow-md w-full max-w-[400px]">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-j-text mb-2">Welcome Back!</h1>
        <p className="text-body-sm text-j-text-muted">Login to your Jumia account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-j-error p-3 rounded-sm text-xs font-medium border border-j-error/20">
            {error}
          </div>
        )}

        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@mail.com"
          required
        />

        <div className="space-y-1">
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
          <div className="flex justify-end">
            <Link href="/auth/forgot-password" className="text-xs text-jumia-orange hover:underline">
              Forgot Password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          isLoading={loading}
          className="w-full h-12"
        >
          Login
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-j-border"></span>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-2 text-j-text-muted">OR</span>
        </div>
      </div>

      <Button
        variant="secondary"
        type="button"
        onClick={() => signIn('google', { callbackUrl: callbackUrl || '/' })}
        className="w-full h-12 gap-3"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </Button>

      <div className="mt-6 text-center">
        <p className="text-body-sm text-j-text-muted">
          New to Jumia?{' '}
          <Link href="/register" className="text-jumia-orange hover:underline font-bold">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
};
