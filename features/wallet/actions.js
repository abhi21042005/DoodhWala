'use server';

// server action for prepaid wallet top-up
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { topupSchema } from '@/lib/schemas';
import { revalidatePath } from 'next/cache';

export async function topupAction(prevState, formData) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: 'You must be logged in to top up your wallet.' };
  }

  const rawAmount = formData.get ? Number(formData.get('amount')) : Number(formData.amount);
  const parsed = topupSchema.safeParse({ amount: rawAmount });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || 'Invalid top-up amount.',
    };
  }

  const { amount } = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: session.userId },
      });

      if (!user) {
        throw new Error('User account not found');
      }

      const balanceAfter = Math.round((user.walletBalance + amount) * 100) / 100;

      await tx.user.update({
        where: { id: user.id },
        data: { walletBalance: balanceAfter },
      });

      const transaction = await tx.walletTransaction.create({
        data: {
          userId: user.id,
          type: 'CREDIT',
          amount,
          balanceAfter,
          description: `Prepaid wallet top-up (simulated payment)`,
        },
      });

      return { balanceAfter, transaction };
    });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/wallet');
    return { success: true, balanceAfter: result.balanceAfter };
  } catch (error) {
    console.error('Top-up error:', error);
    return { success: false, error: 'Payment processing failed. Please try again.' };
  }
}
