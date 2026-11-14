'use client';

// Rendering Strategy: CSR (Client-Side Rendering)
// Relies on React Query state management, optimistic UI updates, and interactive date forms.

import { useQuery, useQueryClient } from '@tanstack/react-query';
import PauseForm from '@/features/pause/PauseForm';
import ActivePausesList from '@/features/pause/ActivePausesList';

export default function PausePage() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['pauses'],
    queryFn: async () => {
      const res = await fetch('/api/pauses');
      if (!res.ok) throw new Error('Failed to load pauses');
      return res.json();
    },
  });

  const refreshPauses = () => {
    queryClient.invalidateQueries({ queryKey: ['pauses'] });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-gray-900">
          Pause Subscription
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Going out of town or taking a break? Pause deliveries for any date range with zero charges.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <PauseForm onCreated={refreshPauses} />
        </div>

        <div className="lg:col-span-7 space-y-6">
          {isLoading ? (
            <div className="p-8 text-center bg-white rounded-xl border border-gray-200">
              <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-green-deep animate-spin mx-auto mb-2" />
              <p className="text-xs text-gray-500">Loading your pauses...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-light border border-red-soft rounded-xl text-red-soft text-sm">
              Failed to load pause history. Please try again.
            </div>
          ) : (
            <ActivePausesList
              pauses={data?.pauses || []}
              onUpdated={refreshPauses}
            />
          )}

          {/* Pause Policy Reminder */}
          <div className="p-4 rounded-xl border border-gray-200 bg-cream-dark text-xs text-gray-700 space-y-1.5">
            <strong className="block text-gray-900">Important Pause Policies:</strong>
            <p>• Paused mornings are completely free of charge; your wallet is never debited.</p>
            <p>• Any pause starting tomorrow morning must be scheduled before <strong>10:00 PM IST tonight</strong>.</p>
            <p>• If your trip ends earlier than anticipated, simply click &ldquo;Resume Early&rdquo; above.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
