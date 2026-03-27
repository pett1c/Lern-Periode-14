require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const ticketRoutes = require('./routes/tickets');
const adminRoutes = require('./routes/admin');
const chatRoutes = require('./routes/chat');
const { ApiError } = require('./utils/apiError');
const { errorHandler } = require('./middleware/errorHandler');
const mongoose = require('mongoose');
const { getFeatureFlags } = require('./config/runtime');

const app = express();

app.use(cors());
app.use(express.json());

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
      },
    },
  });
});

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
