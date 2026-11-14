'use client';

// memoized calendar day cell component
// INT252 Requirement: React.memo to avoid re-rendering 31 cells when only one cell or countdown changes
import React from 'react';

const STATUS_STYLES = {
  DELIVERED: {
    bg: 'bg-green-light/40 border-green-mid/40 text-green-deep',
    badge: 'bg-green-light text-green-deep',
    label: 'Delivered',
  },
  SCHEDULED: {
    bg: 'bg-white border-gray-200 text-gray-800',
    badge: 'bg-blue-milk-light text-gray-700',
    label: 'Scheduled',
  },
  PAUSED: {
    bg: 'bg-terracotta-light/20 border-terracotta/30 text-terracotta',
    badge: 'bg-terracotta-light text-terracotta',
    label: 'Paused',
  },
  SKIPPED: {
    bg: 'bg-gray-50 border-gray-200 text-gray-400',
    badge: 'bg-gray-100 text-gray-500',
    label: 'Skipped',
  },
  MISSED: {
    bg: 'bg-red-light/40 border-red-soft/40 text-red-soft',
    badge: 'bg-red-light text-red-soft',
    label: 'Missed (Low Balance)',
  },
  FAILED: {
    bg: 'bg-red-light border-red-soft text-red-soft',
    badge: 'bg-red-light text-red-soft',
    label: 'Failed',
  },
  OFF: {
    bg: 'bg-gray-50/50 border-gray-100 text-gray-300',
    badge: 'bg-gray-100 text-gray-400',
    label: 'No milk',
  },
};

const DayCell = React.memo(function DayCell({ day, onSelect, isSelected }) {
  if (!day) {
    // empty filler cell for month alignment
    return (
      <div
        role="gridcell"
        aria-hidden="true"
        className="min-h-[70px] sm:min-h-[85px] bg-gray-50/30 rounded-lg border border-transparent"
      />
    );
  }

  const { dayNumber, status, litres, isToday, canEdit, date } = day;
  const style = STATUS_STYLES[status] || STATUS_STYLES.SCHEDULED;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(day);
    }
  };

  return (
    <div
      role="gridcell"
      tabIndex={0}
      aria-label={`${date}: ${litres} litres, status ${style.label}${isToday ? ', Today' : ''}`}
      onClick={() => onSelect(day)}
      onKeyDown={handleKeyDown}
      className={`min-h-[70px] sm:min-h-[85px] p-2 rounded-xl border flex flex-col justify-between cursor-pointer transition-all focus-visible:outline-2 focus-visible:outline-green-deep ${
        style.bg
      } ${
        isToday ? 'ring-2 ring-green-deep font-bold' : ''
      } ${
        isSelected ? 'ring-2 ring-terracotta shadow-md' : 'hover:border-gray-400'
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-xs font-mono font-semibold ${
            isToday
              ? 'bg-green-deep text-white w-5 h-5 rounded-full flex items-center justify-center'
              : 'text-gray-700'
          }`}
        >
          {dayNumber}
        </span>

        {canEdit && (
          <span
            className="w-1.5 h-1.5 rounded-full bg-green-mid"
            title="Editable before 10 PM cutoff"
          />
        )}
      </div>

      <div className="my-1">
        <span className="text-base sm:text-lg font-bold font-mono">
          {litres > 0 ? `${litres} L` : '—'}
        </span>
      </div>

      <span
        className={`text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider px-1 py-0.5 rounded truncate ${style.badge}`}
      >
        {style.label}
      </span>
    </div>
  );
});

export default DayCell;
