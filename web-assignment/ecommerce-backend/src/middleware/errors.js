// Errors carry an HTTP status and a short machine-readable code.
// Services just `throw`, and the handler below turns it into:
//   { "error": { "code": "OUT_OF_STOCK", "message": "..." } }

class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const badRequest = (message, code = 'VALIDATION_ERROR') => new HttpError(400, code, message);
const notFound = (message) => new HttpError(404, 'NOT_FOUND', message);
const conflict = (message) => new HttpError(409, 'OUT_OF_STOCK', message);

function notFoundRoute(req, res, next) {
  next(notFound(`No route for ${req.method} ${req.path}`));
}

// Express recognises an error handler by its four parameters.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    err = badRequest('Request body must be valid JSON', 'INVALID_JSON');
  }
  if (!(err instanceof HttpError)) {
    console.error(err);
    err = new HttpError(500, 'INTERNAL_ERROR', 'Something went wrong on our side');
  }
  res.status(err.status).json({ error: { code: err.code, message: err.message } });
}

module.exports = { HttpError, badRequest, notFound, conflict, notFoundRoute, errorHandler };
