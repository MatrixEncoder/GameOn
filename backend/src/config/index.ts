import dotenv from 'dotenv';
dotenv.config();

const corsOriginRaw = process.env.CORS_ORIGIN || 'http://localhost:3000';
const corsOrigins = corsOriginRaw.split(',').map((o) => o.trim());

export const config = {
    port: parseInt(process.env.PORT || '4000', 10),
    jwtSecret: process.env.JWT_SECRET || 'gameon-dev-secret-CHANGE-THIS-IN-PRODUCTION',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    corsOrigin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
    nodeEnv: process.env.NODE_ENV || 'development',
};

