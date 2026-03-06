const { ZodError } = require('zod');

function errorHandler(error, _req, res, _next) {
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
      details: null,
    },
  });
}

module.exports = { errorHandler };
