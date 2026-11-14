'use client';

// Rendering Strategy: CSR (Client-Side Rendering)
// The planner relies on interactive client state, 0.5 L controls, and React Query caching.

import { useQuery, useQueryClient } from '@tanstack/react-query';
import PlannerForm from '@/features/planner/PlannerForm';

export default function PlannerPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['plan'],
    queryFn: async () => {
      const res = await fetch('/api/plan');
      if (!res.ok) throw new Error('Failed to load subscription plan');
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-green-deep animate-spin mb-2" />
        <p className="text-xs text-gray-500">Loading your plan...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-red-light border border-red-soft rounded-xl text-red-soft text-sm">
        {error?.message || 'Could not load your plan. Please refresh.'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-gray-900">
          Weekly Quantity Planner
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Customize how much milk you want delivered on each day of the week.
        </p>
      </div>

      <PlannerForm
        initialData={data}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ['plan'] })}
      />
    </div>
  );
}
