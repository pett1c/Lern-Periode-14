const { ZodError } = require('zod');

function errorHandler(error, _req, res, _next) {
  if (error && error.message === 'CORS_NOT_ALLOWED') {
    return res.status(403).json({
      success: false,
      message: 'CORS origin is not allowed.',
      data: null,
      error: {
        code: 'CORS_FORBIDDEN',
        details: [{ path: 'origin', message: 'Request origin is not in CORS allowlist.' }],
      },
    });
  }

  if (error && error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        details: Object.values(error.errors || {}).map((issue) => ({
          path: issue.path || issue?.properties?.path || 'field',
          message: issue.message,
        })),
      },
    });
  }

  if (error && error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'A unique field value already exists.',
      data: null,
      error: {
        code: 'DUPLICATE_KEY',
        details: Object.keys(error.keyValue || {}).map((key) => ({
          path: key,
          message: `${key} already exists.`,
        })),
      },
    });
  }

  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        details: error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      },
    });
  }

  if (error && error.statusCode && error.code) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      data: null,
      error: {
        code: error.code,
        details: error.details || null,
      },
    });
  }

  console.error(error);
  return res.status(500).json({
    success: false,
    message: 'Internal server error.',
    data: null,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      details: [{ path: 'server', message: error.message || 'Unknown error.' }],
    },
  });
}

module.exports = { errorHandler };
