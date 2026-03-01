import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { toast } from 'react-toastify';

function VerifyOTP() {
  const [otp, setOTP] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId;
  const email = location.state?.email;

  if (!userId) {
    navigate('/register');
    return null;
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      toast.error('Vui lòng nhập đầy đủ 6 số OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosClient.post('/auth/verify-otp', {
        userId,
        otp
      });

      if (response.data.success) {
        toast.success('🎉 Xác thực thành công! Tài khoản của bạn đã được kích hoạt. Đang chuyển đến trang đăng nhập...', {
          autoClose: 2000
        });
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Mã OTP không đúng');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const response = await axiosClient.post('/auth/resend-otp', {
        userId
      });

      if (response.data.success) {
        toast.success('📧 Đã gửi lại mã OTP! Vui lòng kiểm tra email.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể gửi lại OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="container mt-5 mb-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
          }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔐</div>
              <h2 style={{ 
                fontSize: '28px', 
                fontWeight: '800',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '8px'
              }}>
                Hoàn tất đăng ký
              </h2>
              <p style={{ color: '#718096', fontSize: '14px' }}>
                Nhập mã OTP đã được gửi đến email<br/>
                <strong>{email}</strong>
              </p>
              <div style={{
                background: '#fff5e6',
                border: '2px solid #ffa500',
                borderRadius: '8px',
                padding: '10px',
                marginTop: '12px',
                fontSize: '13px',
                color: '#d97706'
              }}>
                ⚠️ <strong>Lưu ý:</strong> Tài khoản chưa kích hoạt cho đến khi bạn xác thực OTP
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleVerify}>
              <div className="mb-4">
                <label style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#2d3748',
                  marginBottom: '8px',
                  display: 'block'
                }}>
                  Mã OTP (6 số)
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOTP(value);
                  }}
                  placeholder="000000"
                  maxLength="6"
                  style={{
                    padding: '14px 20px',
                    fontSize: '24px',
                    fontWeight: '700',
                    letterSpacing: '8px',
                    textAlign: 'center',
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0',
                    fontFamily: '"Courier New", monospace'
                  }}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: loading || otp.length !== 6 ? 'not-allowed' : 'pointer',
                  opacity: loading || otp.length !== 6 ? 0.6 : 1,
                  transition: 'all 0.3s ease',
                  marginBottom: '16px'
                }}
                onMouseEnter={e => {
                  if (!loading && otp.length === 6) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(102,126,234,0.4)';
                  }
                }}
                onMouseLeave={e => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {loading ? '⏳ Đang xác thực...' : '✅ Kích hoạt tài khoản'}
              </button>

              <div style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#667eea',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: resending ? 'not-allowed' : 'pointer',
                    textDecoration: 'underline',
                    padding: '8px 16px'
                  }}
                >
                  {resending ? '⏳ Đang gửi...' : '📧 Gửi lại mã OTP'}
                </button>
              </div>
            </form>

            {/* Info Box */}
            <div style={{
              background: '#f7fafc',
              borderRadius: '10px',
              padding: '16px',
              marginTop: '24px',
              fontSize: '13px',
              color: '#718096'
            }}>
              <p style={{ margin: '0 0 8px', fontWeight: '600', color: '#2d3748' }}>
                💡 Lưu ý:
              </p>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>Mã OTP có hiệu lực trong <strong>10 phút</strong></li>
                <li>Không chia sẻ mã OTP với bất kỳ ai</li>
                <li>Kiểm tra cả hộp thư spam nếu không thấy email</li>
              </ul>
            </div>

            {/* Back to Login */}
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button
                onClick={() => navigate('/login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#718096',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                ← Quay lại đăng nhập
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyOTP;
