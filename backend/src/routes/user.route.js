
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const User = require("../models/User");

// Lấy danh sách địa chỉ cá nhân
router.get("/addresses", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
    res.json({ success: true, addresses: user.addresses || [] });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

// Cập nhật danh sách địa chỉ cá nhân (tối đa 3)
router.put("/addresses", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    let { addresses } = req.body;
    if (!Array.isArray(addresses)) addresses = [];
    if (addresses.length > 3) {
      return res.status(400).json({ message: "Tối đa 3 địa chỉ" });
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { addresses },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
    res.json({ success: true, addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật địa chỉ", error: error.message });
  }
});

// Cập nhật thông tin cá nhân (name, email, avatar)
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { name, email, avatar, phone } = req.body;
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (email !== undefined) updateFields.email = email;
    if (avatar !== undefined) updateFields.avatar = avatar;
    if (phone !== undefined) updateFields.phone = phone;

    const user = await User.findByIdAndUpdate(
      userId,
      updateFields,
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    res.json({
      success: true,
      message: "Cập nhật thông tin cá nhân thành công",
      user
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật thông tin cá nhân", error: error.message });
  }
});

router.get("/profile", authMiddleware, (req, res) => {
  res.json({
    message: "Truy cập thành công",
    user: req.user
  });
});

// Lấy thông tin giao hàng mặc định
router.get("/shipping-info", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    res.json({ 
      success: true,
      shippingInfo: user.defaultShippingInfo || { 
        customerName: "", 
        phone: "", 
        address: "" 
      } 
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

// Cập nhật thông tin giao hàng mặc định
router.put("/shipping-info", authMiddleware, async (req, res) => {
  try {
    const { customerName, phone, address } = req.body;
    const userId = req.user.id || req.user._id;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        defaultShippingInfo: { 
          customerName: customerName || "", 
          phone: phone || "", 
          address: address || "" 
        } 
      },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    
    res.json({ 
      success: true,
      message: "Đã lưu thông tin giao hàng",
      shippingInfo: user.defaultShippingInfo 
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lưu thông tin", error: error.message });
  }
});

module.exports = router;
