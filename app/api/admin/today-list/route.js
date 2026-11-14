import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import prisma from '@/lib/prisma';
import { jsToAppWeekday, startOfDay, isPaused, formatDate } from '@/lib/dates';

// GET /api/admin/today-list
// fetches all customer drops for today, grouped by area
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized: Admin required' }, { status: 403 });
  }

  const today = startOfDay(new Date());
  const appWeekday = jsToAppWeekday(today.getDay());

  try {
    const subscriptions = await prisma.subscription.findMany({
      where: { status: 'ACTIVE' },
      include: {
        user: true,
        product: true,
        days: true,
        pauses: true,
        deliveries: {
          where: { date: today },
        },
      },
    });

    const areas = {};
    let totalLitres = 0;
    let deliveredCount = 0;
    let missedCount = 0;
    let pausedCount = 0;

    for (const sub of subscriptions) {
      const area = sub.user.area || 'Other Areas';
      if (!areas[area]) areas[area] = [];

      const explicit = sub.deliveries[0];
      const paused = isPaused(today, sub.pauses);
      const planDay = sub.days.find((d) => d.weekday === appWeekday);

      let litres = explicit ? explicit.litres : (paused ? 0 : planDay?.litres ?? 0);
      let status = explicit ? explicit.status : (paused ? 'PAUSED' : litres > 0 ? 'SCHEDULED' : 'OFF');

      if (status === 'DELIVERED') deliveredCount++;
      if (status === 'MISSED' || status === 'FAILED') missedCount++;
      if (status === 'PAUSED') pausedCount++;
      totalLitres += litres;

      areas[area].push({
        subscriptionId: sub.id,
        deliveryId: explicit?.id || null,
        userId: sub.user.id,
        userName: sub.user.name,
        userPhone: sub.user.phone,
        userAddress: sub.user.address,
        userBalance: sub.user.walletBalance,
        productName: sub.product.name,
        litres,
        status,
        proofUrl: explicit?.proofUrl || null,
        note: explicit?.note || '',
      });
    }

    return NextResponse.json({
      areas,
      totals: {
        totalLitres: Math.round(totalLitres * 10) / 10,
        deliveredCount,
        missedCount,
        pausedCount,
        formattedDate: formatDate(today),
      },
    });
  } catch (error) {
    console.error('Error fetching today list:', error);
    return NextResponse.json({ error: 'Failed to fetch list' }, { status: 500 });
  }
}
