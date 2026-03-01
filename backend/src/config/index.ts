import dotenv from 'dotenv';
dotenv.config();

const corsOriginRaw = (process.env.CORS_ORIGIN || 'http://localhost:3000');
const corsOrigins = corsOriginRaw.split(',').map((o) => o.trim()).filter(Boolean);

console.log('🌐 CORS Config:', corsOrigins.length ? corsOrigins : 'http://localhost:3000');

export const config = {
    port: parseInt(process.env.PORT || '4000', 10),
    jwtSecret: process.env.JWT_SECRET || 'gameon-7f3a9b2c1d4e8f6a0b5c9d2e7f1a4b8c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3f6a9b2c5d8e1f4a7b0c3d6e9f2',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    corsOrigin: corsOrigins.length > 1 ? corsOrigins : (corsOrigins[0] || 'http://localhost:3000'),
    nodeEnv: process.env.NODE_ENV || 'development',
};

