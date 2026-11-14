'use server';

// server actions for dairy product administration
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { productUpdateSchema } from '@/lib/schemas';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function updateProductPriceAction(productId, newPrice) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized: Admin role required' };
  }

  const parsed = productUpdateSchema.safeParse({ pricePerLitre: Number(newPrice) });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || 'Invalid price per litre.',
    };
  }

  try {
    const updated = await prisma.milkProduct.update({
      where: { id: productId },
      data: { pricePerLitre: parsed.data.pricePerLitre },
    });

    // Next.js caching revalidation requirement
    revalidatePath('/plans');
    revalidatePath('/admin/products');
    revalidatePath('/dashboard/planner');

    return { success: true, product: updated };
  } catch (error) {
    console.error('Update price error:', error);
    return { success: false, error: 'Failed to update product price.' };
  }
}
