const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
  
    // Mongoose validation error
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        status: 'error',
        message: 'Validation Error',
        errors: Object.values(err.errors).map(error => ({
          field: error.path,
          message: error.message
        }))
      });
    }
  
    // JWT authentication error
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token'
      });
    }
  
    // Mongoose duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Duplicate field value',
        field: Object.keys(err.keyPattern)[0]
      });
    }
  
    // Default error
    res.status(err.status || 500).json({
      status: 'error',
      message: err.message || 'Internal server error'
    });
  };
  
  module.exports = errorHandler;