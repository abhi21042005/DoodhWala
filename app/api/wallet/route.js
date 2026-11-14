import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import prisma from '@/lib/prisma';
import { estimateDaysLeft } from '@/lib/money';

// route handler: GET /api/wallet
// returns current user's balance, transaction ledger, and days-of-milk-left projection
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        walletBalance: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const transactions = await prisma.walletTransaction.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // fetch subscription to calculate days left estimate
    const sub = await prisma.subscription.findFirst({
      where: { userId: session.userId, status: 'ACTIVE' },
      include: {
        product: true,
        days: true,
      },
    });

    const daysLeft = sub?.product
      ? estimateDaysLeft(user.walletBalance, sub.days, sub.product.pricePerLitre)
      : 0;

    return NextResponse.json({
      balance: user.walletBalance,
      daysLeft,
      transactions,
      product: sub?.product || null,
    });
  } catch (error) {
    console.error('Wallet fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch wallet' }, { status: 500 });
  }
}
