import prisma from '../../config/db';
import { AppError } from '../../middleware/error-handler';
import { UpdateUserDto } from './dto';

export class UsersService {
    async getUserProfile(username: string) {
        const user = await prisma.user.findUnique({
            where: { username },
            select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
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
    async updateMe(userId: string, data: UpdateUserDto) {
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(data.displayName ? { displayName: data.displayName } : {}),
                ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
            },
            select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
                email: true,
            },
        });
        return user;
    }
}
