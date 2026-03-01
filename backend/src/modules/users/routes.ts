import { Router } from 'express';
import { UsersController } from './controller';

const router = Router();
const controller = new UsersController();

router.get('/:username', controller.getUserProfile);

export default router;
