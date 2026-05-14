'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/trpc/react';
import Link from 'next/link';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const RegisterForm = () => {
  const [email, setEmail] = React.useState('');
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
    register.mutate({
      email,
      password,
      firstName,
      lastName,
      phone,
    });
  };

  return (
    <div className="bg-white p-8 rounded-sm shadow-md w-full max-w-[500px]">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-j-text mb-2">Create Account</h1>
        <p className="text-body-sm text-j-text-muted">Join the Jumia community today</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-j-error p-3 rounded-sm text-xs font-medium border border-j-error/20">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="John"
            required
          />
          <Input
            label="Last Name"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Doe"
            required
          />
        </div>

        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@mail.com"
          required
        />

        <Input
          label="Phone Number"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="08012345678"
          required
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a password"
          required
        />

        <Button
          type="submit"
          isLoading={register.isLoading}
          className="w-full h-14 mt-4"
        >
          Create Account
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-body-sm text-j-text-muted">
          Already have an account?{' '}
          <Link href="/login" className="text-jumia-orange hover:underline font-bold ml-2">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};
