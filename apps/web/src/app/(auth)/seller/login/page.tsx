'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function SellerLoginPage() {
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
        setError('Invalid seller credentials');
      } else {
        router.refresh();
        const params = new URLSearchParams(window.location.search);
        const callbackUrl = params.get('callbackUrl');
        router.push(callbackUrl || '/seller/dashboard');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-j-background flex flex-col justify-center items-center py-20 px-4">
      <div className="w-full max-w-[400px] bg-white rounded-sm shadow-md border border-j-border overflow-hidden">
        <div className="bg-jumia-orange p-8 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <ShoppingBag size={32} />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Seller Center</h1>
          <p className="text-white/80 text-xs font-bold mt-1">Sell on Jumia</p>
        </div>

        <div className="p-8">
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
              placeholder="business@example.com"
              required
            />

            <div className="space-y-1">
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <div className="flex justify-end">
                <Link href="#" className="text-xs text-j-text-muted hover:text-jumia-orange">
                  Forgot Password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              isLoading={loading}
              className="w-full h-12 mt-4"
            >
              Login to Seller Center
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-j-border text-center">
            <p className="text-xs text-j-text-muted">
              New merchant? <Link href="/seller/register" className="text-jumia-orange font-bold hover:underline">Register Now</Link>
            </p>
            <div className="mt-4 flex items-center justify-center gap-4 text-[10px] uppercase font-bold text-j-text-muted">
              <Link href="/login" className="hover:text-jumia-orange">Customer Login</Link>
              <span className="w-1 h-1 bg-j-border rounded-full" />
              <Link href="/support" className="hover:text-j-text">Help Center</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
