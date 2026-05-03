'use client';

import React from 'react';
import { api } from '@/trpc/react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Loader2, Phone } from 'lucide-react';

export const RegisterForm = () => {
  const [email, setEmail] = React.useState('');
  const [confirmEmail, setConfirmEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [error, setError] = React.useState('');
  
  const router = useRouter();
  const register = api.iam.register.useMutation({
    onSuccess: () => {
      router.push('/login?registered=true');
    },
    onError: (err) => {
      setError(err.message || 'Registration failed');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (email.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()) {
      setError('Email addresses do not match.');
      return;
    }

    register.mutate({
      email,
      password,
      firstName,
      lastName,
      phone,
    });
  };

  return (
    <div className="bg-white p-8 rounded-lg w-full max-w-[450px] shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Create Account</h1>
      <p className="text-gray-500 font-medium text-sm mb-6">Join the Jumia family today</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm font-semibold">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-gray-500 tracking-wide">First Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full h-12 pl-11 pr-4 border border-gray-300 focus:border-[#F68B1E] focus:ring-1 focus:ring-orange-200/50 rounded-md outline-none font-medium text-gray-800 bg-white duration-150 transition-all"
                placeholder="John"
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-gray-500 tracking-wide">Last Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full h-12 pl-11 pr-4 border border-gray-300 focus:border-[#F68B1E] focus:ring-1 focus:ring-orange-200/50 rounded-md outline-none font-medium text-gray-800 bg-white duration-150 transition-all"
                placeholder="Doe"
                required
              />
            </div>
          </div>
        </div>

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
          <label className="text-xs font-bold uppercase text-gray-500 tracking-wide">Confirm Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input
              type="email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              className="w-full h-12 pl-11 pr-4 border border-gray-300 focus:border-[#F68B1E] focus:ring-1 focus:ring-orange-200/50 rounded-md outline-none font-medium text-gray-800 bg-white duration-150 transition-all"
              placeholder="Confirm your email"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase text-gray-500 tracking-wide">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-12 pl-11 pr-4 border border-gray-300 focus:border-[#F68B1E] focus:ring-1 focus:ring-orange-200/50 rounded-md outline-none font-medium text-gray-800 bg-white duration-150 transition-all"
              placeholder="08012345678"
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
          disabled={register.isLoading}
          className="w-full h-12 bg-[#F68B1E] hover:bg-[#e07a1a] text-white rounded-md font-bold uppercase tracking-wide duration-150 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {register.isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Register'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm font-medium">
        <span className="text-gray-500">Already have an account? </span>
        <a href="/login" className="text-[#F68B1E] font-bold hover:underline tracking-tight">Login</a>
      </div>
    </div>
  );
};


