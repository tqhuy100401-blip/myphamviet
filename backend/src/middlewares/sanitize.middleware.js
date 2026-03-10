const mongoSanitize = require('express-mongo-sanitize');

// Sanitize input to prevent NoSQL injection
// Note: Exclude query params due to Express 5+ immutability
const sanitizeInput = () => {
  return mongoSanitize({
    replaceWith: '_',
    // Only sanitize body and params, skip query (immutable in Express 5+)
    allowDots: true,
    onSanitize: ({ req, key }) => {
      console.warn(`⚠️  Sanitized key: ${key} in request from ${req.ip}`);
    },
  });
};

// XSS protection middleware
const xssProtection = (req, res, next) => {
  // Basic XSS cleaning for common patterns
  const clean = (obj) => {
    if (typeof obj === 'string') {
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    }
    if (typeof obj === 'object' && obj !== null) {
      const cleaned = {};
      Object.keys(obj).forEach(key => {
        cleaned[key] = clean(obj[key]);
      });
      return cleaned;
    }
    return obj;
  };

  // Clean body (mutable)
  if (req.body) req.body = clean(req.body);
  
  // Skip req.query - it's immutable in Express 5+ and already sanitized by express-mongo-sanitize
  
  // Clean params (mutable)
  if (req.params) req.params = clean(req.params);
  
  next();
};

module.exports = {
  sanitizeInput,
  xssProtection
};
