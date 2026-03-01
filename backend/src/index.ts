import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from './config';
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

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

app.listen(config.port, () => {
    console.log(`🎮 GameOn API running on port ${config.port}`);
});

export default app;
