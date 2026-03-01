import prisma from '../../config/db';
import { AppError } from '../../middleware/error-handler';

export class GamesService {
    async listGames() {
        const games = await prisma.game.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: { select: { posts: true } },
            },
        });
        return games;
    }

    async getGameBySlug(slug: string) {
        const game = await prisma.game.findUnique({
            where: { slug },
            include: {
                _count: { select: { posts: true } },
            },
        });

        if (!game) {
            throw new AppError('Game not found', 404);
        }

        return game;
    }
}
