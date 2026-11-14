// unit tests for core pure business functions using Node.js built-in test runner
// run with: node --test tests/utils.test.js
const { test, describe } = require('node:test');
const assert = require('node:assert');

// pure logic functions mirror
function calcDayAmount(litres, pricePerLitre) {
  return Math.round(litres * pricePerLitre * 100) / 100;
}

function calcMonthlyEstimate(planDays, pricePerLitre) {
  const weeklyTotal = planDays.reduce((sum, day) => {
    return sum + calcDayAmount(day.litres, pricePerLitre);
  }, 0);
  return Math.round(weeklyTotal * 4.33 * 100) / 100;
}

function estimateDaysLeft(balance, planDays, pricePerLitre) {
  if (!planDays || planDays.length === 0) return 0;
  const activeDays = planDays.filter((d) => d.litres > 0);
  if (activeDays.length === 0) return 0;
  const avgDayCost =
    activeDays.reduce((sum, d) => sum + calcDayAmount(d.litres, pricePerLitre), 0) /
    activeDays.length;
  if (avgDayCost === 0) return Infinity;
  return Math.floor(balance / avgDayCost);
}

function pausesOverlap(from1, to1, from2, to2) {
  const a = new Date(from1); a.setHours(0,0,0,0);
  const b = new Date(to1); b.setHours(0,0,0,0);
  const c = new Date(from2); c.setHours(0,0,0,0);
  const d = new Date(to2); d.setHours(0,0,0,0);
  return !(c > b || a > d);
}

function isPaused(date, pauses) {
  if (!pauses || pauses.length === 0) return false;
  const d = new Date(date); d.setHours(0,0,0,0);
  return pauses.some((p) => {
    const from = new Date(p.fromDate); from.setHours(0,0,0,0);
    const to = new Date(p.toDate); to.setHours(0,0,0,0);
    return d >= from && d <= to;
  });
}

function canEditDay(targetDate, simulatedNow) {
  const now = simulatedNow ? new Date(simulatedNow) : new Date();
  const dayBefore = new Date(targetDate);
  dayBefore.setDate(dayBefore.getDate() - 1);
  dayBefore.setHours(22, 0, 0, 0);
  return now < dayBefore;
}

describe('Business Rules & Pure Function Unit Tests', () => {
  test('calcDayAmount calculates litres x price rounded to 2 decimals', () => {
    assert.strictEqual(calcDayAmount(1.5, 62), 93);
    assert.strictEqual(calcDayAmount(2.0, 85), 170);
    assert.strictEqual(calcDayAmount(0.5, 62), 31);
    assert.strictEqual(calcDayAmount(0, 85), 0);
  });

  test('calcMonthlyEstimate calculates 4.33 weeks monthly projection', () => {
    // 1L every day at Rs 62 = 7L/week = 434/week * 4.33 = 1879.22
    const days = [0, 1, 2, 3, 4, 5, 6].map((w) => ({ weekday: w, litres: 1 }));
    const estimate = calcMonthlyEstimate(days, 62);
    assert.strictEqual(estimate, 1879.22);
  });

  test('estimateDaysLeft calculates remaining days before balance depletion', () => {
    const days = [0, 1, 2, 3, 4, 5, 6].map((w) => ({ weekday: w, litres: 1 }));
    // Rs 620 balance with 1L/day at Rs 62 = 10 days
    assert.strictEqual(estimateDaysLeft(620, days, 62), 10);
    // Rs 30 balance with 1L/day at Rs 62 = 0 days
    assert.strictEqual(estimateDaysLeft(30, days, 62), 0);
  });

  test('pausesOverlap correctly detects overlapping date ranges', () => {
    // Range 1: 10 Nov - 15 Nov
    // Range 2: 14 Nov - 18 Nov (overlaps on 14, 15)
    assert.strictEqual(pausesOverlap('2026-11-10', '2026-11-15', '2026-11-14', '2026-11-18'), true);

    // Range 3: 16 Nov - 20 Nov (no overlap)
    assert.strictEqual(pausesOverlap('2026-11-10', '2026-11-15', '2026-11-16', '2026-11-20'), false);

    // Exact same range
    assert.strictEqual(pausesOverlap('2026-11-10', '2026-11-15', '2026-11-10', '2026-11-15'), true);
  });

  test('isPaused returns true only for dates inside an active pause range', () => {
    const pauses = [
      { fromDate: '2026-11-20', toDate: '2026-11-25' },
    ];

    assert.strictEqual(isPaused('2026-11-22', pauses), true);
    assert.strictEqual(isPaused('2026-11-20', pauses), true);
    assert.strictEqual(isPaused('2026-11-25', pauses), true);
    assert.strictEqual(isPaused('2026-11-19', pauses), false);
    assert.strictEqual(isPaused('2026-11-26', pauses), false);
  });

  test('canEditDay strictly enforces 10:00 PM cutoff on the previous day', () => {
    const targetDate = '2026-11-20T06:00:00'; // delivery morning

    // previous day at 9:59 PM (before cutoff) -> can edit
    const beforeCutoff = '2026-11-19T21:59:00';
    assert.strictEqual(canEditDay(targetDate, beforeCutoff), true);

    // previous day at 10:01 PM (after cutoff) -> cannot edit
    const afterCutoff = '2026-11-19T22:01:00';
    assert.strictEqual(canEditDay(targetDate, afterCutoff), false);
  });
});
