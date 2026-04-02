const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, "Mã khuyến mãi là bắt buộc"],
    unique: true,
    uppercase: true,
    trim: true,
    minlength: [3, "Mã khuyến mãi phải có ít nhất 3 ký tự"],
    maxlength: [20, "Mã khuyến mãi không quá 20 ký tự"]
  },
  description: {
    type: String,
    required: [true, "Mô tả khuyến mãi là bắt buộc"],
    trim: true
  },
  type: {
    type: String,
    enum: ["percentage", "fixed"],
    required: [true, "Loại khuyến mãi là bắt buộc"]
  },
  value: {
    type: Number,
    required: [true, "Giá trị khuyến mãi là bắt buộc"],
    min: [0, "Giá trị khuyến mãi phải lớn hơn 0"]
  },
  minOrderValue: {
    type: Number,
    default: 0,
    min: [0, "Giá trị đơn hàng tối thiểu không hợp lệ"]
  },
  maxDiscount: {
    type: Number,
    default: null, // null = không giới hạn
    min: [0, "Giá trị giảm tối đa không hợp lệ"]
  },
  startDate: {
    type: Date,
    required: [true, "Ngày bắt đầu là bắt buộc"]
  },
  endDate: {
    type: Date,
    required: [true, "Ngày kết thúc là bắt buộc"]
  },
  usageLimit: {
    type: Number,
    default: null, // null = không giới hạn
    min: [0, "Số lần sử dụng không hợp lệ"]
  },
  usedCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    usedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for performance
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

// Virtual for checking if coupon is valid
couponSchema.virtual('isValid').get(function() {
  const now = new Date();
  return this.isActive &&
         this.startDate <= now &&
         this.endDate >= now &&
         (this.usageLimit === null || this.usedCount < this.usageLimit);
});

// Method to check if user can use this coupon
couponSchema.methods.canBeUsedBy = function(userId) {
  if (!userId) return true; // Allow if no userId provided
  
  // Check if user has already used this coupon
  const alreadyUsed = this.usedBy.some(usage => 
    usage.user && usage.user.toString() === userId.toString()
  );
  return !alreadyUsed;
};

// Method to apply coupon
couponSchema.methods.applyCoupon = function(orderTotal) {
  if (!this.isValid) {
    throw new Error("Mã khuyến mãi không hợp lệ");
  }

  const minOrderValue = this.minOrderValue || 0;
  if (orderTotal < minOrderValue) {
    throw new Error(`Đơn hàng tối thiểu ${minOrderValue.toLocaleString('vi-VN')}đ`);
  }

  if (this.usageLimit !== null && this.usedCount >= this.usageLimit) {
    throw new Error("Mã khuyến mãi đã hết lượt sử dụng");
  }

  let discount = 0;
  if (this.type === "percentage") {
    discount = (orderTotal * this.value) / 100;
    if (this.maxDiscount && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }
  } else {
    discount = this.value;
  }

  return Math.min(discount, orderTotal);
};

module.exports = mongoose.model("Coupon", couponSchema);
