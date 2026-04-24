function getFeatureFlags() {
  const oauthExplicitlyEnabled = process.env.ENABLE_OAUTH === 'true';
  return {
    chatEnabled: Boolean(process.env.OPENROUTER_API_KEY && process.env.PINECONE_API_KEY),
    vectorEnabled: Boolean(process.env.PINECONE_API_KEY),
    googleAuthEnabled: Boolean(
      oauthExplicitlyEnabled &&
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_CALLBACK_URL
    ),
    githubAuthEnabled: Boolean(
      oauthExplicitlyEnabled &&
      process.env.GITHUB_CLIENT_ID &&
      process.env.GITHUB_CLIENT_SECRET &&
      process.env.GITHUB_CALLBACK_URL
    ),
  };
}

function validateRuntimeConfig() {
  const required = ['MONGODB_URI', 'JWT_SECRET'];
  const missingRequired = required.filter((key) => !process.env[key]);

  if (missingRequired.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingRequired.join(', ')}. ` +
      'Copy backend/.env.example to backend/.env and fill the values.'
    );
  }

  const warnings = [];
  if (!process.env.OPENROUTER_API_KEY) {
    warnings.push('OPENROUTER_API_KEY missing: /api/chat will run in degraded mode.');
  }
  if (!process.env.PINECONE_API_KEY) {
    warnings.push('PINECONE_API_KEY missing: vector sync and semantic chat retrieval are disabled.');
  }
  if (process.env.ENABLE_OAUTH !== 'true') {
    warnings.push('ENABLE_OAUTH is not true: OAuth endpoints are disabled.');
  }
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_CALLBACK_URL) {
    warnings.push('Google OAuth missing config: /api/auth/google is disabled.');
  }
  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET || !process.env.GITHUB_CALLBACK_URL) {
    warnings.push('GitHub OAuth missing config: /api/auth/github is disabled.');
  }

  return { warnings, features: getFeatureFlags() };
}

module.exports = { validateRuntimeConfig, getFeatureFlags };
