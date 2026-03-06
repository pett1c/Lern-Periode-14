const jwt = require('jsonwebtoken');
const { ApiError } = require('../utils/apiError');

function extractToken(req) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.split(' ')[1];
}

function decodeToken(token) {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new ApiError(500, 'SERVER_CONFIG_ERROR', 'JWT secret is missing on the server.');
  }

  return jwt.verify(token, jwtSecret);
}

function protect(req, _res, next) {
  const token = extractToken(req);
  if (!token) {
    return next(new ApiError(401, 'UNAUTHORIZED', 'Authentication token is missing.'));
  }

  try {
    const payload = decodeToken(token);
    req.user = {
      id: payload.id,
      role: payload.role,
      email: payload.email,
    };
    return next();
  } catch (_error) {
    return next(new ApiError(401, 'UNAUTHORIZED', 'Invalid or expired authentication token.'));
  }
}

function optionalAuth(req, _res, next) {
  const token = extractToken(req);
  if (!token) {
    return next();
  }

  try {
    const payload = decodeToken(token);
    req.user = {
      id: payload.id,
      role: payload.role,
      email: payload.email,
    };
    return next();
  } catch (_error) {
    return next(new ApiError(401, 'UNAUTHORIZED', 'Invalid or expired authentication token.'));
  }
}

module.exports = { protect, optionalAuth };
