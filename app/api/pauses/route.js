import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import prisma from '@/lib/prisma';
import { pausesOverlap, startOfDay, parseISO, canEditDay } from '@/lib/dates';
import { pauseSchema } from '@/lib/schemas';

// GET /api/pauses - list current user's pauses
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const subscription = await prisma.subscription.findFirst({
      where: { userId: session.userId, status: 'ACTIVE' },
    });

    if (!subscription) {
      return NextResponse.json({ pauses: [] });
    }

    const pauses = await prisma.pause.findMany({
      where: { subscriptionId: subscription.id },
      orderBy: { fromDate: 'desc' },
    });

    return NextResponse.json({ pauses });
  } catch (error) {
    console.error('Error fetching pauses:', error);
    return NextResponse.json({ error: 'Failed to fetch pauses' }, { status: 500 });
  }
}

// POST /api/pauses - create a new pause with overlap checking and 10 PM cutoff
export async function POST(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = pauseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Invalid pause dates.' },
        { status: 400 }
      );
    }

    const { fromDate: fromStr, toDate: toStr, reason } = parsed.data;
    const fromDate = startOfDay(parseISO(fromStr));
    const toDate = startOfDay(parseISO(toStr));
    const today = startOfDay(new Date());

    // cannot pause dates in the past
    if (fromDate < today) {
      return NextResponse.json(
        { error: 'Cannot set a pause starting in the past.' },
        { status: 400 }
      );
    }

    // if pausing from tomorrow, must be before 10 PM IST tonight
    if (!canEditDay(fromDate)) {
      return NextResponse.json(
        {
          error:
            'Order cutoff passed. Changes for tomorrow morning must be made before 10:00 PM tonight.',
        },
        { status: 400 }
      );
    }

    const subscription = await prisma.subscription.findFirst({
      where: { userId: session.userId, status: 'ACTIVE' },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'No active subscription found to pause.' },
        { status: 404 }
      );
    }

    // check for overlapping pauses
    const existingPauses = await prisma.pause.findMany({
      where: { subscriptionId: subscription.id },
    });

    for (const ep of existingPauses) {
      if (pausesOverlap(fromDate, toDate, ep.fromDate, ep.toDate)) {
        return NextResponse.json(
          {
            error:
              'This date range overlaps with an existing pause. Please cancel or modify your other pause first.',
          },
          { status: 400 }
        );
      }
    }

    const newPause = await prisma.pause.create({
      data: {
        subscriptionId: subscription.id,
        fromDate,
        toDate,
        reason: reason || 'Personal / Travel',
      },
    });

    return NextResponse.json({ pause: newPause, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating pause:', error);
    return NextResponse.json({ error: 'Failed to create pause' }, { status: 500 });
  }
}
