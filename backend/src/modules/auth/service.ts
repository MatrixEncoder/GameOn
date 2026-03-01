import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import prisma from '../../config/db';
import { config } from '../../config';
import { AppError } from '../../middleware/error-handler';
import { SignupDto, LoginDto } from './dto';

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
                throw new AppError('Email already exists. Please log in or use Forgot Password.', 409);
            }
            throw new AppError('Username already taken', 409);
        }

        const passwordHash = await bcrypt.hash(data.password, 12);

        const user = await prisma.user.create({
            data: {
                username: data.username,
                email: data.email,
                passwordHash,
            },
            select: { id: true, username: true, email: true, isAdmin: true, createdAt: true },
        });

        const token = this.generateToken(user.id);
        return { user, token };
    }

    async login(data: LoginDto) {
        const user = await prisma.user.findUnique({
            where: { email: data.email },
            select: { id: true, email: true, username: true, passwordHash: true, isBanned: true, isAdmin: true, createdAt: true },
        });

        if (!user) {
            throw new AppError('Invalid credentials', 401);
        }

        if (user.isBanned) {
            throw new AppError('Account is banned', 403);
        }

        const isValid = await bcrypt.compare(data.password, user.passwordHash);
        if (!isValid) {
            throw new AppError('Invalid credentials', 401);
        }

        const token = this.generateToken(user.id);
        return {
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin,
                createdAt: user.createdAt,
            },
            token,
        };
    }

    // ── OAuth: verify provider token → find/create user → return JWT ─────────
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
            select: { id: true, email: true, username: true, isBanned: true },
        });

        if (!user) {
            let username = displayName.replace(/[^a-zA-Z0-9_]/g, '_');
            const taken = await prisma.user.findUnique({ where: { username }, select: { id: true } });
            if (taken) username = `${username}_${randomBytes(3).toString('hex')}`;

            user = await prisma.user.create({
                data: {
                    email,
                    username,
                    passwordHash: await bcrypt.hash(randomBytes(32).toString('hex'), 12),
                },
                select: { id: true, email: true, username: true, isBanned: true },
            });
        }

        if (user.isBanned) throw new AppError('Account is banned', 403);

        const token = this.generateToken(user.id);
        return {
            user: { id: user.id, username: user.username, email: user.email },
            token,
        };
    }

    async forgotPassword(email: string) {
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true },
        });
        if (!user) {
            // Security: don't reveal if user exists
            return { message: 'If an account exists with that email, a reset link will be sent.' };
        }

        const token = randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hour

        await (prisma.user.update as any)({
            where: { id: user.id },
            data: {
                resetPasswordToken: token,
                resetPasswordExpires: expires,
            },
        });

        // In a real app, send email here. For now, we return token for verification.
        console.log(`🔑 Reset token for ${email}: ${token}`);
        return { message: 'If an account exists with that email, a reset link will be sent.', debugToken: token };
    }

    async resetPassword(token: string, newPassword: string) {
        const user = await (prisma.user.findFirst as any)({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: { gt: new Date() },
            },
            select: { id: true },
        });

        if (!user) {
            throw new AppError('Invalid or expired reset token', 400);
        }

        const passwordHash = await bcrypt.hash(newPassword, 12);

        await (prisma.user.update as any)({
            where: { id: user.id },
            data: {
                passwordHash,
                resetPasswordToken: null,
                resetPasswordExpires: null,
            },
        });

        return { message: 'Password has been reset successfully' };
    }

    async getMe(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, username: true, email: true, karma: true, isAdmin: true, createdAt: true },
        });

        if (!user) {
            throw new AppError('User not found', 404);
        }

        return user;
    }

    private generateToken(userId: string): string {
        return jwt.sign({ userId }, config.jwtSecret, { expiresIn: config.jwtExpiresIn } as jwt.SignOptions);
    }
}
