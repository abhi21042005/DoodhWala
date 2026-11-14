import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import prisma from '@/lib/prisma';
import {
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isPaused,
  jsToAppWeekday,
  startOfDay,
  canEditDay,
} from '@/lib/dates';
import { format } from 'date-fns';

// GET /api/deliveries?month=YYYY-MM
// returns complete monthly delivery status grid combining:
// 1. Explicit delivery records from DB
// 2. Active pause intervals
// 3. Weekly recurring plan defaults
export async function GET(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const monthParam = searchParams.get('month') || format(new Date(), 'yyyy-MM');

  try {
    const targetDate = parseISO(`${monthParam}-01`);
    const monthStart = startOfMonth(targetDate);
    const monthEnd = endOfMonth(targetDate);

    // fetch subscriber's active subscription, product, plan days, and pauses
    const sub = await prisma.subscription.findFirst({
      where: { userId: session.userId, status: 'ACTIVE' },
      include: {
        product: true,
        days: true,
        pauses: true,
      },
    });

    if (!sub) {
      return NextResponse.json({
        month: monthParam,
        days: [],
        product: null,
      });
    }

    // fetch all explicit deliveries for this month
    const explicitDeliveries = await prisma.delivery.findMany({
      where: {
        subscriptionId: sub.id,
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });

    const deliveryMap = {};
    explicitDeliveries.forEach((del) => {
      const dateKey = format(del.date, 'yyyy-MM-dd');
      deliveryMap[dateKey] = del;
    });

    // map plan days: weekday (0-6) -> litres
    const planDaysMap = {};
    sub.days.forEach((d) => {
      planDaysMap[d.weekday] = d.litres;
    });

    // build complete list of all days in the month
    const allDaysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const today = startOfDay(new Date());

    const resultDays = allDaysInMonth.map((dayDate) => {
      const dateStr = format(dayDate, 'yyyy-MM-dd');
      const appWeekday = jsToAppWeekday(dayDate.getDay());
      const plannedLitres = planDaysMap[appWeekday] ?? 0;
      const paused = isPaused(dayDate, sub.pauses);
      const explicit = deliveryMap[dateStr];
      const isPast = dayDate < today;
      const isToday = dayDate.getTime() === today.getTime();
      const editable = canEditDay(dayDate);

      let status = 'SCHEDULED';
      let litres = plannedLitres;
      let amount = Math.round(litres * sub.product.pricePerLitre * 100) / 100;
      let deliveryId = explicit?.id || null;

      if (explicit) {
        status = explicit.status;
        litres = explicit.litres;
        amount = explicit.amount;
      } else if (paused) {
        status = 'PAUSED';
        litres = 0;
        amount = 0;
      } else if (plannedLitres === 0) {
        status = 'OFF';
        litres = 0;
        amount = 0;
      } else if (isPast) {
        // past day with no explicit delivery record
        status = 'DELIVERED';
      }

      return {
        date: dateStr,
        dayNumber: dayDate.getDate(),
        weekday: appWeekday,
        status,
        litres,
        amount,
        deliveryId,
        isToday,
        isPast,
        canEdit: editable,
        pricePerLitre: sub.product.pricePerLitre,
      };
    });

    return NextResponse.json({
      month: monthParam,
      days: resultDays,
      product: sub.product,
    });
  } catch (error) {
    console.error('Error fetching delivery calendar:', error);
    return NextResponse.json({ error: 'Failed to fetch calendar' }, { status: 500 });
  }
}
