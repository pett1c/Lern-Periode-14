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

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.validatedBody;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, 'EMAIL_ALREADY_EXISTS', 'An account with this email already exists.');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'user',
  });

  const token = signToken(user);

  return sendSuccess(res, {
    statusCode: 201,
    message: 'User registered successfully.',
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validatedBody;
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
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
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
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
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
});

module.exports = { register, login, getMe };
