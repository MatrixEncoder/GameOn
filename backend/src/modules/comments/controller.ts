import { Request, Response, NextFunction } from 'express';
import { CommentsService } from './service';

const commentsService = new CommentsService();

export class CommentsController {
    async getComments(req: Request, res: Response, next: NextFunction) {
        try {
            const sort = (req.query.sort as string) || 'top';
            const comments = await commentsService.getCommentsByPostId(
                req.params.postId,
                sort,
                req.user?.id
            );
            res.json(comments);
        } catch (error) {
            next(error);
        }
    }

    async createComment(req: Request, res: Response, next: NextFunction) {
        try {
            const comment = await commentsService.createComment(
                req.params.postId,
                req.user!.id,
                req.body
            );
            res.status(201).json(comment);
        } catch (error) {
            next(error);
        }
    }

    async updateComment(req: Request, res: Response, next: NextFunction) {
        try {
            const comment = await commentsService.updateComment(
                req.params.id,
                req.user!.id,
                req.body
            );
            res.json(comment);
        } catch (error) {
            next(error);
        }
    }

    async deleteComment(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await commentsService.deleteComment(
                req.params.id,
                req.user!.id
            );
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
}
