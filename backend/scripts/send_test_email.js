const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const emailService = require('../src/services/email.service');
const logger = require('../src/config/logger');

(async () => {
  try {
    console.log('Sending test OTP email...');
    const res = await emailService.sendOTPEmail({
      email: process.env.TEST_RECEIVER_EMAIL || 'your-email@example.com',
      name: process.env.TEST_RECEIVER_NAME || 'Test User',
      otp: '123456'
    });

    console.log('Result:', res);
    if (res && res.transporter === 'ethereal') {
      console.log('Ethereal was used — check logs for preview URL.');
    }
    console.log('Done. If using SMTP, ensure credentials (App Password) are correct.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to send test email:', err.message || err);
    if (err.response) console.error(err.response);
    process.exit(1);
  }
})();
