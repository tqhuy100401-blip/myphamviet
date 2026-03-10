const mongoose = require("mongoose");

const returnSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  reason: {
    type: String,
    required: true,
    enum: [
      "Sản phẩm bị lỗi",
      "Sản phẩm không đúng mô tả",
      "Giao sai sản phẩm",
      "Sản phẩm hư hỏng khi nhận",
      "Không còn nhu cầu",
      "Khác"
    ]
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  images: [{
    type: String // URLs của ảnh chứng minh
  }],
  type: {
    type: String,
    required: true,
    enum: ["return", "exchange"], // Trả hàng hoặc đổi hàng
    default: "return"
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "processing", "completed", "cancelled"],
    default: "pending"
  },
  adminNote: {
    type: String,
    maxlength: 500
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  processedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index để tìm kiếm
returnSchema.index({ user: 1, status: 1 });
returnSchema.index({ order: 1 });

module.exports = mongoose.model("Return", returnSchema);
