import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian phone number'),
  email: z.string().email('Enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
  area: z.string().min(2, 'Please select or enter your area'),
  address: z.string().min(5, 'Address should be at least 5 characters'),
});

export const loginSchema = z.object({
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit phone number'),
  password: z.string().min(1, 'Password is required'),
});

export const topupSchema = z.object({
  amount: z
    .number({ invalid_type_error: 'Enter a valid amount' })
    .min(100, 'Minimum top-up is Rs 100')
    .max(10000, 'Maximum top-up is Rs 10,000 per transaction'),
});

export const pauseSchema = z.object({
  fromDate: z.string().min(1, 'Start date is required'),
  toDate: z.string().min(1, 'End date is required'),
  reason: z.string().optional(),
}).refine(
  (data) => new Date(data.toDate) >= new Date(data.fromDate),
  { message: 'End date must be on or after start date', path: ['toDate'] }
);

export const planDaySchema = z.object({
  weekday: z.number().min(0).max(6),
  litres: z
    .number()
    .min(0, 'Litres cannot be negative')
    .max(5, 'Maximum 5 litres per day')
    .multipleOf(0.5, 'Use 0.5 litre steps'),
});

export const planSchema = z.object({
  productId: z.string().min(1, 'Please select a milk type'),
  days: z.array(planDaySchema).length(7, 'Plan must have all 7 days'),
});

export const productUpdateSchema = z.object({
  pricePerLitre: z
    .number({ invalid_type_error: 'Enter a valid price' })
    .min(10, 'Price must be at least Rs 10')
    .max(500, 'Price cannot exceed Rs 500'),
});

export const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  area: z.string().min(2, 'Area is required'),
  address: z.string().min(5, 'Address too short'),
});
