import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(3, 'Username is required'),

  email: z.email('Invalid email'),

  phoneNumber: z
    .string()
    .regex(/^[0-9]{10}$/, 'Phone number must be 10 digits'),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
});