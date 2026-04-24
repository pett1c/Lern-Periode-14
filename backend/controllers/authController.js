const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ApiError } = require('../utils/apiError');
const { sendSuccess } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');

function signToken(user) {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new ApiError(500, 'SERVER_CONFIG_ERROR', 'JWT secret is missing on the server.');
  }

  return jwt.sign(
    { id: user._id.toString(), role: user.role, email: user.email },
    jwtSecret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function toPublicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    provider: user.provider,
    avatarUrl: user.avatarUrl || '',
  };
}

function buildOAuthRedirectUrl({ token, user, error }) {
  const redirectBase = process.env.FRONTEND_OAUTH_SUCCESS_URL || 'http://localhost:5173/oauth/callback';
  const redirectUrl = new URL(redirectBase);

  if (error) {
    redirectUrl.searchParams.set('error', error);
    return redirectUrl.toString();
  }

  redirectUrl.searchParams.set('token', token);
  redirectUrl.searchParams.set('user', JSON.stringify(user));
  return redirectUrl.toString();
}

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.validatedBody;
  const requestedRole = role || 'user';
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, 'EMAIL_ALREADY_EXISTS', 'An account with this email already exists.');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: requestedRole,
    provider: 'local',
  });

  const token = signToken(user);

  return sendSuccess(res, {
    statusCode: 201,
    message: 'User registered successfully.',
    data: {
      token,
      user: toPublicUser(user),
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validatedBody;
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
  }
  if (!user.password || user.provider !== 'local') {
    throw new ApiError(401, 'INVALID_LOGIN_METHOD', 'Please use social login for this account.');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
  }

  const token = signToken(user);

  return sendSuccess(res, {
    message: 'Login successful.',
    data: {
      token,
      user: toPublicUser(user),
    },
  });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    throw new ApiError(404, 'USER_NOT_FOUND', 'Authenticated user was not found.');
  }

  return sendSuccess(res, {
    message: 'Authenticated user loaded.',
    data: {
      user: {
        ...toPublicUser(user),
      },
    },
  });
});

const handleOAuthCallback = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.redirect(buildOAuthRedirectUrl({ error: 'OAuth authentication failed.' }));
  }

  const { provider, providerId, email, name, avatarUrl } = req.user;
  if (!email) {
    return res.redirect(buildOAuthRedirectUrl({ error: 'No email returned by OAuth provider.' }));
  }

  let user = await User.findOne({ provider, providerId });
  if (!user) {
    user = await User.findOne({ email });
  }

  if (!user) {
    user = await User.create({
      name,
      email,
      role: 'user',
      provider,
      providerId,
      avatarUrl,
    });
  } else {
    user.provider = provider;
    user.providerId = providerId;
    if (avatarUrl) {
      user.avatarUrl = avatarUrl;
    }
    if (!user.name && name) {
      user.name = name;
    }
    await user.save();
  }

  const token = signToken(user);
  return res.redirect(buildOAuthRedirectUrl({ token, user: toPublicUser(user) }));
});

module.exports = { register, login, getMe, handleOAuthCallback };
