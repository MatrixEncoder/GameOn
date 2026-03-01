import prisma from '../../config/db';
import { AppError } from '../../middleware/error-handler';

export class AdminService {
    async deletePost(postId: string) {
        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) throw new AppError('Post not found', 404);
        await prisma.post.delete({ where: { id: postId } });
        return { message: 'Post deleted by admin' };
    }

    async deleteComment(commentId: string) {
        const comment = await prisma.comment.findUnique({ where: { id: commentId } });
        if (!comment) throw new AppError('Comment not found', 404);
        await prisma.comment.delete({ where: { id: commentId } });
        return { message: 'Comment deleted by admin' };
    }

    async banUser(userId: string) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new AppError('User not found', 404);
        if (user.isAdmin) throw new AppError('Cannot ban an admin', 400);

        await prisma.user.update({
            where: { id: userId },
            data: { isBanned: true },
        });
        return { message: 'User banned' };
    }

    async unbanUser(userId: string) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new AppError('User not found', 404);

        await prisma.user.update({
            where: { id: userId },
            data: { isBanned: false },
        });
        return { message: 'User unbanned' };
    }
}
