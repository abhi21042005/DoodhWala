// direct visit page for a specific calendar date (when not intercepted by the client modal)
// provides a full dedicated page for inspecting and modifying a single morning's delivery

import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { formatRupees, calcDayAmount } from '@/lib/money';
import { formatDateFull, startOfDay, parseISO, canEditDay, isPaused, jsToAppWeekday } from '@/lib/dates';
import { redirect } from 'next/navigation';

export async function generateMetadata({ params }) {
  const { date } = await params;
  return {
    title: `Delivery Details for ${date}`,
    description: `Manage milk quantity, pause status, and delivery notes for ${date}.`,
  };
}

export default async function CalendarDateDirectPage({ params }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const { date: dateStr } = await params;
  let targetDate;
  try {
    targetDate = startOfDay(parseISO(dateStr));
  } catch {
    redirect('/dashboard/calendar');
  }

  const sub = await prisma.subscription.findFirst({
    where: { userId: session.userId, status: 'ACTIVE' },
    include: { product: true, days: true, pauses: true },
  });

  if (!sub) redirect('/dashboard/planner');

  const explicit = await prisma.delivery.findUnique({
    where: {
      subscriptionId_date: {
        subscriptionId: sub.id,
        date: targetDate,
      },
    },
  });

  const appWeekday = jsToAppWeekday(targetDate.getDay());
  const planDay = sub.days.find((d) => d.weekday === appWeekday);
  const paused = isPaused(targetDate, sub.pauses);
  const editable = canEditDay(targetDate);

  const litres = explicit ? explicit.litres : (paused ? 0 : planDay?.litres ?? 0);
  const status = explicit ? explicit.status : (paused ? 'PAUSED' : litres > 0 ? 'SCHEDULED' : 'OFF');
  const amount = explicit ? explicit.amount : calcDayAmount(litres, sub.product.pricePerLitre);

  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
      <Link
        href="/dashboard/calendar"
        className="text-xs text-green-deep font-semibold hover:underline inline-flex items-center gap-1"
      >
        ← Back to Month Calendar
      </Link>

      <Card className="p-6 space-y-5">
        <div className="border-b border-gray-100 pb-4">
          <span className="text-xs font-mono uppercase tracking-wider text-gray-500">
            Delivery Details
          </span>
          <h1 className="text-2xl font-bold font-serif text-gray-900 mt-1">
            {formatDateFull(targetDate)}
          </h1>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-1 border-b border-gray-50">
            <span className="text-gray-500">Status</span>
            <span className="font-semibold">{status}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-50">
            <span className="text-gray-500">Quantity</span>
            <span className="font-mono font-bold text-gray-900">{litres} Litres</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-50">
            <span className="text-gray-500">Milk Variety</span>
            <span className="font-medium text-gray-900">{sub.product.name}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-50">
            <span className="text-gray-500">Rate</span>
            <span className="font-mono">{formatRupees(sub.product.pricePerLitre)}/L</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-700 font-semibold">Total Amount</span>
            <span className="font-mono font-bold text-green-deep text-base">
              {formatRupees(amount)}
            </span>
          </div>
        </div>

        <div className="pt-2">
          {editable ? (
            <p className="text-xs text-green-mid">
              Orders for this day can be customized from the Month Calendar modal before 10:00 PM tonight.
            </p>
          ) : (
            <p className="text-xs text-gray-500">
              Orders for this date are locked because the 10:00 PM cutoff has passed.
            </p>
          )}
        </div>

        <Link href="/dashboard/calendar" className="block pt-2">
          <Button variant="secondary" className="w-full">
            Return to Calendar
          </Button>
        </Link>
      </Card>
    </div>
  );
}
