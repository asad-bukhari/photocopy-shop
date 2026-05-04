require('dotenv').config();

module.exports = {
  port: process.env.PORT || 8069,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret',
  corsOrigin: process.env.CORS_ORIGIN || ['http://localhost:5173', 'http://localhost:5174'],
  databaseUrl: process.env.DATABASE_URL,
};
