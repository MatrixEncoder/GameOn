import { z } from 'zod';

export const createPostDto = z.object({
    title: z.string().min(3).max(200),
    content: z.string().min(1).max(50000),
    image: z.string().url().optional(),
});

export const updatePostDto = z.object({
    title: z.string().min(3).max(200).optional(),
    content: z.string().min(1).max(50000).optional(),
    image: z.string().url().optional(),
});

export const postQueryDto = z.object({
    sort: z.enum(['hot', 'new', 'top']).default('hot'),
    cursor: z.string().optional(),
    limit: z.coerce.number().min(1).max(50).default(20),
});

export type CreatePostDto = z.infer<typeof createPostDto>;
export type UpdatePostDto = z.infer<typeof updatePostDto>;
export type PostQueryDto = z.infer<typeof postQueryDto>;
