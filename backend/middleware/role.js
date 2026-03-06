const { ApiError } = require('../utils/apiError');

function authorizeRoles(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'UNAUTHORIZED', 'Authentication required.'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, 'FORBIDDEN', 'You are not allowed to access this resource.'));
    }

    return next();
  };
}

module.exports = { authorizeRoles };
