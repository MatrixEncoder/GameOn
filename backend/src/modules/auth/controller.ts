import { Request, Response, NextFunction } from 'express';
import { AuthService } from './service';

const authService = new AuthService();

export class AuthController {
    async signup(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await authService.signup(req.body);
            res.status(201).json(result);
        } catch (error) { next(error); }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await authService.login(req.body);
            res.json(result);
        } catch (error) { next(error); }
    }

    async getMe(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await authService.getMe(req.user!.id);
            res.json(user);
        } catch (error) { next(error); }
    }

    async oauthLogin(req: Request, res: Response, next: NextFunction) {
        try {
            const { provider, accessToken } = req.body as { provider: 'google' | 'reddit'; accessToken: string };
            if (!provider || !accessToken) return res.status(400).json({ message: 'provider and accessToken are required' });
            const result = await authService.oauthLogin(provider, accessToken);
            res.json(result);
        } catch (error) { next(error); }
    }

    // ── OTP flow ──────────────────────────────────────────────────────────────
    async sendOtp(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.body;
            if (!email) return res.status(400).json({ message: 'Email is required' });
            const result = await authService.sendOtp(email);
            res.json(result);
        } catch (error) { next(error); }
    }

    async verifyOtp(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, otp } = req.body;
            if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });
            const result = await authService.verifyOtp(email, otp);
            res.json(result);
        } catch (error) { next(error); }
    }

    async resetPasswordWithOtp(req: Request, res: Response, next: NextFunction) {
        try {
            const { resetToken, newPassword } = req.body;
            if (!resetToken || !newPassword) return res.status(400).json({ message: 'resetToken and newPassword are required' });
            const result = await authService.resetPasswordWithOtp(resetToken, newPassword);
            res.json(result);
        } catch (error) { next(error); }
    }

    // ── Legacy ────────────────────────────────────────────────────────────────
    async forgotPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.body;
            const result = await authService.forgotPassword(email);
            res.json(result);
        } catch (error) { next(error); }
    }

    async resetPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { token, password } = req.body;
            const result = await authService.resetPassword(token, password);
            res.json(result);
        } catch (error) { next(error); }
    }
}
