function validate(schemas = {}) {
  return (req, _res, next) => {
    try {
      if (schemas.body) {
        req.validatedBody = schemas.body.parse(req.body);
      }

      if (schemas.params) {
        req.validatedParams = schemas.params.parse(req.params);
      }

      if (schemas.query) {
        req.validatedQuery = schemas.query.parse(req.query);
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = { validate };
