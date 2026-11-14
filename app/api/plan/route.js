import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import prisma from '@/lib/prisma';

// route handler: GET /api/plan
// returns current user's milk subscription, 7-day quantities, and product catalog
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const products = await prisma.milkProduct.findMany({
      where: { active: true },
      orderBy: { pricePerLitre: 'asc' },
    });

    const subscription = await prisma.subscription.findFirst({
      where: { userId: session.userId },
      include: {
        product: true,
        days: {
          orderBy: { weekday: 'asc' },
        },
      },
    });

    // ensure 7 days are always represented (0 to 6)
    const daysMap = {};
    if (subscription?.days) {
      subscription.days.forEach((d) => {
        daysMap[d.weekday] = d.litres;
      });
    }

    const fullDays = [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({
      weekday,
      litres: daysMap[weekday] ?? 1.0,
    }));

    return NextResponse.json({
      products,
      subscription: subscription
        ? {
            id: subscription.id,
            productId: subscription.productId,
            status: subscription.status,
            product: subscription.product,
            days: fullDays,
          }
        : null,
    });
  } catch (error) {
    console.error('Error fetching plan:', error);
    return NextResponse.json({ error: 'Failed to fetch plan' }, { status: 500 });
  }
}
