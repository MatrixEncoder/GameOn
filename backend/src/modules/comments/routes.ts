import { Router } from 'express';
import { CommentsController } from './controller';
import { validate } from '../../middleware/validate';
import { authenticate, optionalAuth } from '../../middleware/auth';
import { createCommentDto, updateCommentDto } from './dto';

const router = Router();
const controller = new CommentsController();

router.get('/posts/:postId/comments', optionalAuth, controller.getComments);
router.post('/posts/:postId/comments', authenticate, validate(createCommentDto), controller.createComment);
router.put('/comments/:id', authenticate, validate(updateCommentDto), controller.updateComment);
router.delete('/comments/:id', authenticate, controller.deleteComment);

export default router;
