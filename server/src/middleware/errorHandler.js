export const errorHandler = (err, req, res, next) => {
  console.error('API Error:', err);

  if (err.name === 'ZodError') {
    return res.status(400).json({
      message: 'Validation failed on input parameters',
      errors: err.errors,
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      message: 'Duplicate key constraint violation. Resource already exists.',
    });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Internal Starfleet Server Error',
  });
};
