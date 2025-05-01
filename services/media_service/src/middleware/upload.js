/**
 * File Upload Middleware
 * Configure multer for file uploads
 */
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { ValidationError } = require('../utils/errorHandler');
const { isValidFileType, isValidFileSize } = require('../utils/validation');

// Create upload directory if it doesn't exist
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create event-specific directory
    const eventId = req.body.event_id;
    const eventDir = path.join(uploadDir, eventId);
    
    if (!fs.existsSync(eventDir)) {
      fs.mkdirSync(eventDir, { recursive: true });
    }
    
    cb(null, eventDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Check if file type is valid
  if (!isValidFileType(file.mimetype)) {
    return cb(new ValidationError('Invalid file type. Only images and videos are allowed.'), false);
  }
  
  // Check file size (size check is also handled in limits)
  cb(null, true);
};

// Initialize multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new ValidationError('File too large. Maximum size is 10MB.'));
    }
    return next(new ValidationError(`Upload error: ${err.message}`));
  }
  
  // Pass other errors to the next middleware
  next(err);
};

module.exports = {
  upload,
  handleMulterError
};
