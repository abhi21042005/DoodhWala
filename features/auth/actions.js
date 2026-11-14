'use server';

// server actions for user registration, login, and logout
// using zod validation, bcryptjs password hashing, and jose jwt cookie session

import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { createSession, destroySession } from '@/lib/session';
import { registerSchema, loginSchema } from '@/lib/schemas';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function registerAction(prevState, formData) {
  const raw = {
    name: formData.get('name'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    password: formData.get('password'),
    area: formData.get('area'),
    address: formData.get('address'),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    const errors = {};
    parsed.error.errors.forEach((err) => {
      const field = err.path[0];
      if (!errors[field]) errors[field] = err.message;
    });
    return { success: false, errors, values: raw };
  }

  const { name, phone, email, password, area, address } = parsed.data;

  // check if phone or email is already taken
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ phone }, { email }],
    },
  });

  if (existing) {
    const errorMsg =
      existing.phone === phone
        ? 'This phone number is already registered. Try logging in.'
        : 'This email is already in use.';
    return {
      success: false,
      errors: { form: errorMsg },
      values: raw,
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // default milk product for quick start (Desi Cow)
  const defaultProduct = await prisma.milkProduct.findFirst({
    where: { active: true },
  });

  const user = await prisma.user.create({
    data: {
      name,
      phone,
      email,
      passwordHash,
      role: 'CUSTOMER',
      area,
      address,
      walletBalance: 0,
      subscriptions: defaultProduct
        ? {
            create: {
              productId: defaultProduct.id,
              status: 'ACTIVE',
              days: {
                create: [0, 1, 2, 3, 4, 5, 6].map((day) => ({
                  weekday: day,
                  litres: 1.0, // default 1L every day
                })),
              },
            },
          }
        : undefined,
    },
  });

  await createSession(user);
  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function loginAction(prevState, formData) {
  const raw = {
    phone: formData.get('phone'),
    password: formData.get('password'),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    const errors = {};
    parsed.error.errors.forEach((err) => {
      const field = err.path[0];
      if (!errors[field]) errors[field] = err.message;
    });
    return { success: false, errors, values: raw };
  }

  const { phone, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { phone },
  });

  if (!user) {
    return {
      success: false,
      errors: { form: 'No account found with this phone number.' },
      values: raw,
    };
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return {
      success: false,
      errors: { form: 'Incorrect password. Please try again.' },
      values: raw,
    };
  }

  await createSession(user);
  revalidatePath('/', 'layout');

  if (user.role === 'ADMIN') {
    redirect('/admin');
  } else {
    redirect('/dashboard');
  }
}

export async function logoutAction() {
  await destroySession();
  revalidatePath('/', 'layout');
  redirect('/login');
}
