import { Router } from 'express';
import { UsersController } from './controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { updateUserDto } from './dto';

const router = Router();
const controller = new UsersController();

router.put('/me', authenticate, validate(updateUserDto), controller.updateMe);
router.get('/:username', controller.getUserProfile);

export default router;
