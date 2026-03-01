import { Request, Response, NextFunction } from 'express';
import { GamesService } from './service';

const gamesService = new GamesService();

export class GamesController {
    async listGames(req: Request, res: Response, next: NextFunction) {
        try {
            const games = await gamesService.listGames();
            res.json(games);
        } catch (error) {
            next(error);
        }
    }

    async getGameBySlug(req: Request, res: Response, next: NextFunction) {
        try {
            const game = await gamesService.getGameBySlug(req.params.slug);
            res.json(game);
        } catch (error) {
            next(error);
        }
    }
}
