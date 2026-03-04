import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes, randomInt } from 'crypto';
import { Resend } from 'resend';
import prisma from '../../config/db';
import { config } from '../../config';
import { AppError } from '../../middleware/error-handler';
import { SignupDto, LoginDto } from './dto';

const APP_URL = process.env.APP_URL || 'http://localhost:3000';

function getResend() {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new AppError('Email service not configured (RESEND_API_KEY missing)', 500);
    return new Resend(key);
}

// ── Brevo email helper ────────────────────────────────────────────────────────
async function sendBrevoEmail(to: string, subject: string, html: string) {
    const key = process.env.BREVO_API_KEY;
    if (!key) {
        console.warn('BREVO_API_KEY not set, skipping email send');
        return;
    }
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
            'api-key': key,
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify({
            sender: { name: 'GameOn', email: 'noreply@gameon.app' },
            to: [{ email: to }],
            subject,
            htmlContent: html,
        }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('Brevo send failed:', err);
    }
}

// ── Password validation ───────────────────────────────────────────────────────
export function validatePasswordStrength(password: string): string | null {
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return 'Password must contain at least one special character';
    return null;
}

export class AuthService {
    async signup(data: SignupDto) {
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email: data.email }, { username: data.username }],
            },
            select: { id: true, email: true, username: true },
        });

        if (existingUser) {
            if (existingUser.email === data.email) {
                throw new AppError('This email is already registered. Please log in or use Forgot Password.', 409);
            }
            throw new AppError('Username already taken. Please choose another.', 409);
        }

        const pwError = validatePasswordStrength(data.password);
        if (pwError) throw new AppError(pwError, 400);

        const passwordHash = await bcrypt.hash(data.password, 12);

        const user = await prisma.user.create({
            data: {
                username: data.username,
                email: data.email,
                passwordHash,
            },
            select: { id: true, username: true, email: true, isAdmin: true, createdAt: true, displayName: true, avatarUrl: true },
        });

        const token = this.generateToken(user.id);
        return { user, token };
    }

    async login(data: LoginDto) {
        const user = await prisma.user.findUnique({
            where: { email: data.email },
            select: { id: true, email: true, username: true, passwordHash: true, isBanned: true, isAdmin: true, createdAt: true, displayName: true, avatarUrl: true },
        });

        if (!user) {
            throw new AppError('No account found with this email. Please sign up first.', 401);
        }

        if (user.isBanned) {
            throw new AppError('Account is banned', 403);
        }

        const isValid = await bcrypt.compare(data.password, user.passwordHash);
        if (!isValid) {
            throw new AppError('Incorrect password. Please try again or use Forgot Password.', 401);
        }

        const token = this.generateToken(user.id);
        return {
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin,
                createdAt: user.createdAt,
                displayName: user.displayName,
                avatarUrl: user.avatarUrl,
            },
            token,
        };
    }

    // ── OAuth ─────────────────────────────────────────────────────────────────
    async oauthLogin(provider: 'google' | 'reddit', accessToken: string) {
        let email: string;
        let displayName: string;

        if (provider === 'google') {
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (!res.ok) throw new AppError('Invalid Google token', 401);
            const info = await res.json() as { email: string; name: string; sub: string };
            email = info.email;
            displayName = (info.name || info.sub).replace(/\s+/g, '_').toLowerCase().slice(0, 20);
        } else {
            const res = await fetch('https://oauth.reddit.com/api/v1/me', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'User-Agent': 'GameOn/1.0',
                },
            });
            if (!res.ok) throw new AppError('Invalid Reddit token', 401);
            const info = await res.json() as { name: string };
            email = `${info.name.toLowerCase()}@reddit.gameon`;
            displayName = info.name.slice(0, 20);
        }

        let user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true, username: true, isBanned: true, displayName: true, avatarUrl: true },
        });

        if (!user) {
            let username = displayName.replace(/[^a-zA-Z0-9_]/g, '_');
            const taken = await prisma.user.findUnique({ where: { username }, select: { id: true } });
            if (taken) username = `${username}_${randomBytes(3).toString('hex')}`;

            user = await prisma.user.create({
                data: {
                    email,
                    username,
                    displayName,
                    passwordHash: await bcrypt.hash(randomBytes(32).toString('hex'), 12),
                },
                select: { id: true, email: true, username: true, isBanned: true, displayName: true, avatarUrl: true },
            });
        }

        if (!user) throw new AppError('Failed to create or find user', 500);
        if (user.isBanned) throw new AppError('Account is banned', 403);

        const token = this.generateToken(user.id);
        return {
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                displayName: user.displayName,
                avatarUrl: user.avatarUrl,
            },
            token,
        };
    }

    // ── OTP-based password reset ──────────────────────────────────────────────
    async sendOtp(email: string) {
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true, username: true },
        });

        // Always respond the same to avoid leaking whether the email exists
        if (!user) {
            return { message: 'If that email is registered, an OTP has been sent.' };
        }

        const otp = String(randomInt(100000, 999999)); // 6 digits
        const otpHash = await bcrypt.hash(otp, 10);
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await prisma.user.update({
            where: { id: user.id },
            data: { otpCode: otpHash, otpExpires },
        });

        const html = `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#111;color:#eee;border-radius:12px">
                <h2 style="color:#f5c518;margin-top:0">🎮 GameOn — Password Reset OTP</h2>
                <p>Hi <strong>${user.username}</strong>,</p>
                <p>Your one-time password reset code is:</p>
                <div style="text-align:center;margin:28px 0">
                    <span style="background:#f5c518;color:#111;font-size:36px;font-weight:900;letter-spacing:12px;padding:12px 24px;border-radius:10px;display:inline-block">${otp}</span>
                </div>
                <p style="color:#888;font-size:13px">This code expires in <strong>10 minutes</strong>. If you didn't request this, ignore this email.</p>
            </div>
        `;

        await sendBrevoEmail(email, 'Your GameOn Password Reset Code', html);

        return { message: 'If that email is registered, an OTP has been sent.' };
    }

    async verifyOtp(email: string, otp: string) {
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, otpCode: true, otpExpires: true },
        });

        if (!user || !user.otpCode || !user.otpExpires) {
            throw new AppError('Invalid or expired OTP', 400);
        }

        if (user.otpExpires < new Date()) {
            throw new AppError('OTP has expired. Please request a new one.', 400);
        }

        const valid = await bcrypt.compare(otp, user.otpCode);
        if (!valid) {
            throw new AppError('Incorrect OTP. Please check and try again.', 400);
        }

        // Clear OTP after successful verify
        await prisma.user.update({
            where: { id: user.id },
            data: { otpCode: null, otpExpires: null },
        });

        // Return a short-lived reset token
        const resetToken = jwt.sign({ userId: user.id, purpose: 'password-reset' }, config.jwtSecret, { expiresIn: '15m' });
        return { resetToken };
    }

    async resetPasswordWithOtp(resetToken: string, newPassword: string) {
        let payload: { userId: string; purpose: string };
        try {
            payload = jwt.verify(resetToken, config.jwtSecret) as { userId: string; purpose: string };
        } catch {
            throw new AppError('Reset session expired. Please start again.', 400);
        }

        if (payload.purpose !== 'password-reset') {
            throw new AppError('Invalid reset token', 400);
        }

        const pwError = validatePasswordStrength(newPassword);
        if (pwError) throw new AppError(pwError, 400);

        const passwordHash = await bcrypt.hash(newPassword, 12);
        await prisma.user.update({
            where: { id: payload.userId },
            data: { passwordHash, resetPasswordToken: null, resetPasswordExpires: null },
        });

        return { message: 'Password has been reset successfully. You can now log in.' };
    }

    // ── Legacy reset (kept for compatibility) ─────────────────────────────────
    async forgotPassword(email: string) {
        const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true } });
        if (!user) return { message: 'If an account exists with that email, a reset link will be sent.' };

        const token = randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600000);

        await prisma.user.update({
            where: { id: user.id },
            data: { resetPasswordToken: token, resetPasswordExpires: expires },
        });

        const resetUrl = `${APP_URL}/forgot-password?token=${token}&action=reset`;
        try {
            await getResend().emails.send({
                from: 'GameOn <onboarding@resend.dev>',
                to: email,
                subject: 'Reset your GameOn password',
                html: `<a href="${resetUrl}">Reset Password</a>`,
            });
        } catch (e) {
            console.error('Resend failed:', e);
        }

        return { message: 'If an account exists with that email, a reset link will be sent.' };
    }

    async resetPassword(token: string, newPassword: string) {
        const user = await prisma.user.findFirst({
            where: { resetPasswordToken: token, resetPasswordExpires: { gt: new Date() } },
            select: { id: true },
        });
        if (!user) throw new AppError('Invalid or expired reset token', 400);

        const pwError = validatePasswordStrength(newPassword);
        if (pwError) throw new AppError(pwError, 400);

        const passwordHash = await bcrypt.hash(newPassword, 12);
        await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash, resetPasswordToken: null, resetPasswordExpires: null },
        });
        return { message: 'Password has been reset successfully' };
    }

    async getMe(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, username: true, email: true, karma: true, isAdmin: true, createdAt: true, displayName: true, avatarUrl: true },
        });
        if (!user) throw new AppError('User not found', 404);
        return user;
    }

    private generateToken(userId: string): string {
        return jwt.sign({ userId }, config.jwtSecret, { expiresIn: config.jwtExpiresIn } as jwt.SignOptions);
    }
}
