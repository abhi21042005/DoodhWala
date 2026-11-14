import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import prisma from '@/lib/prisma';
import { startOfDay } from 'date-fns';

// DELETE /api/pauses/[id] - cancel a pause
export async function DELETE(request, { params }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const pause = await prisma.pause.findUnique({
      where: { id },
      include: { subscription: true },
    });

    if (!pause || pause.subscription.userId !== session.userId) {
      return NextResponse.json({ error: 'Pause record not found' }, { status: 404 });
    }

    await prisma.pause.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Pause cancelled' });
  } catch (error) {
    console.error('Delete pause error:', error);
    return NextResponse.json({ error: 'Failed to cancel pause' }, { status: 500 });
  }
}

// PATCH /api/pauses/[id] - resume subscription early
export async function PATCH(request, { params }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const pause = await prisma.pause.findUnique({
      where: { id },
      include: { subscription: true },
    });

    if (!pause || pause.subscription.userId !== session.userId) {
      return NextResponse.json({ error: 'Pause record not found' }, { status: 404 });
    }

    const today = startOfDay(new Date());

    if (today < pause.fromDate) {
      // pause hasn't even started yet: simply delete it
      await prisma.pause.delete({ where: { id } });
    } else {
      // currently active pause: end it as of yesterday so deliveries resume tomorrow
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (yesterday < pause.fromDate) {
        // pause was just created for today: delete it
        await prisma.pause.delete({ where: { id } });
      } else {
        await prisma.pause.update({
          where: { id },
          data: { toDate: yesterday },
        });
      }
    }

    return NextResponse.json({ success: true, message: 'Subscription resumed early' });
  } catch (error) {
    console.error('Resume early error:', error);
    return NextResponse.json({ error: 'Failed to resume early' }, { status: 500 });
  }
}
