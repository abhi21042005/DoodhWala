'use server';

// server actions for skipping a day or updating a single future day's milk quantity
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { startOfDay, parseISO, canEditDay } from '@/lib/dates';
import { calcDayAmount } from '@/lib/money';
import { revalidatePath } from 'next/cache';

export async function skipDayAction(dateStr) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  const targetDate = startOfDay(parseISO(dateStr));

  if (!canEditDay(targetDate)) {
    return {
      success: false,
      error: 'Order cutoff passed. Tomorrow’s delivery can only be skipped before 10:00 PM tonight.',
    };
  }

  try {
    const sub = await prisma.subscription.findFirst({
      where: { userId: session.userId, status: 'ACTIVE' },
      include: { product: true },
    });

    if (!sub) return { success: false, error: 'No active subscription found.' };

    await prisma.delivery.upsert({
      where: {
        subscriptionId_date: {
          subscriptionId: sub.id,
          date: targetDate,
        },
      },
      update: {
        status: 'SKIPPED',
        litres: 0,
        amount: 0,
        note: 'Skipped by customer before 10 PM cutoff',
      },
      create: {
        subscriptionId: sub.id,
        date: targetDate,
        status: 'SKIPPED',
        litres: 0,
        amount: 0,
        note: 'Skipped by customer before 10 PM cutoff',
      },
    });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/calendar');
    return { success: true };
  } catch (error) {
    console.error('Skip day error:', error);
    return { success: false, error: 'Failed to skip delivery.' };
  }
}

export async function updateDayQuantityAction(dateStr, litres) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  const targetDate = startOfDay(parseISO(dateStr));

  if (!canEditDay(targetDate)) {
    return {
      success: false,
      error: 'Order cutoff passed. Quantity can only be adjusted before 10:00 PM the night before.',
    };
  }

  const numLitres = Number(litres);
  if (isNaN(numLitres) || numLitres < 0 || numLitres > 5) {
    return { success: false, error: 'Litres must be between 0 and 5.0 L.' };
  }

  try {
    const sub = await prisma.subscription.findFirst({
      where: { userId: session.userId, status: 'ACTIVE' },
      include: { product: true },
    });

    if (!sub) return { success: false, error: 'No active subscription found.' };

    const amount = calcDayAmount(numLitres, sub.product.pricePerLitre);
    const status = numLitres === 0 ? 'SKIPPED' : 'SCHEDULED';

    await prisma.delivery.upsert({
      where: {
        subscriptionId_date: {
          subscriptionId: sub.id,
          date: targetDate,
        },
      },
      update: {
        status,
        litres: numLitres,
        amount,
        note: 'Customer customized day quantity',
      },
      create: {
        subscriptionId: sub.id,
        date: targetDate,
        status,
        litres: numLitres,
        amount,
        note: 'Customer customized day quantity',
      },
    });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/calendar');
    return { success: true };
  } catch (error) {
    console.error('Update day quantity error:', error);
    return { success: false, error: 'Failed to update day quantity.' };
  }
}
