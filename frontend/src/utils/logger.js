/**
 * Frontend Logger Utility
 * Provides conditional logging based on environment
 */

const isDevelopment = import.meta.env.DEV;

class Logger {
  /**
   * Log info message (only in development)
   */
  info(...args) {
    if (isDevelopment) {
      console.log('ℹ️', ...args);
    }
  }

  /**
   * Log success message (only in development)
   */
  success(...args) {
    if (isDevelopment) {
      console.log('✅', ...args);
    }
  }

  /**
   * Log warning message (always logged)
   */
  warn(...args) {
    if (isDevelopment) {
      console.warn('⚠️', ...args);
    }
  }

  /**
   * Log error message (always logged)
   */
  error(...args) {
    console.error('❌', ...args);
  }

  /**
   * Log debug message (only in development)
   */
  debug(...args) {
    if (isDevelopment) {
      console.log('🐛', ...args);
    }
  }

  /**
   * Log API request (only in development)
   */
  api(method, url, data) {
    if (isDevelopment) {
      console.log(`🚀 ${method?.toUpperCase()} ${url}`, data || '');
    }
  }

  /**
   * Log API response (only in development)
   */
  apiResponse(method, url, data) {
    if (isDevelopment) {
      console.log(`✅ ${method?.toUpperCase()} ${url}`, data);
    }
  }

  /**
   * Log API error (always logged)
   */
  apiError(method, url, error) {
    console.error(`❌ ${method?.toUpperCase()} ${url}`, error);
  }

  /**
   * Group related logs (only in development)
   */
  group(label, callback) {
    if (isDevelopment) {
      console.group(label);
      callback();
      console.groupEnd();
    }
  }

  /**
   * Log table (only in development)
   */
  table(data) {
    if (isDevelopment) {
      console.table(data);
    }
  }

  /**
   * Time tracking (only in development)
   */
  time(label) {
    if (isDevelopment) {
      console.time(label);
    }
  }

  timeEnd(label) {
    if (isDevelopment) {
      console.timeEnd(label);
    }
  }
}

// Export singleton instance
const logger = new Logger();
export default logger;
