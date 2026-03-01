import { Router } from 'express';
import { PostsController } from './controller';
import { validate, validateQuery } from '../../middleware/validate';
import { authenticate, optionalAuth } from '../../middleware/auth';
import { postLimiter } from '../../middleware/rate-limit';
import { createPostDto, updatePostDto, postQueryDto } from './dto';

const router = Router();
const controller = new PostsController();

// Home feed
router.get('/feed', optionalAuth, controller.getHomeFeed);

// Game-specific posts
router.get('/games/:slug/posts', optionalAuth, controller.getPostsByGameSlug);
router.post('/games/:slug/posts', authenticate, postLimiter, validate(createPostDto), controller.createPost);

// Post CRUD
router.get('/posts/:id', optionalAuth, controller.getPostById);
router.put('/posts/:id', authenticate, validate(updatePostDto), controller.updatePost);
router.delete('/posts/:id', authenticate, controller.deletePost);

export default router;
