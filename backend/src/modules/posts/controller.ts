import { Request, Response, NextFunction } from 'express';
import { PostsService } from './service';

const postsService = new PostsService();

export class PostsController {
    async getPostsByGameSlug(req: Request, res: Response, next: NextFunction) {
        try {
            const { sort, cursor, limit } = req.query as any;
            const result = await postsService.getPostsByGameSlug(
                req.params.slug,
                sort || 'hot',
                cursor as string | undefined,
                parseInt(limit as string) || 20,
                req.user?.id
            );
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async getHomeFeed(req: Request, res: Response, next: NextFunction) {
        try {
            const { sort, cursor, limit } = req.query as any;
            const result = await postsService.getHomeFeed(
                sort || 'hot',
                cursor as string | undefined,
                parseInt(limit as string) || 20,
                req.user?.id
            );
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async getPostById(req: Request, res: Response, next: NextFunction) {
        try {
            const post = await postsService.getPostById(req.params.id, req.user?.id);
            res.json(post);
        } catch (error) {
            next(error);
        }
    }

    async createPost(req: Request, res: Response, next: NextFunction) {
        try {
            const post = await postsService.createPost(req.params.slug, req.user!.id, req.body);
            res.status(201).json(post);
        } catch (error) {
            next(error);
        }
    }

    async updatePost(req: Request, res: Response, next: NextFunction) {
        try {
            const post = await postsService.updatePost(req.params.id, req.user!.id, req.body);
            res.json(post);
        } catch (error) {
            next(error);
        }
    }

    async deletePost(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await postsService.deletePost(req.params.id, req.user!.id);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
}
