'use server';

// server actions for pausing and resuming milk delivery
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { pauseSchema } from '@/lib/schemas';
import { pausesOverlap, startOfDay, parseISO, canEditDay } from '@/lib/dates';
import { revalidatePath } from 'next/cache';

export async function createPauseAction(prevState, formData) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: 'Please log in to pause deliveries.' };
  }

  const raw = {
    fromDate: formData.get ? formData.get('fromDate') : formData.fromDate,
    toDate: formData.get ? formData.get('toDate') : formData.toDate,
    reason: formData.get ? formData.get('reason') : formData.reason,
  };

  const parsed = pauseSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || 'Invalid pause dates.',
    };
  }

  const { fromDate: fromStr, toDate: toStr, reason } = parsed.data;
  const fromDate = startOfDay(parseISO(fromStr));
  const toDate = startOfDay(parseISO(toStr));
  const today = startOfDay(new Date());

  if (fromDate < today) {
    return { success: false, error: 'Cannot set a pause date in the past.' };
  }

  if (!canEditDay(fromDate)) {
    return {
      success: false,
      error: 'Order cutoff passed. Changes for tomorrow morning must be submitted before 10:00 PM tonight.',
    };
  }

  try {
    const sub = await prisma.subscription.findFirst({
      where: { userId: session.userId, status: 'ACTIVE' },
    });

    if (!sub) {
      return { success: false, error: 'No active subscription found to pause.' };
    }

    const existingPauses = await prisma.pause.findMany({
      where: { subscriptionId: sub.id },
    });

    for (const ep of existingPauses) {
      if (pausesOverlap(fromDate, toDate, ep.fromDate, ep.toDate)) {
        return {
          success: false,
          error: 'This date range overlaps with an existing pause. Please cancel or modify your other pause first.',
        };
      }
    }

    await prisma.pause.create({
      data: {
        subscriptionId: sub.id,
        fromDate,
        toDate,
        reason: reason || 'Personal / Out of Station',
      },
    });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/pause');
    revalidatePath('/dashboard/calendar');
    return { success: true };
  } catch (error) {
    console.error('Error creating pause:', error);
    return { success: false, error: 'Database error occurred while setting pause.' };
  }
}

export async function resumeEarlyAction(pauseId) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const pause = await prisma.pause.findUnique({
      where: { id: pauseId },
      include: { subscription: true },
    });

    if (!pause || pause.subscription.userId !== session.userId) {
      return { success: false, error: 'Pause record not found.' };
    }

    const today = startOfDay(new Date());
    if (today < pause.fromDate) {
      await prisma.pause.delete({ where: { id: pauseId } });
    } else {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (yesterday < pause.fromDate) {
        await prisma.pause.delete({ where: { id: pauseId } });
      } else {
        await prisma.pause.update({
          where: { id: pauseId },
          data: { toDate: yesterday },
        });
      }
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/pause');
    revalidatePath('/dashboard/calendar');
    return { success: true };
  } catch (error) {
    console.error('Resume early error:', error);
    return { success: false, error: 'Failed to resume early.' };
  }
}

export async function cancelPauseAction(pauseId) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const pause = await prisma.pause.findUnique({
      where: { id: pauseId },
      include: { subscription: true },
    });

    if (!pause || pause.subscription.userId !== session.userId) {
      return { success: false, error: 'Pause record not found.' };
    }

    await prisma.pause.delete({ where: { id: pauseId } });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/pause');
    revalidatePath('/dashboard/calendar');
    return { success: true };
  } catch (error) {
    console.error('Cancel pause error:', error);
    return { success: false, error: 'Failed to cancel pause.' };
  }
}
