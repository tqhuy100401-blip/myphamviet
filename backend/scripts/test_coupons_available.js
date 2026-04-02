const axios = require('axios');

(async () => {
  try {
    const res = await axios.get('http://localhost:5002/api/coupons/available');
    console.log('Kết quả /api/coupons/available:', res.data);
  } catch (err) {
    console.error('Lỗi khi gọi API:', err.response?.data || err.message);
  }
})();
