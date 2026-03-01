const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: String,
  image: String,
  category: String,
  stock: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  discount: {
    type: {
      type: String, // 'percent' hoặc 'amount'
      enum: ['percent', 'amount'],
      default: null
    },
    value: {
      type: Number,
      default: 0
    },
    start: Date, // thời gian bắt đầu sale
    end: Date    // thời gian kết thúc sale
  }
}, { timestamps: true });

// Indexes for better query performance
productSchema.index({ name: 'text', description: 'text' }); // Full-text search
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ averageRating: -1 });
productSchema.index({ stock: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ category: 1, price: 1 }); // Compound index

// Virtual for effective price after discount
productSchema.virtual('effectivePrice').get(function() {
  if (!this.discount || !this.discount.value) return this.price;
  
  const now = new Date();
  if (this.discount.start && now < this.discount.start) return this.price;
  if (this.discount.end && now > this.discount.end) return this.price;
  
  if (this.discount.type === 'percent') {
    return this.price * (1 - this.discount.value / 100);
  } else if (this.discount.type === 'amount') {
    return Math.max(0, this.price - this.discount.value);
  }
  
  return this.price;
});

module.exports = mongoose.model("Product", productSchema);
