'use client';

// Rendering Strategy: CSR (Client-Side Rendering)
// Combines month-grid calendar, query param navigation, 10 PM countdown timer, Zustand store, and lazy-loaded modal.

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import MonthGrid from '@/features/calendar/MonthGrid';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useCutoffTimer } from '@/features/calendar/useCutoffTimer';
import { useUiStore } from '@/stores/uiStore';
import { formatMonth, addMonths, subMonths, formatMonthParam, parseISO } from '@/lib/dates';
import { format } from 'date-fns';

// INT257 Requirement: dynamic import / lazy loading for the calendar modal
const DayModal = dynamic(() => import('@/features/calendar/DayModal'), {
  ssr: false,
  loading: () => null,
});

export default function CalendarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const currentMonthParam = searchParams.get('month') || format(new Date(), 'yyyy-MM');
  const [currentDate, setCurrentDate] = useState(() => parseISO(`${currentMonthParam}-01`));
  const [selectedDay, setSelectedDay] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // INT252 Requirement: custom hook with setInterval cleanup for 10 PM countdown
  const cutoffTimer = useCutoffTimer();

  // Zustand store for selected month
  const setSelectedMonthInStore = useUiStore((s) => s.setSelectedMonth);

  useEffect(() => {
    setSelectedMonthInStore(currentMonthParam);
  }, [currentMonthParam, setSelectedMonthInStore]);

  // fetch month deliveries
  const { data, isLoading } = useQuery({
    queryKey: ['deliveries', currentMonthParam],
    queryFn: async () => {
      const res = await fetch(`/api/deliveries?month=${currentMonthParam}`);
      if (!res.ok) throw new Error('Failed to load deliveries');
      return res.json();
    },
  });

  const handleMonthChange = (delta) => {
    const nextDate = delta > 0 ? addMonths(currentDate, 1) : subMonths(currentDate, 1);
    const param = formatMonthParam(nextDate);
    setCurrentDate(nextDate);
    router.push(`/dashboard/calendar?month=${param}`);
  };

  const handleSelectDay = (day) => {
    setSelectedDay(day);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header with cutoff timer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-gray-900">
            Delivery Calendar
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Tap any upcoming day to adjust quantity or skip delivery.
          </p>
        </div>

        {/* Cutoff Countdown Banner */}
        <div className="bg-cream-dark border border-gray-300 rounded-xl px-4 py-2 text-right">
          <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 block">
            Tomorrow Cutoff Timer
          </span>
          <span
            className={`text-xs font-mono font-bold ${
              cutoffTimer.isPassed ? 'text-terracotta' : 'text-green-deep'
            }`}
          >
            {cutoffTimer.text}
          </span>
        </div>
      </div>

      {/* Month Navigator Toolbar */}
      <Card className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => handleMonthChange(-1)}
            className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-cream-dark text-xs font-semibold text-gray-700 transition-colors"
            aria-label="Previous Month"
          >
            ← Previous
          </button>

          <h2 className="text-lg sm:text-xl font-bold font-serif text-gray-900">
            {formatMonth(currentDate)}
          </h2>

          <button
            onClick={() => handleMonthChange(1)}
            className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-cream-dark text-xs font-semibold text-gray-700 transition-colors"
            aria-label="Next Month"
          >
            Next →
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 py-2 px-3 bg-gray-50 rounded-lg text-xs text-gray-600 mb-4">
          <span className="font-semibold text-gray-700">Legend:</span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-green-mid" /> Delivered
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-milk" /> Scheduled
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-terracotta" /> Paused
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-400" /> Skipped
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-soft" /> Missed
          </span>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-green-deep animate-spin mx-auto mb-2" />
            <p className="text-xs text-gray-500">Loading delivery dates...</p>
          </div>
        ) : (
          <MonthGrid
            days={data?.days || []}
            onSelectDay={handleSelectDay}
            selectedDay={selectedDay}
          />
        )}
      </Card>

      {/* Lazy-loaded Day Modal */}
      {modalOpen && selectedDay && (
        <DayModal
          day={selectedDay}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onUpdated={() => {
            queryClient.invalidateQueries({ queryKey: ['deliveries'] });
            queryClient.invalidateQueries({ queryKey: ['wallet'] });
          }}
        />
      )}
    </div>
  );
}
