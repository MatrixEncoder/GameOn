import { Router } from 'express';
import { AuthController } from './controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { authLimiter } from '../../middleware/rate-limit';
import { signupDto, loginDto } from './dto';

const router = Router();
const controller = new AuthController();

router.post('/signup', authLimiter, validate(signupDto), controller.signup);
router.post('/login', authLimiter, validate(loginDto), controller.login);
router.post('/oauth', authLimiter, controller.oauthLogin);
router.get('/me', authenticate, controller.getMe);

export default router;
