import { z } from 'zod';

export const signupDto = z.object({
    username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    email: z.string().email(),
    password: z.string().min(8).max(100),
});

export const loginDto = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export type SignupDto = z.infer<typeof signupDto>;
export type LoginDto = z.infer<typeof loginDto>;
