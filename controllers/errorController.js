const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  const value = err.keyValue.email;
  const message = `Duplicate field value : "${value}". Please use another value.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Validation error. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => {
  return new AppError('Invalid token, Please login again!', 401);
};

const handleTokenExpiredError = () => {
  return new AppError('Token expired!, Please login again!', 401);
};

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }

  console.log(err);

  res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    message: err.message
  });
};

const sendErrorProd = (err, req, res) => {
  // Operational, trusted error : send message to client
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }
    // 1. Log Error
    console.log('ERROR :/', err);

    // 2. Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong!'
    });
  }

  if (err.isOperational) {
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      message: err.message
    });
  }
  // 1. Log Error
  console.log('ERROR :/');

  // 2. Send generic message
  res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    message: 'Please try again later'
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.create(err);

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);

    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);

    if (error.name === 'JsonWebTokenError') error = handleJWTError();

    if (error.name === 'TokenExpiredError') error = handleTokenExpiredError();

    sendErrorProd(error, req, res);
  }
};
