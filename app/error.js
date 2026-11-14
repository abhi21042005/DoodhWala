'use client';

// global error boundary for app router
import { useEffect } from 'react';
import Button from '@/components/ui/Button';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
      <div className="w-12 h-12 rounded-full bg-red-light text-red-soft flex items-center justify-center font-bold text-lg mb-4">
        !
      </div>
      <h2 className="text-xl font-bold font-serif text-gray-900 mb-2">
        Something went wrong
      </h2>
      <p className="text-sm text-gray-600 mb-6">
        {error?.message || 'An unexpected error occurred while loading this page.'}
      </p>
      <div className="flex gap-3">
        <Button onClick={() => reset()} variant="primary">
          Try Again
        </Button>
        <Button onClick={() => (window.location.href = '/')} variant="secondary">
          Go Home
        </Button>
      </div>
    </div>
  );
}
