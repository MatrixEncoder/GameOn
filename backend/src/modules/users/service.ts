import prisma from '../../config/db';
import { AppError } from '../../middleware/error-handler';

export class UsersService {
    async getUserProfile(username: string) {
        const user = await prisma.user.findUnique({
            where: { username },
            select: {
                id: true,
                username: true,
                karma: true,
                createdAt: true,
                posts: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                    select: {
                        id: true,
                        title: true,
                        score: true,
                        createdAt: true,
                        game: { select: { slug: true, name: true } },
                        _count: { select: { comments: true } },
                    },
                },
                comments: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                    select: {
                        id: true,
                        content: true,
                        score: true,
                        createdAt: true,
                        post: { select: { id: true, title: true } },
                    },
                },
            },
        });

        if (!user) throw new AppError('User not found', 404);
        return user;
    }
}
