'use client';

// weekly quantity grid component
// INT252 Requirement: Functional component with props, lifting state up to the parent
import { WEEKDAY_LABELS } from '@/lib/dates';
import { LITRE_STEP, MAX_LITRES } from '@/lib/money';

export default function WeeklyGrid({ days, onChangeDay }) {
  const handleStep = (weekday, delta) => {
    const current = days.find((d) => d.weekday === weekday)?.litres ?? 0;
    const next = Math.max(0, Math.min(MAX_LITRES, Math.round((current + delta) * 10) / 10));
    onChangeDay(weekday, next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold font-serif text-gray-800">
          Weekly Delivery Schedule (0.5 L steps)
        </label>
        <span className="text-xs text-gray-500">Max {MAX_LITRES} L/day</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-7 gap-2.5">
        {WEEKDAY_LABELS.map((dayLabel, index) => {
          const dayData = days.find((d) => d.weekday === index);
          const litres = dayData?.litres ?? 0;
          const isZero = litres === 0;

          return (
            <div
              key={dayLabel}
              className={`p-3 rounded-xl border flex flex-col items-center justify-between text-center transition-all ${
                isZero
                  ? 'bg-gray-50 border-gray-200 opacity-75'
                  : 'bg-white border-green-mid/40 shadow-sm'
              }`}
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                {dayLabel}
              </span>

              {/* Litre readout */}
              <div className="my-2">
                <span
                  className={`text-xl font-bold font-mono ${
                    isZero ? 'text-gray-400' : 'text-green-deep'
                  }`}
                >
                  {litres.toFixed(1)}
                </span>
                <span className="text-[11px] text-gray-500 ml-0.5">L</span>
              </div>

              {/* 0.5 Step Controls */}
              <div className="flex items-center gap-1.5 w-full justify-center">
                <button
                  type="button"
                  onClick={() => handleStep(index, -LITRE_STEP)}
                  disabled={litres <= 0}
                  className="w-7 h-7 rounded-full bg-cream-dark text-gray-700 hover:bg-gray-300 disabled:opacity-30 disabled:hover:bg-cream-dark flex items-center justify-center text-sm font-bold transition-colors focus-visible:outline-2"
                  aria-label={`Decrease ${dayLabel} quantity`}
                >
                  -
                </button>

                <button
                  type="button"
                  onClick={() => handleStep(index, LITRE_STEP)}
                  disabled={litres >= MAX_LITRES}
                  className="w-7 h-7 rounded-full bg-green-light text-green-deep hover:bg-green-mid hover:text-white disabled:opacity-30 flex items-center justify-center text-sm font-bold transition-colors focus-visible:outline-2"
                  aria-label={`Increase ${dayLabel} quantity`}
                >
                  +
                </button>
              </div>

              {isZero && (
                <span className="text-[10px] text-gray-400 mt-1">No milk</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
