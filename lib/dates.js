// pure functions for date math
// weekday: 0 = monday ... 6 = sunday (our app convention, matches ISO)
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isWithinInterval,
  parseISO,
  addMonths,
  subMonths,
  isBefore,
  isAfter,
  startOfDay,
  setHours,
  setMinutes,
  setSeconds,
} from 'date-fns';

// convert JS getDay() (0=sun) to our weekday (0=mon)
export const jsToAppWeekday = (jsDay) => (jsDay === 0 ? 6 : jsDay - 1);

// convert our weekday (0=mon) to JS getDay() (0=sun)
export const appToJsWeekday = (appDay) => (appDay === 6 ? 0 : appDay + 1);

export const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const WEEKDAY_LABELS_HI = ['सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि', 'रवि'];

export const formatDate = (date) => format(date, 'd MMM');
export const formatDateFull = (date) => format(date, 'd MMM yyyy');
export const formatMonth = (date) => format(date, 'MMMM yyyy');
export const formatMonthParam = (date) => format(date, 'yyyy-MM');

export const getDaysInMonth = (date) => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return eachDayOfInterval({ start, end });
};

// get the app weekday for a given date
export const getWeekdayForDate = (date) => jsToAppWeekday(getDay(date));

// check if a date falls within any pause range
export const isPaused = (date, pauses) => {
  if (!pauses || pauses.length === 0) return false;
  const d = startOfDay(date);
  return pauses.some((p) => {
    const from = startOfDay(typeof p.fromDate === 'string' ? parseISO(p.fromDate) : p.fromDate);
    const to = startOfDay(typeof p.toDate === 'string' ? parseISO(p.toDate) : p.toDate);
    return isWithinInterval(d, { start: from, end: to });
  });
};

// cutoff: can edit a day only if current time < 10pm IST the day before
// we work in IST (UTC+5:30) throughout
export const canEditDay = (targetDate) => {
  const now = new Date();
  // cutoff is 10pm IST on the previous day
  const dayBefore = new Date(targetDate);
  dayBefore.setDate(dayBefore.getDate() - 1);
  const cutoff = setSeconds(setMinutes(setHours(dayBefore, 22), 0), 0);
  return isBefore(now, cutoff);
};

// get time remaining until cutoff for a target date (in ms)
export const getTimeUntilCutoff = (targetDate) => {
  const now = new Date();
  const dayBefore = new Date(targetDate);
  dayBefore.setDate(dayBefore.getDate() - 1);
  const cutoff = setSeconds(setMinutes(setHours(dayBefore, 22), 0), 0);
  return cutoff.getTime() - now.getTime();
};

// check if two pause ranges overlap
export const pausesOverlap = (from1, to1, from2, to2) => {
  const a = startOfDay(typeof from1 === 'string' ? parseISO(from1) : from1);
  const b = startOfDay(typeof to1 === 'string' ? parseISO(to1) : to1);
  const c = startOfDay(typeof from2 === 'string' ? parseISO(from2) : from2);
  const d = startOfDay(typeof to2 === 'string' ? parseISO(to2) : to2);
  return !(isAfter(c, b) || isAfter(a, d));
};

export { addMonths, subMonths, startOfMonth, endOfMonth, parseISO, format, startOfDay, isBefore, isAfter };
