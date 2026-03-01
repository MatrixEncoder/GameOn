import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from './config';
import prisma from './config/db';
import { errorHandler } from './middleware/error-handler';
import { generalLimiter } from './middleware/rate-limit';

import authRoutes from './modules/auth/routes';
import gamesRoutes from './modules/games/routes';
import postsRoutes from './modules/posts/routes';
import commentsRoutes from './modules/comments/routes';
import votesRoutes from './modules/votes/routes';
import usersRoutes from './modules/users/routes';
import adminRoutes from './modules/admin/routes';

const app = express();

// Security & compression
app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(generalLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api', postsRoutes);
app.use('/api', commentsRoutes);
app.use('/api/votes', votesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/admin', adminRoutes);

// Health check (includes DB connectivity)
app.get('/api/health', async (_req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
    } catch (err: any) {
        res.status(503).json({ status: 'error', db: 'disconnected', error: err.message });
    }
});

// Error handler
app.use(errorHandler);

app.listen(config.port, async () => {
    console.log(`🎮 GameOn API running on port ${config.port}`);
    console.log(`🌐 CORS origins: ${JSON.stringify(config.corsOrigin)}`);
    console.log(`🗄️  DATABASE_URL set: ${!!process.env.DATABASE_URL}`);
    try {
        await prisma.$connect();
        console.log('✅ Database connected successfully');
    } catch (err: any) {
        console.error('❌ Database connection FAILED:', err.message);
        console.error('   → Make sure DATABASE_URL is set correctly in Render env vars');
    }
});

export default app;
