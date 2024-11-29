const winston = require('winston');
const { ValidationError } = require('express-validator');
const uuid = require('uuid');
const { rateLimit } = require('express-rate-limit');

// Logger Konfiguration
const logger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Fehlermeldungen für verschiedene Fehlertypen
const errorMessages = {
  validation: {
    de: 'Validierungsfehler bei den eingegebenen Daten.',
    en: 'Validation error in the provided data.'
  },
  auth: {
    de: 'Authentifizierungsfehler. Bitte melden Sie sich erneut an.',
    en: 'Authentication error. Please log in again.'
  },
  notFound: {
    de: 'Die angeforderte Ressource wurde nicht gefunden.',
    en: 'The requested resource was not found.'
  },
  duplicate: {
    de: 'Ein Eintrag mit diesen Daten existiert bereits.',
    en: 'An entry with this data already exists.'
  },
  server: {
    de: 'Ein interner Serverfehler ist aufgetreten.',
    en: 'An internal server error occurred.'
  },
  network: {
    de: 'Netzwerkfehler bei der Verarbeitung der Anfrage.',
    en: 'Network error while processing the request.'
  }
};

// HTTP Status Codes mit Beschreibungen
const statusCodes = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  INTERNAL_SERVER: 500,
  SERVICE_UNAVAILABLE: 503
};

class AppError extends Error {
  constructor(message, statusCode, errorType = 'server', lang = 'de') {
    super(message);
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.lang = lang;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const errorRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

const sanitizeData = (data) => {
  if (typeof data === 'object') {
    const sanitized = { ...data };
    ['password', 'token', 'secret'].forEach(key => {
      if (sanitized[key]) sanitized[key] = '[REDACTED]';
    });
    return sanitized;
  }
  return data;
};

const processError = (error) => {
  if (error instanceof AppError) return error;
  
  if (error.name === 'ValidationError') {
    return handleValidationError(error);
  }
  if (error.name === 'CastError') {
    return handleCastError(error);
  }
  if (error.code === 11000) {
    return handleDuplicateFieldsError(error);
  }
  if (error instanceof ValidationError) {
    return handleExpressValidationError(error);
  }
  
  return new AppError(
    errorMessages.server.de,
    statusCodes.INTERNAL_SERVER,
    'server'
  );
};

const handleError = (err, req, res, _next) => {
  const requestId = req.headers['x-request-id'] || uuid.v4();
  
  logger.error({
    requestId,
    error: {
      type: err.constructor.name,
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      body: sanitizeData(req.body),
      params: req.params,
      query: req.query,
      user: req.user ? req.user.id : 'anonymous'
    }
  });

  if (!errorRateLimit.tryRequest(req.ip)) {
    return res.status(429).json({
      status: 'error',
      message: 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.'
    });
  }

  const error = processError(err);
  
  return process.env.NODE_ENV === 'development' 
    ? sendDevError(error, res, requestId)
    : sendProdError(error, res, requestId);
};

const sendDevError = (err, res, requestId) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
    requestId
  });
};

const sendProdError = (err, res, requestId) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      requestId
    });
  } else {
    logger.error('ERROR ', err);
    res.status(500).json({
      status: 'error',
      message: 'Etwas ist schiefgelaufen!',
      requestId
    });
  }
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Ungültige Eingabe: ${errors.join('. ')}`;
  return new AppError(message, statusCodes.VALIDATION_ERROR, 'validation');
};

const handleCastError = (err) => {
  const message = `Ungültiger ${err.path}: ${err.value}`;
  return new AppError(message, statusCodes.BAD_REQUEST, 'validation');
};

const handleDuplicateFieldsError = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Doppelter Feldwert: ${value}. Bitte verwenden Sie einen anderen Wert.`;
  return new AppError(message, statusCodes.CONFLICT, 'duplicate');
};

const handleExpressValidationError = (err) => {
  const errors = err.array().map(error => error.msg);
  const message = `Ungültige Eingabedaten: ${errors.join('. ')}`;
  return new AppError(message, 400, 'validation');
};

module.exports = {
  AppError,
  handleError,
  processError,
  errorRateLimit,
  sanitizeData,
  handleValidationError,
  handleCastError,
  handleDuplicateFieldsError,
  handleExpressValidationError
};
