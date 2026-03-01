import { Request, Response, NextFunction } from 'express';
import { AdminService } from './service';

const adminService = new AdminService();

export class AdminController {
    async deletePost(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await adminService.deletePost(req.params.id);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async deleteComment(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await adminService.deleteComment(req.params.id);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async banUser(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await adminService.banUser(req.params.id);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async unbanUser(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await adminService.unbanUser(req.params.id);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
}
