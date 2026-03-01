const mongoose = require("mongoose");

const flashSaleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Tên chương trình flash sale là bắt buộc"],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: [true, "Sản phẩm là bắt buộc"]
  },
  originalPrice: {
    type: Number,
    required: [true, "Giá gốc là bắt buộc"]
  },
  salePrice: {
    type: Number,
    required: [true, "Giá sale là bắt buộc"],
    validate: {
      validator: function(value) {
        return value < this.originalPrice;
      },
      message: "Giá sale phải thấp hơn giá gốc"
    }
  },
  discountPercent: {
    type: Number,
    min: [0, "Phần trăm giảm giá không hợp lệ"],
    max: [100, "Phần trăm giảm giá không hợp lệ"]
  },
  quantity: {
    type: Number,
    required: [true, "Số lượng sản phẩm sale là bắt buộc"],
    min: [1, "Số lượng phải lớn hơn 0"]
  },
  sold: {
    type: Number,
    default: 0
  },
  startTime: {
    type: Date,
    required: [true, "Thời gian bắt đầu là bắt buộc"]
  },
  endTime: {
    type: Date,
    required: [true, "Thời gian kết thúc là bắt buộc"],
    validate: {
      validator: function(value) {
        return value > this.startTime;
      },
      message: "Thời gian kết thúc phải sau thời gian bắt đầu"
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  maxPerUser: {
    type: Number,
    default: 5,
    min: [1, "Số lượng tối đa mỗi người phải lớn hơn 0"]
  },
  purchases: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    quantity: {
      type: Number,
      default: 1
    },
    purchasedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for performance
flashSaleSchema.index({ product: 1 });
flashSaleSchema.index({ isActive: 1, startTime: 1, endTime: 1 });
flashSaleSchema.index({ startTime: 1, endTime: 1 });

// Pre-save middleware to calculate discount percent
flashSaleSchema.pre('save', async function() {
  if (this.originalPrice && this.salePrice) {
    this.discountPercent = Math.round(((this.originalPrice - this.salePrice) / this.originalPrice) * 100);
  }
});

// Virtual for checking if flash sale is active
flashSaleSchema.virtual('isLive').get(function() {
  const now = new Date();
  return this.isActive &&
         this.startTime <= now &&
         this.endTime >= now &&
         this.sold < this.quantity;
});

// Virtual for remaining quantity
flashSaleSchema.virtual('remaining').get(function() {
  return Math.max(0, this.quantity - this.sold);
});

// Virtual for time status
flashSaleSchema.virtual('timeStatus').get(function() {
  const now = new Date();
  if (now < this.startTime) return 'upcoming';
  if (now > this.endTime) return 'ended';
  return 'live';
});

// Method to check if user can buy
flashSaleSchema.methods.canUserBuy = function(userId, requestedQty = 1) {
  // Check if flash sale is live
  if (!this.isLive) {
    return { canBuy: false, reason: 'Flash sale không còn hiệu lực' };
  }

  // Check remaining quantity
  if (this.remaining < requestedQty) {
    return { canBuy: false, reason: 'Không đủ số lượng' };
  }

  // Check user's purchase history
  const userPurchases = this.purchases.filter(p => 
    p.user.toString() === userId.toString()
  );
  const totalBought = userPurchases.reduce((sum, p) => sum + p.quantity, 0);

  if (totalBought + requestedQty > this.maxPerUser) {
    return { 
      canBuy: false, 
      reason: `Bạn chỉ có thể mua tối đa ${this.maxPerUser} sản phẩm. Đã mua: ${totalBought}` 
    };
  }

  return { canBuy: true };
};

// Method to record purchase
flashSaleSchema.methods.recordPurchase = async function(userId, quantity) {
  const check = this.canUserBuy(userId, quantity);
  if (!check.canBuy) {
    throw new Error(check.reason);
  }

  this.purchases.push({
    user: userId,
    quantity: quantity
  });
  this.sold += quantity;

  await this.save();
  return this;
};

module.exports = mongoose.model("FlashSale", flashSaleSchema);
