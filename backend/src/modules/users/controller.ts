import { Request, Response, NextFunction } from 'express';
import { UsersService } from './service';

const usersService = new UsersService();

export class UsersController {
    async getUserProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await usersService.getUserProfile(req.params.username);
            res.json(user);
        } catch (error) {
            next(error);
        }
    }
}
