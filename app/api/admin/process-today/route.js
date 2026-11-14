import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import prisma from '@/lib/prisma';
import { jsToAppWeekday, startOfDay, isPaused } from '@/lib/dates';
import { calcDayAmount } from '@/lib/money';

// POST /api/admin/process-today
// executes daily delivery fulfillment batch inside a single atomic Prisma transaction
export async function POST() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
  }

  const today = startOfDay(new Date());
  const appWeekday = jsToAppWeekday(today.getDay());

  try {
    const summary = await prisma.$transaction(async (tx) => {
      // 1. fetch all active subscriptions with product, user, plan days, and active pauses
      const activeSubscriptions = await tx.subscription.findMany({
        where: { status: 'ACTIVE' },
        include: {
          user: true,
          product: true,
          days: true,
          pauses: true,
        },
      });

      let deliveredCount = 0;
      let missedCount = 0;
      let pausedCount = 0;
      let skippedCount = 0;
      let alreadyDeliveredCount = 0;

      for (const sub of activeSubscriptions) {
        // check if delivery record already exists for today
        const existingDelivery = await tx.delivery.findUnique({
          where: {
            subscriptionId_date: {
              subscriptionId: sub.id,
              date: today,
            },
          },
        });

        // if already processed as DELIVERED, do not double-debit
        if (existingDelivery && existingDelivery.status === 'DELIVERED') {
          alreadyDeliveredCount++;
          continue;
        }

        // check if subscriber has an active pause covering today
        const isTodayPaused = isPaused(today, sub.pauses);
        if (isTodayPaused) {
          await tx.delivery.upsert({
            where: {
              subscriptionId_date: {
                subscriptionId: sub.id,
                date: today,
              },
            },
            update: {
              status: 'PAUSED',
              litres: 0,
              amount: 0,
              note: 'Subscriber paused delivery',
            },
            create: {
              subscriptionId: sub.id,
              date: today,
              status: 'PAUSED',
              litres: 0,
              amount: 0,
              note: 'Subscriber paused delivery',
            },
          });
          pausedCount++;
          continue;
        }

        // check if customer explicitly skipped today
        if (existingDelivery && existingDelivery.status === 'SKIPPED') {
          skippedCount++;
          continue;
        }

        // get planned litres for today (or explicit override if set)
        const planDay = sub.days.find((d) => d.weekday === appWeekday);
        const litres = existingDelivery ? existingDelivery.litres : (planDay?.litres ?? 0);

        if (litres <= 0) {
          await tx.delivery.upsert({
            where: {
              subscriptionId_date: {
                subscriptionId: sub.id,
                date: today,
              },
            },
            update: { status: 'OFF', litres: 0, amount: 0 },
            create: {
              subscriptionId: sub.id,
              date: today,
              status: 'OFF',
              litres: 0,
              amount: 0,
            },
          });
          skippedCount++;
          continue;
        }

        const amount = calcDayAmount(litres, sub.product.pricePerLitre);

        // check subscriber's wallet balance
        const currentUser = await tx.user.findUnique({
          where: { id: sub.user.id },
        });

        if (!currentUser || currentUser.walletBalance < amount) {
          // insufficient balance: mark MISSED, do not deduct wallet, never allow negative balance!
          await tx.delivery.upsert({
            where: {
              subscriptionId_date: {
                subscriptionId: sub.id,
                date: today,
              },
            },
            update: {
              status: 'MISSED',
              litres,
              amount,
              note: `Insufficient balance (₹${currentUser?.walletBalance.toFixed(2) ?? 0} < ₹${amount.toFixed(2)})`,
            },
            create: {
              subscriptionId: sub.id,
              date: today,
              status: 'MISSED',
              litres,
              amount,
              note: `Insufficient balance (₹${currentUser?.walletBalance.toFixed(2) ?? 0} < ₹${amount.toFixed(2)})`,
            },
          });
          missedCount++;
        } else {
          // sufficient balance: deduct wallet and record transaction
          const newBalance = Math.round((currentUser.walletBalance - amount) * 100) / 100;

          await tx.user.update({
            where: { id: currentUser.id },
            data: { walletBalance: newBalance },
          });

          await tx.walletTransaction.create({
            data: {
              userId: currentUser.id,
              type: 'DEBIT',
              amount,
              balanceAfter: newBalance,
              description: `Milk delivery: ${litres} L ${sub.product.name}`,
            },
          });

          await tx.delivery.upsert({
            where: {
              subscriptionId_date: {
                subscriptionId: sub.id,
                date: today,
              },
            },
            update: {
              status: 'DELIVERED',
              litres,
              amount,
              note: 'Delivered and debited in daily batch',
            },
            create: {
              subscriptionId: sub.id,
              date: today,
              status: 'DELIVERED',
              litres,
              amount,
              note: 'Delivered and debited in daily batch',
            },
          });

          deliveredCount++;
        }
      }

      return {
        total: activeSubscriptions.length,
        delivered: deliveredCount,
        missed: missedCount,
        paused: pausedCount,
        skipped: skippedCount,
        alreadyDelivered: alreadyDeliveredCount,
      };
    });

    return NextResponse.json({
      success: true,
      message: `Processed today's batch: ${summary.delivered} delivered, ${summary.missed} missed (low balance), ${summary.paused} paused.`,
      summary,
    });
  } catch (error) {
    console.error('Process today error:', error);
    return NextResponse.json(
      { error: 'Failed to process deliveries: ' + (error?.message || String(error)) },
      { status: 500 }
    );
  }
}
