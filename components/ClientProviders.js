'use client';

// client providers: react-query, auth context, toast notification container
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/features/auth/AuthContext';
import Toast from '@/components/ui/Toast';
import { useState } from 'react';

export default function ClientProviders({ initialUser, children }) {
  // ensure queryClient is stable across renders in client component
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider initialUser={initialUser}>
        {children}
        <Toast />
      </AuthProvider>
    </QueryClientProvider>
  );
}
