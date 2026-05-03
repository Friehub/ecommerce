'use client';

import React from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2 } from 'lucide-react';

export const LoginForm = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

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
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg w-full max-w-[400px] shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome Back</h1>
      <p className="text-gray-500 font-medium text-sm mb-6">Login to your Jumia account</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm font-semibold">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase text-gray-500 tracking-wide">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 pl-11 pr-4 border border-gray-300 focus:border-[#F68B1E] focus:ring-1 focus:ring-orange-200/50 rounded-md outline-none font-medium text-gray-800 bg-white duration-150 transition-all"
              placeholder="example@mail.com"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase text-gray-500 tracking-wide">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 pl-11 pr-4 border border-gray-300 focus:border-[#F68B1E] focus:ring-1 focus:ring-orange-200/50 rounded-md outline-none font-medium text-gray-800 bg-white duration-150 transition-all"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-[#F68B1E] hover:bg-[#e07a1a] text-white rounded-md font-bold uppercase tracking-wide duration-150 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : 'Login'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm font-medium">
        <span className="text-gray-500">Don't have an account? </span>
        <a href="/register" className="text-[#F68B1E] font-bold hover:underline tracking-tight">Register</a>
      </div>
    </div>
  );
};
