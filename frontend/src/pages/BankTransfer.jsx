import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { toast } from "react-toastify";

const BankTransfer = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");
  const navigate = useNavigate();
  
  const [bankInfo, setBankInfo] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    if (orderId && amount) {
      fetchBankInfo();
    }
  }, [orderId, amount]);

  const fetchBankInfo = async () => {
    try {
      const response = await axiosClient.post('/payment/bank-transfer/create', {
        orderId,
        amount: parseInt(amount)
      });
      
      setBankInfo(response.data.bankInfo);
      setQrCodeUrl(response.data.qrCodeUrl);
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi tải thông tin thanh toán");
      navigate('/my-orders');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await axiosClient.post('/payment/bank-transfer/confirm', { orderId });
      toast.success("Đã xác nhận! Admin sẽ kiểm tra và xác minh thanh toán của bạn");
      navigate('/my-orders');
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi xác nhận thanh toán");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Đã copy!");
  };

  if (fetchLoading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
        <p className="mt-3">Đang tải thông tin thanh toán...</p>
      </div>
    );
  }

  if (!bankInfo) return null;

  return (
    <div className="container mt-5 mb-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white text-center py-3">
              <h3 className="mb-0">💳 Thanh toán chuyển khoản</h3>
            </div>
            
            <div className="card-body p-4">
              {/* QR Code */}
              <div className="text-center mb-4">
                <h5 className="mb-3">Quét mã QR để chuyển khoản</h5>
                <div className="d-inline-block border rounded p-3 bg-light">
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code" 
                    style={{maxWidth: '350px', width: '100%'}}
                    className="img-fluid"
                  />
                </div>
                <p className="text-muted mt-2 small">
                  Mở app ngân hàng → Quét QR → Thanh toán
                </p>
              </div>

              {/* Divider */}
              <div className="text-center mb-4">
                <span className="badge bg-secondary">HOẶC CHUYỂN KHOẢN THỦ CÔNG</span>
              </div>

              {/* Bank Info */}
              <div className="bank-details">
                <div className="row mb-3">
                  <div className="col-4 fw-bold">🏦 Ngân hàng:</div>
                  <div className="col-8">{bankInfo.bankName}</div>
                </div>
                
                <div className="row mb-3">
                  <div className="col-4 fw-bold">💳 Số tài khoản:</div>
                  <div className="col-8">
                    <span className="me-2">{bankInfo.accountNumber}</span>
                    <button 
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => copyToClipboard(bankInfo.accountNumber)}
                    >
                      📋 Copy
                    </button>
                  </div>
                </div>
                
                <div className="row mb-3">
                  <div className="col-4 fw-bold">👤 Chủ tài khoản:</div>
                  <div className="col-8">{bankInfo.accountName}</div>
                </div>
                
                <div className="row mb-3">
                  <div className="col-4 fw-bold">🏢 Chi nhánh:</div>
                  <div className="col-8">{bankInfo.branch}</div>
                </div>
                
                <div className="row mb-3">
                  <div className="col-4 fw-bold">💰 Số tiền:</div>
                  <div className="col-8">
                    <span className="text-danger fw-bold fs-5">
                      {bankInfo.amount.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                </div>
                
                <div className="row mb-3">
                  <div className="col-4 fw-bold">📝 Nội dung CK:</div>
                  <div className="col-8">
                    <span className="text-primary fw-bold me-2">{bankInfo.content}</span>
                    <button 
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => copyToClipboard(bankInfo.content)}
                    >
                      📋 Copy
                    </button>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="alert alert-warning d-flex align-items-center mt-4" role="alert">
                <div>
                  <strong>⚠️ LƯU Ý:</strong>
                  <ul className="mb-0 mt-2">
                    <li>Vui lòng chuyển khoản <strong>ĐÚNG số tiền</strong> và <strong>ĐÚNG nội dung</strong></li>
                    <li>Nội dung chuyển khoản giúp chúng tôi xác nhận đơn hàng nhanh chóng</li>
                    <li>Sau khi chuyển khoản, bấm nút xác nhận bên dưới</li>
                  </ul>
                </div>
              </div>

              {/* Confirm Button */}
              <div className="text-center mt-4">
                <button 
                  className="btn btn-success btn-lg px-5"
                  onClick={handleConfirm}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Đang xác nhận...
                    </>
                  ) : (
                    <>✅ Tôi đã chuyển khoản</>
                  )}
                </button>
                
                <button 
                  className="btn btn-outline-secondary ms-2"
                  onClick={() => navigate('/my-orders')}
                  disabled={loading}
                >
                  Xem đơn hàng
                </button>
              </div>

              {/* Info */}
              <div className="alert alert-info mt-4 mb-0" role="alert">
                <small>
                  💡 Sau khi xác nhận, đơn hàng sẽ ở trạng thái "Đang xác minh". 
                  Admin sẽ kiểm tra và xác nhận thanh toán trong vòng 24h.
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankTransfer;
