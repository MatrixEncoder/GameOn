import { Router } from 'express';
import { AdminController } from './controller';
import { authenticate, requireAdmin } from '../../middleware/auth';

const router = Router();
const controller = new AdminController();

router.use(authenticate, requireAdmin);

router.delete('/posts/:id', controller.deletePost);
router.delete('/comments/:id', controller.deleteComment);
router.post('/users/:id/ban', controller.banUser);
router.post('/users/:id/unban', controller.unbanUser);

export default router;
