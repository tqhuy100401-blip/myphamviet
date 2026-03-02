require('dotenv').config();

const config = {
  // Server
  PORT: process.env.PORT || 5002,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/myphamviet',
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret-key-change-this',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  
  // CORS
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  // File Upload
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/jpg,image/webp').split(','),
  
  // Email
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  
  // Email (optional)
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT) || 587,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  
  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
};

// Validation
if (!config.JWT_SECRET || config.JWT_SECRET === 'fallback-secret-key-change-this') {
  console.warn('⚠️  WARNING: JWT_SECRET not set or using default value. Please set it in .env file!');
}

if (!config.MONGO_URI) {
  console.error('❌ ERROR: MONGO_URI is required in .env file');
  process.exit(1);
}

module.exports = config;
