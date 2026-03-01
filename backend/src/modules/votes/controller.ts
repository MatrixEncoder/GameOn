import { Request, Response, NextFunction } from 'express';
import { VotesService } from './service';

const votesService = new VotesService();

export class VotesController {
    async vote(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await votesService.vote(req.user!.id, req.body);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
}
