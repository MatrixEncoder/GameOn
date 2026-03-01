import { z } from 'zod';

export const createCommentDto = z.object({
    content: z.string().min(1).max(10000),
    parentCommentId: z.string().uuid().optional().nullable(),
});

export const updateCommentDto = z.object({
    content: z.string().min(1).max(10000),
});

export const commentQueryDto = z.object({
    sort: z.enum(['top', 'new']).default('top'),
});

export type CreateCommentDto = z.infer<typeof createCommentDto>;
export type UpdateCommentDto = z.infer<typeof updateCommentDto>;
