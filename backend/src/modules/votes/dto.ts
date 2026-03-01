import { z } from 'zod';

export const voteDto = z.object({
    postId: z.string().uuid().optional().nullable(),
    commentId: z.string().uuid().optional().nullable(),
    voteType: z.number().refine((v) => v === 1 || v === -1, {
        message: 'voteType must be 1 or -1',
    }),
}).refine(
    (data) => (data.postId && !data.commentId) || (!data.postId && data.commentId),
    { message: 'Exactly one of postId or commentId must be provided' }
);

export type VoteDto = z.infer<typeof voteDto>;
