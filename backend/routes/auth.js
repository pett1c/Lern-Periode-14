const express = require('express');
const { passport } = require('../config/passport');
const { getFeatureFlags } = require('../config/runtime');
const { register, login, getMe, handleOAuthCallback } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validators/authSchemas');
const { ApiError } = require('../utils/apiError');

const router = express.Router();
const features = getFeatureFlags();

function ensureFeatureEnabled(isEnabled, featureName) {
  return (_req, _res, next) => {
    if (!isEnabled) {
      return next(new ApiError(503, 'FEATURE_DISABLED', `${featureName} OAuth is not configured.`));
    }
    return next();
  };
}

router.post('/register', validate({ body: registerSchema }), register);
router.post('/login', validate({ body: loginSchema }), login);
router.get('/me', protect, getMe);

router.get(
  '/google',
  ensureFeatureEnabled(features.googleAuthEnabled, 'Google'),
  passport.authenticate('google', { session: false, scope: ['profile', 'email'] })
);
router.get(
  '/google/callback',
  ensureFeatureEnabled(features.googleAuthEnabled, 'Google'),
  passport.authenticate('google', { session: false, failureRedirect: '/api/auth/oauth-failure' }),
  handleOAuthCallback
);
router.get(
  '/github',
  ensureFeatureEnabled(features.githubAuthEnabled, 'GitHub'),
  passport.authenticate('github', { session: false, scope: ['user:email'] })
);
router.get(
  '/github/callback',
  ensureFeatureEnabled(features.githubAuthEnabled, 'GitHub'),
  passport.authenticate('github', { session: false, failureRedirect: '/api/auth/oauth-failure' }),
  handleOAuthCallback
);
router.get('/oauth-failure', (_req, res) => {
  return res.redirect(
    `${process.env.FRONTEND_OAUTH_SUCCESS_URL || 'http://localhost:5173/oauth/callback'}?error=OAuth%20authentication%20failed.`
  );
});

module.exports = router;
