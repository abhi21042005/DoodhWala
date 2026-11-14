'use client';

// list of active & scheduled pause ranges with React 19 optimistic UI updates
import { useOptimistic, useTransition } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatDateFull, startOfDay, parseISO } from '@/lib/dates';
import { resumeEarlyAction, cancelPauseAction } from './actions';
import { useUiStore } from '@/stores/uiStore';

export default function ActivePausesList({ pauses, onUpdated }) {
  const addToast = useUiStore((s) => s.addToast);
  const [isPending, startTransition] = useTransition();

  // INT257 Requirement: Optimistic UI update for pause/resume toggle
  const [optimisticPauses, setOptimisticPauses] = useOptimistic(
    pauses,
    (currentList, removedId) => currentList.filter((p) => p.id !== removedId)
  );

  const today = startOfDay(new Date());

  const handleResumeEarly = (pauseId) => {
    startTransition(async () => {
      setOptimisticPauses(pauseId);
      const res = await resumeEarlyAction(pauseId);
      if (res.success) {
        addToast('Subscription resumed early! Milk deliveries will continue.', 'success');
        if (onUpdated) onUpdated();
      } else {
        addToast(res.error || 'Failed to resume early', 'error');
        if (onUpdated) onUpdated();
      }
    });
  };

  const handleCancelPause = (pauseId) => {
    startTransition(async () => {
      setOptimisticPauses(pauseId);
      const res = await cancelPauseAction(pauseId);
      if (res.success) {
        addToast('Pause cancelled successfully.', 'success');
        if (onUpdated) onUpdated();
      } else {
        addToast(res.error || 'Failed to cancel pause', 'error');
        if (onUpdated) onUpdated();
      }
    });
  };

  if (!optimisticPauses || optimisticPauses.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-gray-500">No active or upcoming pauses.</p>
        <p className="text-xs text-gray-400 mt-1">
          Your regular morning milk delivery is running according to your planner schedule.
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <Card.Header>
        <span className="font-serif font-bold text-gray-900">
          Your Scheduled Pauses
        </span>
      </Card.Header>

      <div className="divide-y divide-gray-100">
        {optimisticPauses.map((pause) => {
          const from = startOfDay(
            typeof pause.fromDate === 'string' ? parseISO(pause.fromDate) : pause.fromDate
          );
          const to = startOfDay(
            typeof pause.toDate === 'string' ? parseISO(pause.toDate) : pause.toDate
          );

          const isCurrentlyActive = today >= from && today <= to;
          const isUpcoming = today < from;
          const isPast = today > to;

          return (
            <div
              key={pause.id}
              className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                isCurrentlyActive ? 'bg-terracotta-light/20' : 'bg-white'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isCurrentlyActive
                        ? 'bg-terracotta text-white'
                        : isUpcoming
                        ? 'bg-blue-milk-light text-gray-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {isCurrentlyActive
                      ? 'Currently Paused'
                      : isUpcoming
                      ? 'Upcoming Pause'
                      : 'Past Pause'}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">
                    ID: {pause.id.slice(0, 8)}
                  </span>
                </div>

                <p className="text-base font-bold font-serif text-gray-900">
                  {formatDateFull(from)} — {formatDateFull(to)}
                </p>

                {pause.reason && (
                  <p className="text-xs text-gray-600 italic">
                    &ldquo;{pause.reason}&rdquo;
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                {isCurrentlyActive && (
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={isPending}
                    onClick={() => handleResumeEarly(pause.id)}
                  >
                    Resume Early
                  </Button>
                )}

                {(isCurrentlyActive || isUpcoming) && (
                  <Button
                    size="sm"
                    variant="danger"
                    disabled={isPending}
                    onClick={() => handleCancelPause(pause.id)}
                  >
                    Cancel Pause
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
