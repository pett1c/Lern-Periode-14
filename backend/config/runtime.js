function getFeatureFlags() {
  return {
    chatEnabled: Boolean(process.env.OPENROUTER_API_KEY && process.env.PINECONE_API_KEY),
    vectorEnabled: Boolean(process.env.PINECONE_API_KEY),
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

  return { warnings, features: getFeatureFlags() };
}

module.exports = { validateRuntimeConfig, getFeatureFlags };
