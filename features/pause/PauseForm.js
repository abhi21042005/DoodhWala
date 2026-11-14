'use client';

// date range form for pausing subscription with quick duration presets and zod validation
import { useState, useTransition } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { format, addDays, nextSaturday, nextSunday } from 'date-fns';
import { pauseSchema } from '@/lib/schemas';
import { createPauseAction } from './actions';
import { useUiStore } from '@/stores/uiStore';

export default function PauseForm({ onCreated }) {
  const tomorrow = addDays(new Date(), 1);
  const dayAfterTomorrow = addDays(new Date(), 3);

  const [fromDate, setFromDate] = useState(format(tomorrow, 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(dayAfterTomorrow, 'yyyy-MM-dd'));
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const addToast = useUiStore((s) => s.addToast);

  const applyPreset = (presetType) => {
    setError('');
    const now = new Date();
    if (presetType === 'weekend') {
      const sat = nextSaturday(now);
      const sun = nextSunday(sat);
      setFromDate(format(sat, 'yyyy-MM-dd'));
      setToDate(format(sun, 'yyyy-MM-dd'));
      setReason('Weekend trip');
    } else if (presetType === '3days') {
      const start = addDays(now, 1);
      const end = addDays(now, 3);
      setFromDate(format(start, 'yyyy-MM-dd'));
      setToDate(format(end, 'yyyy-MM-dd'));
      setReason('Out of town for 3 days');
    } else if (presetType === '1week') {
      const start = addDays(now, 1);
      const end = addDays(now, 7);
      setFromDate(format(start, 'yyyy-MM-dd'));
      setToDate(format(end, 'yyyy-MM-dd'));
      setReason('Family vacation (1 week)');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const parsed = pauseSchema.safeParse({ fromDate, toDate, reason });
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message || 'Invalid date range.');
      return;
    }

    startTransition(async () => {
      const res = await createPauseAction(null, { fromDate, toDate, reason });
      if (res.success) {
        addToast('Delivery pause scheduled. Paused days will not be billed.', 'success');
        setReason('');
        if (onCreated) onCreated();
      } else {
        setError(res.error || 'Failed to pause deliveries.');
        addToast(res.error || 'Failed to pause', 'error');
      }
    });
  };

  return (
    <Card className="p-5 sm:p-6">
      <h2 className="text-lg font-bold font-serif text-gray-900 mb-1">
        Pause Your Delivery
      </h2>
      <p className="text-xs text-gray-600 mb-4">
        Going away or have enough milk? Select dates to pause. You will not be charged.
      </p>

      {error && (
        <div
          role="alert"
          className="mb-4 p-3 rounded-lg bg-red-light border border-red-soft text-sm text-red-soft"
        >
          {error}
        </div>
      )}

      {/* Presets */}
      <div className="mb-4">
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
          Quick Suggestions
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => applyPreset('weekend')}
            className="px-2.5 py-1 rounded-md text-xs font-medium border border-gray-300 bg-white hover:bg-cream-dark transition-colors"
          >
            Upcoming Weekend
          </button>
          <button
            type="button"
            onClick={() => applyPreset('3days')}
            className="px-2.5 py-1 rounded-md text-xs font-medium border border-gray-300 bg-white hover:bg-cream-dark transition-colors"
          >
            Next 3 Days
          </button>
          <button
            type="button"
            onClick={() => applyPreset('1week')}
            className="px-2.5 py-1 rounded-md text-xs font-medium border border-gray-300 bg-white hover:bg-cream-dark transition-colors"
          >
            1 Week Vacation
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Pause From Date"
            id="fromDate"
            type="date"
            min={format(new Date(), 'yyyy-MM-dd')}
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            required
          />

          <Input
            label="Pause Through (End Date)"
            id="toDate"
            type="date"
            min={fromDate}
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            required
          />
        </div>

        <Input
          label="Reason (Optional)"
          id="reason"
          placeholder="e.g. Visiting relatives in Ludhiana, festival"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <div className="pt-2">
          <Button
            type="submit"
            size="lg"
            variant="primary"
            disabled={isPending}
            className="w-full"
          >
            {isPending ? 'Scheduling Pause...' : 'Confirm Pause Dates'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
