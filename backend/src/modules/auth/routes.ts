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

// OTP-based password reset (new)
router.post('/send-otp', authLimiter, controller.sendOtp);
router.post('/verify-otp', authLimiter, controller.verifyOtp);
router.post('/reset-password-otp', authLimiter, controller.resetPasswordWithOtp);

// Legacy (kept for compatibility)
router.post('/forgot-password', authLimiter, controller.forgotPassword);
router.post('/reset-password', authLimiter, controller.resetPassword);

router.get('/me', authenticate, controller.getMe);

export default router;
