'use client';

// register page - controlled inputs, area selector, zod inline error feedback
import { useState, useTransition } from 'react';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { registerAction } from '@/features/auth/actions';
import { registerSchema } from '@/lib/schemas';

const DELIVERY_AREAS = [
  'Fatehgarh Sahib',
  'Mandi Gobindgarh',
  'Amloh',
  'Bassi Pathana',
  'Sirhind',
];

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    area: 'Fatehgarh Sahib',
    address: '',
  });

  const [errors, setErrors] = useState({});
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const result = registerSchema.safeParse(form);
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
      Object.entries(form).forEach(([key, val]) => {
        formData.append(key, val);
      });

      const res = await registerAction(null, formData);
      if (res && !res.success) {
        setErrors(res.errors || {});
      }
    });
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold font-serif text-gray-900 tracking-tight">
          Start your milk subscription
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Fresh, unadulterated cow milk delivered every morning before 7:00 AM
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
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
              label="Full Name"
              id="name"
              name="name"
              placeholder="e.g. Jaswinder Singh"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Phone Number"
                id="phone"
                name="phone"
                type="tel"
                placeholder="10-digit mobile"
                value={form.phone}
                onChange={handleChange}
                error={errors.phone}
                required
              />

              <Input
                label="Email Address"
                id="email"
                name="email"
                type="email"
                placeholder="you@gmail.com"
                value={form.email}
                onChange={handleChange}
                error={errors.email}
                required
              />
            </div>

            <Input
              label="Password (min 6 chars)"
              id="password"
              name="password"
              type="password"
              placeholder="Create a password"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              required
            />

            <div>
              <label
                htmlFor="area"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Delivery Area
              </label>
              <select
                id="area"
                name="area"
                value={form.area}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-green-mid focus:ring-green-mid"
              >
                {DELIVERY_AREAS.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
              {errors.area && (
                <p className="mt-1 text-sm text-red-soft">{errors.area}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Delivery Address & House / Flat No.
              </label>
              <textarea
                id="address"
                name="address"
                rows={2}
                placeholder="House number, street, landmark..."
                value={form.address}
                onChange={handleChange}
                className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors ${
                  errors.address
                    ? 'border-red-soft bg-red-light'
                    : 'border-gray-300 bg-white'
                }`}
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-soft">{errors.address}</p>
              )}
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isPending}
                className="w-full"
                size="lg"
              >
                {isPending ? 'Creating your account...' : 'Complete Registration'}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-green-deep hover:underline"
            >
              Sign in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
