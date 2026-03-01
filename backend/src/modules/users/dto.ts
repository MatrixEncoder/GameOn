import { z } from 'zod';

export const updateUserDto = z.object({
    displayName: z.string().min(2).max(50).optional(),
    avatarUrl: z.string().url().optional(),
});

export type UpdateUserDto = z.infer<typeof updateUserDto>;
