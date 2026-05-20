import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(3, 'Username is required'),

  email: z.email('Invalid email'),

  phoneNumber: z.string()
    .min(1, 'Phone number is required')
    .transform(val => val.startsWith('+') ? val : `+${val}`)
    .refine(val => /^\+[1-9]\d{9,14}$/.test(val), {
      message: 'Enter a valid phone number with country code (e.g. +919985475365)'
    }),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
});