// Rendering Strategy: SSR (Dynamic Server-Side Rendering)
// Fetches the subscriber's current status, active subscription, today's delivery, and 7-day forecast.

import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { formatRupees, calcDayAmount, estimateDaysLeft } from '@/lib/money';
import { jsToAppWeekday, isPaused, formatDate, canEditDay } from '@/lib/dates';
import { addDays, startOfDay } from 'date-fns';

export const metadata = {
  title: 'Dashboard Overview',
  description: 'View your milk delivery status, upcoming 7 days, and wallet balance.',
};

export default async function DashboardOverviewPage() {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      subscriptions: {
        where: { status: 'ACTIVE' },
        include: {
          product: true,
          days: true,
          pauses: true,
        },
      },
    },
  });

  const activeSub = user?.subscriptions[0];
  const today = startOfDay(new Date());

  // fetch or calculate today's delivery status
  let todayDelivery = null;
  if (activeSub) {
    todayDelivery = await prisma.delivery.findUnique({
      where: {
        subscriptionId_date: {
          subscriptionId: activeSub.id,
          date: today,
        },
      },
    });
  }

  // today's scheduled litres from plan if no explicit delivery record yet
  const todayAppWeekday = jsToAppWeekday(today.getDay());
  const todayPlanDay = activeSub?.days.find((d) => d.weekday === todayAppWeekday);
  const isTodayPaused = activeSub ? isPaused(today, activeSub.pauses) : false;

  const todayLitres = todayDelivery ? todayDelivery.litres : (isTodayPaused ? 0 : todayPlanDay?.litres ?? 0);
  const todayStatus = todayDelivery
    ? todayDelivery.status
    : isTodayPaused
    ? 'PAUSED'
    : todayLitres > 0
    ? 'SCHEDULED'
    : 'NO DELIVERY';

  // calculate next 7 days forecast
  const next7Days = [];
  for (let i = 0; i < 7; i++) {
    const targetDate = addDays(today, i);
    const appWeekday = jsToAppWeekday(targetDate.getDay());
    const dayPlan = activeSub?.days.find((d) => d.weekday === appWeekday);
    const paused = activeSub ? isPaused(targetDate, activeSub.pauses) : false;

    // check if there is an explicit delivery override in DB
    let explicitDelivery = null;
    if (activeSub) {
      explicitDelivery = await prisma.delivery.findUnique({
        where: {
          subscriptionId_date: {
            subscriptionId: activeSub.id,
            date: targetDate,
          },
        },
      });
    }

    const litres = explicitDelivery ? explicitDelivery.litres : (paused ? 0 : dayPlan?.litres ?? 0);
    const status = explicitDelivery
      ? explicitDelivery.status
      : paused
      ? 'PAUSED'
      : litres > 0
      ? 'SCHEDULED'
      : 'OFF';

    next7Days.push({
      date: targetDate,
      weekday: appWeekday,
      litres,
      status,
      canEdit: canEditDay(targetDate),
    });
  }

  const daysLeft = activeSub?.product
    ? estimateDaysLeft(user?.walletBalance ?? 0, activeSub.days, activeSub.product.pricePerLitre)
    : 0;

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-gray-900">
            Sat Sri Akal, {user?.name}
          </h1>
          <p className="text-sm text-gray-600 mt-0.5">
            Delivering to {user?.area} • {activeSub?.product?.name || 'No active plan'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/calendar">
            <Button variant="secondary" size="sm">
              View Calendar
            </Button>
          </Link>
          <Link href="/dashboard/wallet">
            <Button variant="primary" size="sm">
              Add Money
            </Button>
          </Link>
        </div>
      </div>

      {/* Top 3 KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Today's Delivery Card */}
        <Card className="p-5 border-l-4 border-l-green-deep">
          <span className="text-xs font-mono uppercase tracking-wider text-gray-500 font-semibold block">
            Today’s Milk ({formatDate(today)})
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-serif text-gray-900">
              {todayLitres} L
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                todayStatus === 'DELIVERED'
                  ? 'bg-green-light text-green-deep'
                  : todayStatus === 'PAUSED'
                  ? 'bg-terracotta-light text-terracotta'
                  : todayStatus === 'SCHEDULED'
                  ? 'bg-blue-milk-light text-gray-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {todayStatus}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {todayStatus === 'DELIVERED'
              ? 'Bottles dropped in your milk bag.'
              : 'Delivery round runs 5:30 AM – 7:00 AM.'}
          </p>
        </Card>

        {/* Wallet Balance Card */}
        <Card className="p-5 border-l-4 border-l-green-mid">
          <span className="text-xs font-mono uppercase tracking-wider text-gray-500 font-semibold block">
            Wallet Balance
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-serif text-green-deep">
              {formatRupees(user?.walletBalance ?? 0)}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Estimated {daysLeft === Infinity ? '30+' : daysLeft} days of milk left
          </p>
        </Card>

        {/* Subscription Plan Card */}
        <Card className="p-5 border-l-4 border-l-terracotta">
          <span className="text-xs font-mono uppercase tracking-wider text-gray-500 font-semibold block">
            Subscribed Milk
          </span>
          <div className="mt-2">
            <span className="text-lg font-bold font-serif text-gray-900 block truncate">
              {activeSub?.product?.name || 'Not Configured'}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-gray-500">
              {activeSub ? `${formatRupees(activeSub.product.pricePerLitre)} / L` : '—'}
            </span>
            <Link
              href="/dashboard/planner"
              className="text-green-deep font-semibold hover:underline"
            >
              Edit plan →
            </Link>
          </div>
        </Card>
      </div>

      {/* Next 7 Days Forecast */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold font-serif text-gray-900">
              Upcoming 7-Day Schedule
            </h2>
            <p className="text-xs text-gray-500">
              Cutoff to edit any upcoming morning is 10:00 PM the night before.
            </p>
          </div>
          <Link
            href="/dashboard/calendar"
            className="text-xs text-green-deep font-semibold hover:underline hidden sm:block"
          >
            Open Full Month Calendar →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-7 gap-2.5">
          {next7Days.map((day, idx) => {
            const isToday = idx === 0;
            return (
              <div
                key={day.date.toISOString()}
                className={`p-3 rounded-xl border text-center flex flex-col justify-between ${
                  isToday
                    ? 'border-green-deep bg-green-light/30'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div>
                  <span className="text-[11px] font-mono font-semibold uppercase text-gray-500 block">
                    {isToday ? 'Today' : formatDate(day.date)}
                  </span>
                  <div className="my-2">
                    <span className="text-xl font-bold font-mono text-gray-900">
                      {day.litres}
                    </span>
                    <span className="text-xs text-gray-500 ml-0.5">L</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    day.status === 'DELIVERED'
                      ? 'bg-green-light text-green-deep'
                      : day.status === 'PAUSED'
                      ? 'bg-terracotta-light text-terracotta'
                      : day.status === 'SCHEDULED'
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-gray-50 text-gray-400'
                  }`}
                >
                  {day.status}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
