'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Rocket, Mail, Lock } from 'lucide-react';
import { useForm } from '@tanstack/react-form';
import { signIn } from '@/lib/auth-client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    onSubmit: async ({ value }) => {
      setError('');
      const result = await signIn.email({
        email: value.email,
        password: value.password,
        rememberMe: value.rememberMe,
      });
      if (result.error) {
        setError(result.error.message || 'Sign in failed');
      } else {
        router.push('/');
      }
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 w-full max-w-md p-8">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#6366f1] flex items-center justify-center">
            <Rocket className="h-6 w-6 text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-900">Welcome back</h1>
        <p className="mt-2 text-center text-sm text-gray-500">
          Sign in to your Launchpad account
        </p>

        {error && (
          <div className="mt-4 p-3 rounded-md bg-red-50 text-red-600 text-sm">{error}</div>
        )}

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <form.Field name="email">
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  leftIcon={<Mail className="h-4 w-4" />}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="password">
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  leftIcon={<Lock className="h-4 w-4" />}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="rememberMe">
            {(field) => (
              <Checkbox
                label="Remember me for 30 days"
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
              />
            )}
          </form.Field>

          <Button type="submit" className="w-full" disabled={form.state.isSubmitting}>
            {form.state.isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-[#6366f1] font-medium hover:underline">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
}
