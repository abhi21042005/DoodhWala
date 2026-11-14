'use client';

// modal / details panel for a selected calendar day
import { useState, useEffect, useTransition } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { formatRupees, LITRE_STEP, MAX_LITRES, calcDayAmount } from '@/lib/money';
import { formatDateFull } from '@/lib/dates';
import { skipDayAction, updateDayQuantityAction } from './actions';
import { useUiStore } from '@/stores/uiStore';

export default function DayModal({ day, isOpen, onClose, onUpdated }) {
  const [litres, setLitres] = useState(day?.litres ?? 1.0);
  const [isPending, startTransition] = useTransition();
  const addToast = useUiStore((s) => s.addToast);

  useEffect(() => {
    if (day) {
      setLitres(day.litres);
    }
  }, [day]);

  if (!day) return null;

  const dateObj = new Date(day.date);
  const formattedDate = formatDateFull(dateObj);
  const projectedAmount = calcDayAmount(litres, day.pricePerLitre || 62);

  const handleStep = (delta) => {
    setLitres((prev) =>
      Math.max(0, Math.min(MAX_LITRES, Math.round((prev + delta) * 10) / 10))
    );
  };

  const handleSaveQuantity = () => {
    startTransition(async () => {
      const res = await updateDayQuantityAction(day.date, litres);
      if (res.success) {
        addToast(`Updated ${formattedDate} to ${litres} L.`, 'success');
        onClose();
        if (onUpdated) onUpdated();
      } else {
        addToast(res.error || 'Failed to update day', 'error');
      }
    });
  };

  const handleSkipDay = () => {
    startTransition(async () => {
      const res = await skipDayAction(day.date);
      if (res.success) {
        addToast(`Delivery skipped for ${formattedDate}.`, 'success');
        onClose();
        if (onUpdated) onUpdated();
      } else {
        addToast(res.error || 'Failed to skip day', 'error');
      }
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={formattedDate}>
      <div className="space-y-5">
        {/* Current status overview */}
        <div className="p-3 bg-cream-dark rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-500 uppercase font-mono block">
              Current Status
            </span>
            <span className="text-sm font-bold font-serif text-gray-900">
              {day.status}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-gray-500 uppercase font-mono block">
              Est. Cost
            </span>
            <span className="text-sm font-bold font-mono text-green-deep">
              {formatRupees(day.amount)}
            </span>
          </div>
        </div>

        {day.canEdit ? (
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Adjust Litres For This Day (0.5 L steps)
              </label>

              <div className="flex items-center justify-center gap-4 py-3 bg-white border border-gray-200 rounded-xl">
                <button
                  type="button"
                  onClick={() => handleStep(-LITRE_STEP)}
                  disabled={litres <= 0}
                  className="w-9 h-9 rounded-full bg-cream-dark text-gray-700 hover:bg-gray-300 disabled:opacity-30 text-lg font-bold flex items-center justify-center"
                >
                  -
                </button>

                <div className="text-center min-w-[70px]">
                  <span className="text-2xl font-bold font-mono text-green-deep">
                    {litres.toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">L</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleStep(LITRE_STEP)}
                  disabled={litres >= MAX_LITRES}
                  className="w-9 h-9 rounded-full bg-green-light text-green-deep hover:bg-green-mid hover:text-white disabled:opacity-30 text-lg font-bold flex items-center justify-center"
                >
                  +
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-2">
                {litres} L × {formatRupees(day.pricePerLitre || 62)}/L = <strong>{formatRupees(projectedAmount)}</strong>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                variant="primary"
                disabled={isPending}
                onClick={handleSaveQuantity}
                className="flex-1"
              >
                {isPending ? 'Saving...' : 'Save Quantity'}
              </Button>

              <Button
                variant="danger"
                disabled={isPending}
                onClick={handleSkipDay}
              >
                Skip This Day
              </Button>
            </div>

            <p className="text-[11px] text-gray-500 text-center">
              Cutoff: Tonight by 10:00 PM IST
            </p>
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded-xl text-center space-y-1">
            <p className="text-xs font-semibold text-gray-700">
              Orders Locked for this Date
            </p>
            <p className="text-[11px] text-gray-500">
              Changes must be submitted before 10:00 PM on the night before delivery.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
