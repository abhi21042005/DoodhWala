'use client';

// month grid component with semantic ARIA grid roles and Mon-Sun layout
import { WEEKDAY_LABELS } from '@/lib/dates';
import DayCell from './DayCell';

export default function MonthGrid({ days, onSelectDay, selectedDay }) {
  if (!days || days.length === 0) {
    return <div className="p-8 text-center text-sm text-gray-500">Loading month dates...</div>;
  }

  // first day of the month determines leading empty offset (0=Mon, 6=Sun)
  const firstDayWeekday = days[0].weekday;
  const emptyLeadingCells = Array.from({ length: firstDayWeekday });

  return (
    <div className="space-y-2">
      {/* Weekday column headers */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center" role="row">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            role="columnheader"
            className="text-xs font-semibold uppercase tracking-wider text-gray-500 py-2"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div
        role="grid"
        aria-label="Delivery Calendar"
        className="grid grid-cols-7 gap-1 sm:gap-2"
      >
        {/* Leading blank slots */}
        {emptyLeadingCells.map((_, idx) => (
          <DayCell key={`empty-${idx}`} day={null} />
        ))}

        {/* Days of the month */}
        {days.map((day) => (
          <DayCell
            key={day.date}
            day={day}
            onSelect={onSelectDay}
            isSelected={selectedDay?.date === day.date}
          />
        ))}
      </div>
    </div>
  );
}
