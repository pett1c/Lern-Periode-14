const express = require('express');
const { passport } = require('../config/passport');
const { getFeatureFlags } = require('../config/runtime');
const { register, login, getMe, handleOAuthCallback } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validators/authSchemas');
const { ApiError } = require('../utils/apiError');

const router = express.Router();

function ensureFeatureEnabled(featureKey, featureName) {
  return (_req, _res, next) => {
    const features = getFeatureFlags();
    if (!features[featureKey]) {
      return next(
        new ApiError(503, 'FEATURE_DISABLED', `${featureName} OAuth is currently disabled. Use local auth for now.`)
      );
    }
    return next();
  };
}

router.post('/register', validate({ body: registerSchema }), register);
router.post('/login', validate({ body: loginSchema }), login);
router.get('/me', protect, getMe);

router.get(
  '/google',
  ensureFeatureEnabled('googleAuthEnabled', 'Google'),
  passport.authenticate('google', { session: false, scope: ['profile', 'email'] })
);
router.get(
  '/google/callback',
  ensureFeatureEnabled('googleAuthEnabled', 'Google'),
  passport.authenticate('google', { session: false, failureRedirect: '/api/auth/oauth-failure' }),
  handleOAuthCallback
);
router.get(
  '/github',
  ensureFeatureEnabled('githubAuthEnabled', 'GitHub'),
  passport.authenticate('github', { session: false, scope: ['user:email'] })
);
router.get(
  '/github/callback',
  ensureFeatureEnabled('githubAuthEnabled', 'GitHub'),
  passport.authenticate('github', { session: false, failureRedirect: '/api/auth/oauth-failure' }),
  handleOAuthCallback
);
router.get('/oauth-failure', (_req, res) => {
  return res.redirect(
    `${process.env.FRONTEND_OAUTH_SUCCESS_URL || 'http://localhost:5173/oauth/callback'}?error=OAuth%20authentication%20failed.`
  );
});

module.exports = router;
