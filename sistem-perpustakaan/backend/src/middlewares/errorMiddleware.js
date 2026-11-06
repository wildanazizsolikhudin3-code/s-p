const errorMiddleware = (err, req, res, next) => {
  console.error(err.stack);

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'Ukuran file terlalu besar. Maksimal 5MB.'
    });
  }

  if (err.message && err.message.includes('gambar')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Terjadi kesalahan pada server.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorMiddleware;
