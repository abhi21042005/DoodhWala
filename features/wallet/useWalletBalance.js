'use client';

// custom hook: useWalletBalance
// INT252 Requirement: Custom Hook integrating React Query caching, derived state, and refresh helpers
import { useQuery } from '@tanstack/react-query';

export function useWalletBalance() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const res = await fetch('/api/wallet');
      if (!res.ok) {
        throw new Error('Failed to load wallet data');
      }
      return res.json();
    },
    refetchInterval: 30000, // refresh in background every 30 seconds
  });

  return {
    balance: data?.balance ?? 0,
    daysLeft: data?.daysLeft ?? 0,
    transactions: data?.transactions ?? [],
    product: data?.product ?? null,
    isLoading,
    isError: !!error,
    error: error?.message,
    refetch,
  };
}
