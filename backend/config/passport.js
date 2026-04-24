const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { Strategy: GitHubStrategy } = require('passport-github2');

function normalizeProfile(provider, profile) {
  const primaryEmail = profile.emails?.[0]?.value?.toLowerCase().trim();
  const displayName = profile.displayName || profile.username || `${provider} user`;
  const avatarUrl = profile.photos?.[0]?.value || '';

  return {
    provider,
    providerId: profile.id,
    email: primaryEmail,
    name: displayName,
    avatarUrl,
  };
}

function configurePassport() {
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CALLBACK_URL) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        (_accessToken, _refreshToken, profile, done) => done(null, normalizeProfile('google', profile))
      )
    );
  }

  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET && process.env.GITHUB_CALLBACK_URL) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          callbackURL: process.env.GITHUB_CALLBACK_URL,
          scope: ['user:email'],
        },
        (_accessToken, _refreshToken, profile, done) => done(null, normalizeProfile('github', profile))
      )
    );
  }
}

module.exports = { passport, configurePassport };
