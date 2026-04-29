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
    <div className="bg-white p-8 rounded-lg shadow-sm border w-full max-w-[400px]">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
      <p className="text-gray-500 text-sm mb-6">Login to your Jumia account</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded text-sm border border-red-100">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase text-gray-500">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 pl-10 pr-4 border rounded focus:border-[#F68B1E] outline-none transition-all"
              placeholder="example@mail.com"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase text-gray-500">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 pl-10 pr-4 border rounded focus:border-[#F68B1E] outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-[#F68B1E] text-white rounded font-bold uppercase hover:bg-[#E07A1A] transition-all flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : 'Login'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-gray-500">Don't have an account? </span>
        <a href="/register" className="text-[#F68B1E] font-bold hover:underline">Register</a>
      </div>

      <style jsx>{`
        .bg-white { background-color: #ffffff; }
        .p-8 { padding: 2rem; }
        .rounded-lg { border-radius: 8px; }
        .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
        .border { border: 1px solid #e5e7eb; }
        .w-full { width: 100%; }
        .max-w-\[400px\] { max-width: 400px; }
        .text-2xl { font-size: 1.5rem; }
        .font-bold { font-weight: 700; }
        .text-gray-900 { color: #111827; }
        .mb-2 { margin-bottom: 0.5rem; }
        .text-gray-500 { color: #6b7280; }
        .text-sm { font-size: 0.875rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .space-y-4 > * + * { margin-top: 1rem; }
        .space-y-1 > * + * { margin-top: 0.25rem; }
        .bg-red-50 { background-color: #fef2f2; }
        .text-red-600 { color: #dc2626; }
        .p-3 { padding: 0.75rem; }
        .rounded { border-radius: 4px; }
        .border-red-100 { border-color: #fee2e2; }
        .text-xs { font-size: 0.75rem; }
        .uppercase { text-transform: uppercase; }
        .relative { position: relative; }
        .absolute { position: absolute; }
        .left-3 { left: 0.75rem; }
        .top-1\/2 { top: 50%; }
        .-translate-y-1\/2 { transform: translateY(-50%); }
        .text-gray-400 { color: #9ca3af; }
        .h-11 { height: 2.75rem; }
        .pl-10 { padding-left: 2.5rem; }
        .pr-4 { padding-right: 1rem; }
        .focus\:border-\[\#F68B1E\]:focus { border-color: #f68b1e; }
        .outline-none { outline: 2px solid transparent; outline-offset: 2px; }
        .transition-all { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
        .h-12 { height: 3rem; }
        .bg-\[\#F68B1E\] { background-color: #f68b1e; }
        .text-white { color: #ffffff; }
        .hover\:bg-\[\#E07A1A\]:hover { background-color: #e07a1a; }
        .flex { display: flex; }
        .items-center { align-items: center; }
        .justify-center { justify-content: center; }
        .gap-2 { gap: 0.5rem; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .mt-6 { margin-top: 1.5rem; }
        .text-center { text-align: center; }
        .hover\:underline:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
};
