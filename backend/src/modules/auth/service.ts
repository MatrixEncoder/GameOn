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
        });

        if (existingUser) {
            if (existingUser.email === data.email) {
                throw new AppError('Email already in use', 409);
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

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            let username = displayName.replace(/[^a-zA-Z0-9_]/g, '_');
            const taken = await prisma.user.findUnique({ where: { username } });
            if (taken) username = `${username}_${randomBytes(3).toString('hex')}`;

            user = await prisma.user.create({
                data: {
                    email,
                    username,
                    passwordHash: await bcrypt.hash(randomBytes(32).toString('hex'), 12),
                },
            });
        }

        if (user.isBanned) throw new AppError('Account is banned', 403);

        const token = this.generateToken(user.id);
        return {
            user: { id: user.id, username: user.username, email: user.email },
            token,
        };
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
