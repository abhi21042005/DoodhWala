'use client';

// login page - controlled form with zod error handling and server action
import { useState, useTransition } from 'react';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { loginAction } from '@/features/auth/actions';
import { loginSchema } from '@/lib/schemas';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // client side validation first
    const result = loginSchema.safeParse({ phone, password });
    if (!result.success) {
      const fieldErrors = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append('phone', phone);
      formData.append('password', password);

      const res = await loginAction(null, formData);
      if (res && !res.success) {
        setErrors(res.errors || {});
      }
    });
  };

  const fillDemo = (demoPhone, demoPassword) => {
    setPhone(demoPhone);
    setPassword(demoPassword);
    setErrors({});
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold font-serif text-gray-900 tracking-tight">
          Welcome back
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to manage your morning cow milk delivery
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="p-6 sm:p-8">
          {errors.form && (
            <div
              role="alert"
              className="mb-5 p-3 rounded-lg bg-red-light border border-red-soft text-sm text-red-soft"
            >
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Phone Number"
              id="phone"
              type="tel"
              placeholder="10-digit mobile (e.g. 9876500001)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={errors.phone}
              required
              autoComplete="tel"
            />

            <Input
              label="Password"
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              disabled={isPending}
              className="w-full mt-2"
              size="lg"
            >
              {isPending ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-5 border-t border-gray-200">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Demo Test Accounts
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('9876500001', 'demo1234')}
                className="text-left p-2.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-cream-dark transition-colors text-xs"
              >
                <span className="font-semibold block text-gray-800">Customer</span>
                <span className="text-gray-500 block">Gurpreet Singh</span>
                <span className="text-[11px] text-green-deep font-mono">9876500001</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('9876500000', 'admin1234')}
                className="text-left p-2.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-cream-dark transition-colors text-xs"
              >
                <span className="font-semibold block text-gray-800">Admin</span>
                <span className="text-gray-500 block">Harjit Sandhu</span>
                <span className="text-[11px] text-green-deep font-mono">9876500000</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-gray-600">
            Don&apos;t have an account yet?{' '}
            <Link
              href="/register"
              className="font-medium text-green-deep hover:underline"
            >
              Register here
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
