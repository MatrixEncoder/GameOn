import prisma from '../../config/db';
import { AppError } from '../../middleware/error-handler';
import { filterProfanity } from '../../utils/profanity';
import { CreatePostDto, UpdatePostDto } from './dto';
import { Prisma } from '@prisma/client';

export class PostsService {
    async getPostsByGameSlug(
        slug: string,
        sort: string,
        cursor: string | undefined,
        limit: number,
        userId?: string
    ) {
        const game = await prisma.game.findUnique({ where: { slug } });
        if (!game) throw new AppError('Game not found', 404);

        let orderBy: Prisma.PostOrderByWithRelationInput;
        switch (sort) {
            case 'new':
                orderBy = { createdAt: 'desc' };
                break;
            case 'top':
                orderBy = { score: 'desc' };
                break;
            case 'hot':
            default:
                orderBy = { createdAt: 'desc' };
                break;
        }

        const posts = await prisma.post.findMany({
            where: { gameId: game.id },
            orderBy,
            take: limit + 1,
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
            include: {
                user: { select: { id: true, username: true } },
                game: { select: { id: true, slug: true, name: true } },
                _count: { select: { comments: true } },
                ...(userId
                    ? { votes: { where: { userId }, select: { voteType: true } } }
                    : {}),
            },
        });

        const hasMore = posts.length > limit;
        const results = hasMore ? posts.slice(0, -1) : posts;

        if (sort === 'hot') {
            results.sort((a, b) => {
                const now = Date.now();
                const hoursA = (now - a.createdAt.getTime()) / (1000 * 60 * 60);
                const hoursB = (now - b.createdAt.getTime()) / (1000 * 60 * 60);
                const hotA = a.score / Math.pow(hoursA + 2, 1.5);
                const hotB = b.score / Math.pow(hoursB + 2, 1.5);
                return hotB - hotA;
            });
        }

        return {
            posts: results.map((p: any) => ({
                ...p,
                userVote: p.votes?.[0]?.voteType ?? null,
                votes: undefined,
            })),
            nextCursor: hasMore ? results[results.length - 1].id : null,
        };
    }

    async getHomeFeed(sort: string, cursor: string | undefined, limit: number, userId?: string) {
        let orderBy: Prisma.PostOrderByWithRelationInput;
        switch (sort) {
            case 'new':
                orderBy = { createdAt: 'desc' };
                break;
            case 'top':
                orderBy = { score: 'desc' };
                break;
            case 'hot':
            default:
                orderBy = { createdAt: 'desc' };
                break;
        }

        const posts = await prisma.post.findMany({
            orderBy,
            take: limit + 1,
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
            include: {
                user: { select: { id: true, username: true } },
                game: { select: { id: true, slug: true, name: true } },
                _count: { select: { comments: true } },
                ...(userId
                    ? { votes: { where: { userId }, select: { voteType: true } } }
                    : {}),
            },
        });

        const hasMore = posts.length > limit;
        const results = hasMore ? posts.slice(0, -1) : posts;

        if (sort === 'hot') {
            results.sort((a, b) => {
                const now = Date.now();
                const hoursA = (now - a.createdAt.getTime()) / (1000 * 60 * 60);
                const hoursB = (now - b.createdAt.getTime()) / (1000 * 60 * 60);
                const hotA = a.score / Math.pow(hoursA + 2, 1.5);
                const hotB = b.score / Math.pow(hoursB + 2, 1.5);
                return hotB - hotA;
            });
        }

        return {
            posts: results.map((p: any) => ({
                ...p,
                userVote: p.votes?.[0]?.voteType ?? null,
                votes: undefined,
            })),
            nextCursor: hasMore ? results[results.length - 1].id : null,
        };
    }

    async getPostById(id: string, userId?: string) {
        const post = await prisma.post.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, username: true } },
                game: { select: { id: true, slug: true, name: true } },
                _count: { select: { comments: true } },
                ...(userId
                    ? { votes: { where: { userId }, select: { voteType: true } } }
                    : {}),
            },
        });

        if (!post) throw new AppError('Post not found', 404);

        return {
            ...post,
            userVote: (post as any).votes?.[0]?.voteType ?? null,
            votes: undefined,
        };
    }

    async createPost(gameSlug: string, userId: string, data: CreatePostDto) {
        const game = await prisma.game.findUnique({ where: { slug: gameSlug } });
        if (!game) throw new AppError('Game not found', 404);

        const post = await prisma.post.create({
            data: {
                title: filterProfanity(data.title),
                content: filterProfanity(data.content),
                userId,
                gameId: game.id,
            },
            include: {
                user: { select: { id: true, username: true } },
                game: { select: { id: true, slug: true, name: true } },
            },
        });

        return post;
    }

    async updatePost(id: string, userId: string, data: UpdatePostDto) {
        const post = await prisma.post.findUnique({ where: { id } });
        if (!post) throw new AppError('Post not found', 404);
        if (post.userId !== userId) throw new AppError('Not authorized', 403);

        const updated = await prisma.post.update({
            where: { id },
            data: {
                ...(data.title ? { title: filterProfanity(data.title) } : {}),
                ...(data.content ? { content: filterProfanity(data.content) } : {}),
            },
            include: {
                user: { select: { id: true, username: true } },
                game: { select: { id: true, slug: true, name: true } },
            },
        });

        return updated;
    }

    async deletePost(id: string, userId: string) {
        const post = await prisma.post.findUnique({ where: { id } });
        if (!post) throw new AppError('Post not found', 404);
        if (post.userId !== userId) throw new AppError('Not authorized', 403);

        await prisma.post.delete({ where: { id } });
        return { message: 'Post deleted' };
    }
}
