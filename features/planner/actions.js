'use server';

// server action to update customer milk subscription and 7-day quantity plan
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { planSchema } from '@/lib/schemas';
import { revalidatePath } from 'next/cache';

export async function savePlanAction(payload) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: 'You must be logged in to update your plan.' };
  }

  const parsed = planSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || 'Invalid plan data submitted.',
    };
  }

  const { productId, days } = parsed.data;

  try {
    // verify product exists and is active
    const product = await prisma.milkProduct.findUnique({
      where: { id: productId },
    });
    if (!product || !product.active) {
      return { success: false, error: 'Selected milk product is not available.' };
    }

    // execute atomic update
    await prisma.$transaction(async (tx) => {
      // find or create subscription
      let sub = await tx.subscription.findFirst({
        where: { userId: session.userId },
      });

      if (!sub) {
        sub = await tx.subscription.create({
          data: {
            userId: session.userId,
            productId,
            status: 'ACTIVE',
          },
        });
      } else {
        sub = await tx.subscription.update({
          where: { id: sub.id },
          data: {
            productId,
            status: 'ACTIVE',
          },
        });
      }

      // upsert all 7 days
      for (const day of days) {
        await tx.planDay.upsert({
          where: {
            subscriptionId_weekday: {
              subscriptionId: sub.id,
              weekday: day.weekday,
            },
          },
          update: {
            litres: day.litres,
          },
          create: {
            subscriptionId: sub.id,
            weekday: day.weekday,
            litres: day.litres,
          },
        });
      }
    });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/planner');
    revalidatePath('/dashboard/calendar');
    return { success: true };
  } catch (error) {
    console.error('Failed to save plan:', error);
    return { success: false, error: 'Database error occurred while saving your plan.' };
  }
}
