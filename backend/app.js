require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const ticketRoutes = require('./routes/tickets');
const adminRoutes = require('./routes/admin');
const chatRoutes = require('./routes/chat');
const { ApiError } = require('./utils/apiError');
const { errorHandler } = require('./middleware/errorHandler');
const mongoose = require('mongoose');
const { passport, configurePassport } = require('./config/passport');
const { getFeatureFlags } = require('./config/runtime');

const app = express();
configurePassport();

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX || 120),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication requests. Please retry later.',
    data: null,
    error: {
      code: 'RATE_LIMITED',
      details: [{ path: 'auth', message: 'Request limit exceeded.' }],
    },
  },
});

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('CORS_NOT_ALLOWED'));
    },
  })
);
app.use(express.json());
app.use(passport.initialize());

app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the Eventify API.',
    data: null
  });
});

app.get('/api/health', (_req, res) => {
  const features = getFeatureFlags();
  const dbReady = mongoose.connection.readyState === 1;
  const status = dbReady ? 'ok' : 'degraded';

  res.status(200).json({
    success: true,
    message: dbReady ? 'API is healthy.' : 'API is running in degraded mode.',
    data: {
      status,
      services: {
        db: dbReady ? 'up' : 'down',
        vector: features.vectorEnabled ? 'up' : 'degraded',
        chat: features.chatEnabled ? 'up' : 'degraded',
        oauthGoogle: features.googleAuthEnabled ? 'up' : 'degraded',
        oauthGithub: features.githubAuthEnabled ? 'up' : 'degraded',
      },
    },
  });
});

app.use('/api/auth', authLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);

app.use((_req, _res, next) => {
  next(new ApiError(404, 'NOT_FOUND', 'Route not found.'));
});

app.use(errorHandler);

module.exports = app;
