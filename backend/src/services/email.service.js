const nodemailer = require('nodemailer');
const logger = require('../config/logger');

// Cấu hình transporter
const createTransporter = async () => {
  // Nếu không có EMAIL_USER hoặc EMAIL_PASSWORD, dùng Ethereal (test account)
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    logger.warn('⚠️ EMAIL_USER/PASSWORD not configured. Using Ethereal test account...');
    
    // Tạo test account tự động
    const testAccount = await nodemailer.createTestAccount();
    
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  }

  // Dùng Gmail thật
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Gửi email xác nhận đơn hàng
exports.sendOrderConfirmation = async (orderData) => {
  try {
    const transporter = await createTransporter();
    
    const { user, items, totalPrice, customerName, phone, shippingAddress, orderNumber } = orderData;
    
    // Tạo HTML cho danh sách sản phẩm
    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          ${item.name}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          ${Number(item.price).toLocaleString('vi-VN')}đ
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          ${Number(item.price * item.quantity).toLocaleString('vi-VN')}đ
        </td>
      </tr>
    `).join('');

    const mailOptions = {
      from: `"Mỹ Phẩm Việt" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `✅ Xác nhận đơn hàng #${orderNumber || 'N/A'}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .total-row { font-weight: bold; font-size: 18px; color: #e53e3e; }
            .info-box { background: #f7fafc; padding: 15px; border-radius: 8px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">💄 Mỹ Phẩm Việt</h1>
              <p style="margin: 10px 0 0; opacity: 0.9;">Cảm ơn bạn đã đặt hàng!</p>
            </div>
            
            <div class="content">
              <h2 style="color: #667eea;">Đơn hàng của bạn đã được xác nhận</h2>
              <p>Xin chào <strong>${customerName}</strong>,</p>
              <p>Chúng tôi đã nhận được đơn hàng của bạn và đang xử lý. Đơn hàng sẽ được giao trong 2-3 ngày làm việc.</p>
              
              <div class="info-box">
                <h3 style="margin-top: 0; color: #2d3748;">📦 Thông tin giao hàng</h3>
                <p style="margin: 5px 0;"><strong>Người nhận:</strong> ${customerName}</p>
                <p style="margin: 5px 0;"><strong>Số điện thoại:</strong> ${phone}</p>
                <p style="margin: 5px 0;"><strong>Địa chỉ:</strong> ${shippingAddress}</p>
              </div>

              <h3 style="color: #2d3748;">🛍️ Chi tiết đơn hàng</h3>
              <table>
                <thead>
                  <tr style="background: #f7fafc;">
                    <th style="padding: 10px; text-align: left;">Sản phẩm</th>
                    <th style="padding: 10px; text-align: center;">SL</th>
                    <th style="padding: 10px; text-align: right;">Đơn giá</th>
                    <th style="padding: 10px; text-align: right;">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                  <tr class="total-row">
                    <td colspan="3" style="padding: 15px; text-align: right; border-top: 2px solid #667eea;">
                      Tổng cộng:
                    </td>
                    <td style="padding: 15px; text-align: right; border-top: 2px solid #667eea;">
                      ${Number(totalPrice).toLocaleString('vi-VN')}đ
                    </td>
                  </tr>
                </tbody>
              </table>

              <div style="background: #fff5f5; border-left: 4px solid #fc8181; padding: 15px; margin: 20px 0;">
                <p style="margin: 0;"><strong>📌 Lưu ý:</strong></p>
                <ul style="margin: 10px 0;">
                  <li>Vui lòng kiểm tra kỹ sản phẩm khi nhận hàng</li>
                  <li>Thanh toán khi nhận hàng (COD)</li>
                  <li>Liên hệ hotline: <strong>1900-xxxx</strong> nếu cần hỗ trợ</li>
                </ul>
              </div>

              <p style="margin-top: 30px;">Cảm ơn bạn đã tin tưởng và sử dụng sản phẩm của chúng tôi! ❤️</p>
            </div>

            <div class="footer">
              <p style="margin: 5px 0;">© 2026 Mỹ Phẩm Việt. All rights reserved.</p>
              <p style="margin: 5px 0;">Email: ${process.env.EMAIL_USER} | Hotline: 1900-xxxx</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`✅ Email sent successfully to ${user.email}: ${info.messageId}`);
    
    // Log Ethereal preview URL nếu dùng test account
    if (info.messageId.includes('ethereal.email')) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      logger.info(`📧 Preview email: ${previewUrl}`);
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`Failed to send email: ${error.message}`);
    throw error;
  }
};

// Gửi email thông báo cập nhật trạng thái đơn hàng
exports.sendOrderStatusUpdate = async (orderData) => {
  try {
    const transporter = await createTransporter();
    
    const { user, orderNumber, status, customerName } = orderData;
    
    const statusMessages = {
      pending: '⏳ Đơn hàng đang chờ xác nhận',
      processing: '📦 Đơn hàng đang được chuẩn bị',
      shipped: '🚚 Đơn hàng đang được giao',
      delivered: '✅ Đơn hàng đã giao thành công',
      cancelled: '❌ Đơn hàng đã bị hủy'
    };

    const mailOptions = {
      from: `"Mỹ Phẩm Việt" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Cập nhật đơn hàng #${orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; }
            .status-box { background: #f0f4ff; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">💄 Mỹ Phẩm Việt</h1>
            </div>
            
            <div class="content">
              <h2 style="color: #667eea;">Cập nhật trạng thái đơn hàng</h2>
              <p>Xin chào <strong>${customerName}</strong>,</p>
              
              <div class="status-box">
                <h3 style="margin-top: 0; font-size: 20px;">
                  ${statusMessages[status] || 'Trạng thái đã thay đổi'}
                </h3>
                <p style="margin: 10px 0 0;">Mã đơn hàng: <strong>#${orderNumber}</strong></p>
              </div>

              ${status === 'shipped' ? `
                <p>Đơn hàng của bạn đang trên đường giao đến. Vui lòng chú ý điện thoại để nhận hàng.</p>
              ` : ''}
              
              ${status === 'delivered' ? `
                <p>Cảm ơn bạn đã mua hàng! Nếu có bất kỳ vấn đề gì, vui lòng liên hệ với chúng tôi.</p>
              ` : ''}

              <p style="margin-top: 30px;">Trân trọng,<br><strong>Đội ngũ Mỹ Phẩm Việt</strong></p>
            </div>

            <div class="footer">
              <p style="margin: 5px 0;">© 2026 Mỹ Phẩm Việt. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Status update email sent to ${user.email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`Failed to send status update email: ${error.message}`);
    throw error;
  }
};

// Gửi email chào mừng khi đăng ký
exports.sendWelcomeEmail = async (userData) => {
  try {
    const transporter = await createTransporter();
    
    const { email, name } = userData;

    const mailOptions = {
      from: `"Mỹ Phẩm Việt" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🎉 Chào mừng bạn đến với Mỹ Phẩm Việt!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666; }
            .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 50px; display: inline-block; margin: 20px 0; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div style="font-size: 48px; margin-bottom: 10px;">💄✨</div>
              <h1 style="margin: 0; font-size: 32px;">Chào mừng đến với<br>Mỹ Phẩm Việt!</h1>
            </div>
            
            <div class="content">
              <h2 style="color: #667eea;">Xin chào ${name}!</h2>
              <p>Cảm ơn bạn đã đăng ký tài khoản tại <strong>Mỹ Phẩm Việt</strong>. Chúng tôi rất vui khi được đồng hành cùng bạn trên hành trình làm đẹp!</p>
              
              <div style="background: #f7fafc; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #2d3748;">🎁 Ưu đãi dành cho bạn:</h3>
                <ul style="margin: 10px 0;">
                  <li>Giảm <strong>10%</strong> cho đơn hàng đầu tiên</li>
                  <li>Miễn phí vận chuyển cho đơn > 300.000đ</li>
                  <li>Tích điểm với mọi đơn hàng</li>
                  <li>Ưu đãi độc quyền mỗi tháng</li>
                </ul>
              </div>

              <div style="text-align: center;">
                <a href="http://localhost:5173/products" class="button">
                  🛍️ Khám phá sản phẩm ngay
                </a>
              </div>

              <p style="margin-top: 30px; font-size: 14px; color: #718096;">
                Nếu bạn có bất kỳ câu hỏi nào, đừng ngại liên hệ với chúng tôi qua email hoặc hotline!
              </p>
            </div>

            <div class="footer">
              <p style="margin: 5px 0;">© 2026 Mỹ Phẩm Việt. All rights reserved.</p>
              <p style="margin: 5px 0;">Email: ${process.env.EMAIL_USER} | Hotline: 1900-xxxx</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Welcome email sent to ${email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`Failed to send welcome email: ${error.message}`);
    // Không throw error để không block đăng ký
    return { success: false, error: error.message };
  }
};

// Gửi email OTP xác thực tài khoản
exports.sendOTPEmail = async (userData) => {
  try {
    const transporter = await createTransporter();
    
    const { email, name, otp } = userData;

    const mailOptions = {
      from: `"Mỹ Phẩm Việt" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 Mã xác thực tài khoản - Mỹ Phẩm Việt',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #fff; padding: 40px 30px; border: 1px solid #e0e0e0; }
            .otp-box { background: linear-gradient(145deg, #f0f4ff, #eef1ff); border: 2px dashed #667eea; padding: 30px; text-align: center; border-radius: 12px; margin: 30px 0; }
            .otp-code { font-size: 48px; font-weight: 800; color: #667eea; letter-spacing: 8px; margin: 10px 0; font-family: 'Courier New', monospace; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666; }
            .warning { background: #fff5f5; border-left: 4px solid #fc8181; padding: 15px; margin: 20px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div style="font-size: 48px; margin-bottom: 10px;">🔐</div>
              <h1 style="margin: 0; font-size: 28px;">Xác thực tài khoản</h1>
              <p style="margin: 10px 0 0; opacity: 0.9;">Mỹ Phẩm Việt</p>
            </div>
            
            <div class="content">
              <h2 style="color: #667eea; margin-top: 0;">Xin chào ${name}!</h2>
              <p>Trần Quốc Huy muốn lừa bạn bạn có thể gửi mã OTP cho Huy để Huy lừa bạn được không <strong>Mỹ Phẩm Việt</strong>.</p>
              <p>Để hoàn tất đăng ký, vui lòng nhập mã OTP bên dưới để Trần Quốc Huy lừa:</p>
              
              <div class="otp-box">
                <p style="margin: 0 0 10px; color: #4a5568; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Mã xác thực của bạn</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 10px 0 0; color: #718096; font-size: 13px;">Mã có hiệu lực trong <strong>10 phút</strong></p>
              </div>

              <div class="warning">
                <p style="margin: 0; font-size: 14px;"><strong>⚠️ Lưu ý bảo mật:</strong></p>
                <ul style="margin: 10px 0 0; padding-left: 20px; font-size: 13px;">
                  <li>Không chia sẻ mã OTP này với bất kỳ ai</li>
                  <li>Nhân viên Mỹ Phẩm Việt sẽ không bao giờ yêu cầu mã OTP</li>
                  <li>Nếu bạn không thực hiện đăng ký này, vui lòng bỏ qua email</li>
                </ul>
              </div>

              <p style="margin-top: 30px; font-size: 14px; color: #718096;">
                Nếu cần hỗ trợ, liên hệ với chúng tôi qua email hoặc hotline!
              </p>
            </div>

            <div class="footer">
              <p style="margin: 5px 0;">© 2026 Mỹ Phẩm Việt. All rights reserved.</p>
              <p style="margin: 5px 0;">Email: ${process.env.EMAIL_USER || 'support@myphamviet.com'} | Hotline: 1900-xxxx</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`✅ OTP email sent to ${email}: ${info.messageId}`);
    
    // Log Ethereal preview URL nếu dùng test account
    if (info.messageId.includes('ethereal.email')) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      logger.info(`📧 Preview OTP email: ${previewUrl}`);
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`Failed to send OTP email: ${error.message}`);
    throw error;
  }
};
