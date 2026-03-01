import prisma from '../../config/db';
import { AppError } from '../../middleware/error-handler';
import { filterProfanity } from '../../utils/profanity';
import { CreateCommentDto, UpdateCommentDto } from './dto';

interface CommentNode {
    id: string;
    postId: string;
    userId: string;
    parentCommentId: string | null;
    content: string;
    score: number;
    createdAt: Date;
    user: { id: string; username: string; displayName: string | null; avatarUrl: string | null };
    userVote: number | null;
    children: CommentNode[];
    depth: number;
}

export class CommentsService {
    async getCommentsByPostId(postId: string, sort: string, userId?: string) {
        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) throw new AppError('Post not found', 404);

        const comments = await prisma.comment.findMany({
            where: { postId },
            orderBy: sort === 'new' ? { createdAt: 'desc' } : { score: 'desc' },
            include: {
                user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
                ...(userId
                    ? { votes: { where: { userId }, select: { voteType: true } } }
                    : {}),
            },
        });

        // Build tree in memory
        const commentMap = new Map<string, CommentNode>();
        const roots: CommentNode[] = [];

        for (const c of comments) {
            const node: CommentNode = {
                id: c.id,
                postId: c.postId,
                userId: c.userId,
                parentCommentId: c.parentCommentId,
                content: c.content,
                score: c.score,
                createdAt: c.createdAt,
                user: c.user,
                userVote: (c as any).votes?.[0]?.voteType ?? null,
                children: [],
                depth: 0,
            };
            commentMap.set(c.id, node);
        }

        for (const node of commentMap.values()) {
            if (node.parentCommentId && commentMap.has(node.parentCommentId)) {
                const parent = commentMap.get(node.parentCommentId)!;
                node.depth = parent.depth + 1;
                parent.children.push(node);
            } else {
                roots.push(node);
            }
        }

        // Sort children recursively
        const sortChildren = (nodes: CommentNode[]) => {
            nodes.sort((a: any, b: any) =>
                sort === 'new'
                    ? b.createdAt.getTime() - a.createdAt.getTime()
                    : b.score - a.score
            );
            nodes.forEach((n) => sortChildren(n.children));
        };

        sortChildren(roots);

        return roots;
    }

    async createComment(postId: string, userId: string, data: CreateCommentDto) {
        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) throw new AppError('Post not found', 404);

        if (data.parentCommentId) {
            const parent = await prisma.comment.findUnique({
                where: { id: data.parentCommentId },
            });
            if (!parent || parent.postId !== postId) {
                throw new AppError('Parent comment not found in this post', 404);
            }
        }

        const comment = await prisma.comment.create({
            data: {
                content: filterProfanity(data.content),
                postId,
                userId,
                parentCommentId: data.parentCommentId ?? null,
            },
            include: {
                user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
            },
        });

        return { ...comment, children: [], depth: 0, userVote: null };
    }

    async updateComment(id: string, userId: string, data: UpdateCommentDto) {
        const comment = await prisma.comment.findUnique({ where: { id } });
        if (!comment) throw new AppError('Comment not found', 404);
        if (comment.userId !== userId) throw new AppError('Not authorized', 403);

        const updated = await prisma.comment.update({
            where: { id },
            data: { content: filterProfanity(data.content) },
            include: {
                user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
            },
        });

        return updated;
    }

    async deleteComment(id: string, userId: string) {
        const comment = await prisma.comment.findUnique({ where: { id } });
        if (!comment) throw new AppError('Comment not found', 404);
        if (comment.userId !== userId) throw new AppError('Not authorized', 403);

        await prisma.comment.delete({ where: { id } });
        return { message: 'Comment deleted' };
    }
}
