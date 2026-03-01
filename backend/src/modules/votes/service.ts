import prisma from '../../config/db';
import { AppError } from '../../middleware/error-handler';
import { VoteDto } from './dto';

export class VotesService {
    async vote(userId: string, data: VoteDto) {
        if (data.postId) {
            return this.voteOnPost(userId, data.postId, data.voteType);
        } else if (data.commentId) {
            return this.voteOnComment(userId, data.commentId, data.voteType);
        }
        throw new AppError('Invalid vote target', 400);
    }

    private async voteOnPost(userId: string, postId: string, voteType: number) {
        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) throw new AppError('Post not found', 404);

        return await prisma.$transaction(async (tx) => {
            const existing = await tx.vote.findUnique({
                where: { userId_postId: { userId, postId } },
            });

            if (existing) {
                if (existing.voteType === voteType) {
                    // Remove vote
                    await tx.vote.delete({ where: { id: existing.id } });
                    await tx.post.update({
                        where: { id: postId },
                        data: { score: { decrement: voteType } },
                    });
                    // Update user karma
                    await tx.user.update({
                        where: { id: post.userId },
                        data: { karma: { decrement: voteType } },
                    });
                    return { voteType: null, score: post.score - voteType };
                } else {
                    // Change vote
                    await tx.vote.update({
                        where: { id: existing.id },
                        data: { voteType },
                    });
                    const scoreDelta = voteType * 2; // swing from -1 to +1 or vice versa
                    await tx.post.update({
                        where: { id: postId },
                        data: { score: { increment: scoreDelta } },
                    });
                    await tx.user.update({
                        where: { id: post.userId },
                        data: { karma: { increment: scoreDelta } },
                    });
                    return { voteType, score: post.score + scoreDelta };
                }
            } else {
                // New vote
                await tx.vote.create({
                    data: { userId, postId, voteType },
                });
                await tx.post.update({
                    where: { id: postId },
                    data: { score: { increment: voteType } },
                });
                await tx.user.update({
                    where: { id: post.userId },
                    data: { karma: { increment: voteType } },
                });
                return { voteType, score: post.score + voteType };
            }
        });
    }

    private async voteOnComment(userId: string, commentId: string, voteType: number) {
        const comment = await prisma.comment.findUnique({ where: { id: commentId } });
        if (!comment) throw new AppError('Comment not found', 404);

        return await prisma.$transaction(async (tx) => {
            const existing = await tx.vote.findUnique({
                where: { userId_commentId: { userId, commentId } },
            });

            if (existing) {
                if (existing.voteType === voteType) {
                    await tx.vote.delete({ where: { id: existing.id } });
                    await tx.comment.update({
                        where: { id: commentId },
                        data: { score: { decrement: voteType } },
                    });
                    await tx.user.update({
                        where: { id: comment.userId },
                        data: { karma: { decrement: voteType } },
                    });
                    return { voteType: null, score: comment.score - voteType };
                } else {
                    await tx.vote.update({
                        where: { id: existing.id },
                        data: { voteType },
                    });
                    const scoreDelta = voteType * 2;
                    await tx.comment.update({
                        where: { id: commentId },
                        data: { score: { increment: scoreDelta } },
                    });
                    await tx.user.update({
                        where: { id: comment.userId },
                        data: { karma: { increment: scoreDelta } },
                    });
                    return { voteType, score: comment.score + scoreDelta };
                }
            } else {
                await tx.vote.create({
                    data: { userId, commentId, voteType },
                });
                await tx.comment.update({
                    where: { id: commentId },
                    data: { score: { increment: voteType } },
                });
                await tx.user.update({
                    where: { id: comment.userId },
                    data: { karma: { increment: voteType } },
                });
                return { voteType, score: comment.score + voteType };
            }
        });
    }
}
